const Player = require('../models/Player');
const TeamOwner = require('../models/TeamOwner');
const AuctionSession = require('../models/AuctionSession');
const Transaction = require('../models/Transaction');

let activeAuction = {
  playerId: null,
  timer: null,
  endTime: null
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
      // Deduct budget
      // Note: No transaction in single mongo query easily without session, but good enough for MVP
      await TeamOwner.findByIdAndUpdate(highest_bidder_id, { $inc: { budget: -current_bid } });
      
      // Update Player Status
      await Player.findByIdAndUpdate(playerId, { 
          is_sold: true, 
          sold_price: current_bid, 
          team_id: highest_bidder_id 
      });
      
      // Update Session Status
      session.status = 'COMPLETED';
      session.end_time = Date.now();
      await session.save();

      // Record Transaction
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
       // Unsold
       session.status = 'UNSOLD';
       session.end_time = Date.now();
       await session.save();

       io.emit('auction_update', {
         type: 'UNSOLD',
         payload: { playerId }
       });
       console.log(`Player ${playerId} unsold`);
    }

    // Clear active auction
    activeAuction = {
      playerId: null,
      timer: null,
      endTime: null
    };

  } catch (error) {
    console.error("Error ending auction:", error);
  }
};

// Start Auction for a player
exports.startAuction = async (req, res) => {
  const { playerId } = req.body;
  const io = req.app.get('socketio');

  try {
    // Check if player exists and is unsold
    const player = await Player.findOne({ _id: playerId, is_sold: false });
    if (!player) return res.status(400).json({ message: 'Player not found or already sold' });

    const initialBid = player.base_price;

    // Create auction session
    await AuctionSession.create({
        player_id: playerId,
        current_bid: initialBid,
        status: 'ONGOING',
    });

    // Set auction state
    if (activeAuction.timer) clearTimeout(activeAuction.timer);
    
    activeAuction.playerId = playerId;
    // 30 seconds from now
    const duration = 30000;
    activeAuction.endTime = Date.now() + duration;

    // Start server-side timer
    activeAuction.timer = setTimeout(() => {
        endAuctionInternal(io, playerId);
    }, duration);

    // Broadcast
    io.emit('auction_update', {
      type: 'START',
      payload: {
        player,
        currentBid: initialBid,
        highestBidderId: null,
        endTime: activeAuction.endTime
      }
    });

    res.json({ message: 'Auction started', player, endTime: activeAuction.endTime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Place Bid
exports.placeBid = async (req, res) => {
  const { teamId, amount } = req.body;
  const io = req.app.get('socketio');

  if (!activeAuction.playerId) return res.status(400).json({ message: 'No active auction' });

  try {
    // Validate team and budget
    const team = await TeamOwner.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    
    if (team.budget < amount) {
      return res.status(400).json({ message: 'Insufficient budget', currentBudget: team.budget });
    }

    // Get current session
    const session = await AuctionSession.findOne({ player_id: activeAuction.playerId, status: 'ONGOING' }).sort({ createdAt: -1 });

    if (!session) return res.status(400).json({ message: 'Auction session not found' });

    const currentBid = session.current_bid;
    if (amount <= currentBid) {
      return res.status(400).json({ message: 'Bid must be higher than current bid' });
    }

    // Update session
    session.current_bid = amount;
    session.highest_bidder_id = teamId;
    await session.save();

    // Reset Timer
    if (activeAuction.timer) clearTimeout(activeAuction.timer);
    
    const duration = 30000;
    activeAuction.endTime = Date.now() + duration; 
    activeAuction.timer = setTimeout(() => {
        endAuctionInternal(io, activeAuction.playerId);
    }, duration);

    // Broadcast
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

// Manual Stop (Admin)
exports.stopAuction = async (req, res) => {
   const io = req.app.get('socketio');
   if (activeAuction.timer) {
       clearTimeout(activeAuction.timer);
       await endAuctionInternal(io, activeAuction.playerId);
       return res.json({ message: 'Auction stopped manually' });
   }
   res.status(400).json({ message: 'No active auction to stop' });
};

// Get current auction state (for new connections)
exports.getAuctionState = async (req, res) => {
    if (activeAuction.playerId) {
        const player = await Player.findById(activeAuction.playerId);
        const session = await AuctionSession.findOne({ player_id: activeAuction.playerId, status: 'ONGOING' }).sort({ createdAt: -1 });
        
        if (player && session) {
            return res.json({
                active: true,
                player: player,
                currentBid: session.current_bid,
                highestBidderId: session.highest_bidder_id,
                endTime: activeAuction.endTime
            });
        }
    }
    res.json({ active: false });
};
