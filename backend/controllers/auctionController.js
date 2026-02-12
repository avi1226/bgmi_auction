const Player = require('../models/Player');
const TeamOwner = require('../models/TeamOwner');
const AuctionSession = require('../models/AuctionSession');
const Transaction = require('../models/Transaction');

let activeAuction = {
  playerId: null,
  timer: null,
  endTime: null,
  auctionCode: null // Store temporary code
};

const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

// Internal function to handle auction end (sold)
const endAuctionInternal = async (io, playerId) => {
  try {
    console.log(`Ending auction for player ${playerId}`);
    
    // Get final state - ONGOING session
    const session = await AuctionSession.findOne({ player_id: playerId, status: 'ONGOING' }).sort({ createdAt: -1 });

    if (!session) {
        console.log("No ongoing session found to end.");
        return; 
    }

    const { highest_bidder_id, current_bid, id: sessionId } = session;

    if (highest_bidder_id) {
      await TeamOwner.findByIdAndUpdate(highest_bidder_id, { $inc: { budget: -current_bid } });
      
      await Player.findByIdAndUpdate(playerId, { 
          is_sold: true, 
          sold_price: current_bid, 
          team_id: highest_bidder_id 
      });
      
      session.status = 'COMPLETED';
      session.end_time = Date.now();
      await session.save();

      await Transaction.create({
          team_id: highest_bidder_id,
          player_id: playerId,
          amount: current_bid
      });

      io.emit('auction_update', {
        type: 'SOLD',
        payload: {
          playerId,
          soldPrice: current_bid,
          winnerTeamId: highest_bidder_id
        }
      });
      console.log(`Player ${playerId} sold to team ${highest_bidder_id} for ${current_bid}`);
    } else {
       session.status = 'UNSOLD';
       session.end_time = Date.now();
       await session.save();

       io.emit('auction_update', {
         type: 'UNSOLD',
         payload: { playerId }
       });
       console.log(`Player ${playerId} unsold`);
    }

    // Important: Do not clear 'auctionCode' here, admin keeps same code for session? 
    // Usually auction lasts for multiple players. 
    // Let's keep code persistent until admin explicitly stops/resets or server restarts for simplicity.
    // Or better: Is the code per-player or per-session? Usually per session.
    // Let's assume the code is for the *event*.
    // But here activeAuction is reset. Let's make auctionCode global or persistent.
    
    // We will ONLY clear player-specific state.
    activeAuction.playerId = null; 
    activeAuction.timer = null;
    activeAuction.endTime = null;

  } catch (error) {
    console.error("Error ending auction:", error);
  }
};

// Start Auction (Admin Generates Code First or just starts directly?)
// Modified: Admin "Opens" the room first? 
// Current flow: Admin picks player -> Start.
// Let's add an explicit "Create Room" step or just generate code on first player start.
// Better: Admin usually starts the event.
// Let's keep existing flow: Start Player -> Generates Code if not exists.

exports.startAuction = async (req, res) => {
  const { playerId } = req.body;
  const io = req.app.get('socketio');

  try {
    // Generate code if not exists for this runtime
    if (!activeAuction.auctionCode) {
        activeAuction.auctionCode = generateCode();
    }

    const player = await Player.findOne({ _id: playerId, is_sold: false });
    if (!player) return res.status(400).json({ message: 'Player not found or already sold' });

    const initialBid = player.base_price;

    await AuctionSession.create({
        player_id: playerId,
        current_bid: initialBid,
        status: 'ONGOING',
    });

    if (activeAuction.timer) clearTimeout(activeAuction.timer);
    
    activeAuction.playerId = playerId;
    const duration = 30000;
    activeAuction.endTime = Date.now() + duration;

    activeAuction.timer = setTimeout(() => {
        endAuctionInternal(io, playerId);
    }, duration);

    io.emit('auction_update', {
      type: 'START',
      payload: {
        player,
        currentBid: initialBid,
        highestBidderId: null,
        endTime: activeAuction.endTime,
        auctionCode: activeAuction.auctionCode // Broadcast code to admin? No, return in response
      }
    });

    res.json({ 
        message: 'Auction started', 
        player, 
        endTime: activeAuction.endTime,
        auctionCode: activeAuction.auctionCode 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Join Auction (Verify Code)
exports.joinAuction = async (req, res) => {
    const { code } = req.body;
    if (!activeAuction.auctionCode) {
        return res.status(400).json({ message: 'No active auction event found. Admin must start one.' });
    }
    if (code === activeAuction.auctionCode) {
        return res.json({ success: true, message: 'Joined successfully' });
    }
    return res.status(400).json({ message: 'Invalid Auction Code' });
};

// Place Bid
exports.placeBid = async (req, res) => {
  const { teamId, amount } = req.body;
  const io = req.app.get('socketio');

  if (!activeAuction.playerId) return res.status(400).json({ message: 'No active player on auction' });

  try {
    const team = await TeamOwner.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    
    if (team.budget < amount) {
      return res.status(400).json({ message: 'Insufficient budget', currentBudget: team.budget });
    }

    const session = await AuctionSession.findOne({ player_id: activeAuction.playerId, status: 'ONGOING' }).sort({ createdAt: -1 });

    if (!session) return res.status(400).json({ message: 'Auction session not found' });

    const currentBid = session.current_bid;
    if (amount <= currentBid) {
      return res.status(400).json({ message: 'Bid must be higher than current bid' });
    }

    session.current_bid = amount;
    session.highest_bidder_id = teamId;
    await session.save();

    if (activeAuction.timer) clearTimeout(activeAuction.timer);
    
    const duration = 30000;
    activeAuction.endTime = Date.now() + duration; 
    activeAuction.timer = setTimeout(() => {
        endAuctionInternal(io, activeAuction.playerId);
    }, duration);

    io.emit('auction_update', {
      type: 'BID',
      payload: {
        playerId: activeAuction.playerId,
        currentBid: amount,
        highestBidderId: teamId,
        teamName: team.team_name,
        endTime: activeAuction.endTime
      }
    });

    res.json({ message: 'Bid placed successfully', newEndTime: activeAuction.endTime });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.stopAuction = async (req, res) => {
   const io = req.app.get('socketio');
   if (activeAuction.timer) {
       clearTimeout(activeAuction.timer);
       await endAuctionInternal(io, activeAuction.playerId);
       return res.json({ message: 'Auction stopped manually' });
   }
   res.status(400).json({ message: 'No active auction to stop' });
};

exports.getAuctionState = async (req, res) => {
    // Return code status essentially (is event active?)
    if (activeAuction.playerId) {
        const player = await Player.findById(activeAuction.playerId);
        const session = await AuctionSession.findOne({ player_id: activeAuction.playerId, status: 'ONGOING' }).sort({ createdAt: -1 });
        
        if (player && session) {
            return res.json({
                active: true,
                eventActive: true,
                player: player,
                currentBid: session.current_bid,
                highestBidderId: session.highest_bidder_id,
                endTime: activeAuction.endTime
            });
        }
    }
    // If just code is active but no player
    if (activeAuction.auctionCode) {
        return res.json({ active: false, eventActive: true });
    }
    res.json({ active: false, eventActive: false });
};
