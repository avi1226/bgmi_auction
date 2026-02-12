const pool = require('../config/db');

// In-memory state for active auction (for simplicity in MVP)
let activeAuction = {
  playerId: null,
  timer: null,
  endTime: null
};

// Internal function to handle auction end (sold)
const endAuctionInternal = async (io, playerId) => {
  try {
    console.log(`Ending auction for player ${playerId}`);
    
    // Get final state
    // We need to fetch the LATEST session for this player that was ONGOING.
    const [sessions] = await pool.query(
      'SELECT * FROM auction_sessions WHERE player_id = ? AND status = "ONGOING" ORDER BY id DESC LIMIT 1',
      [playerId]
    );

    if (sessions.length === 0) {
        console.log("No ongoing session found to end.");
        return; 
    }

    const session = sessions[0];
    const { highest_bidder_id, current_bid, id: sessionId } = session;

    if (highest_bidder_id) {
      // Deduct budget
      await pool.query('UPDATE team_owners SET budget = budget - ? WHERE id = ?', [current_bid, highest_bidder_id]);
      
      // Update Player Status
      await pool.query('UPDATE players SET is_sold = 1, sold_price = ?, team_id = ? WHERE id = ?', [current_bid, highest_bidder_id, playerId]);
      
      // Update Session Status
      await pool.query('UPDATE auction_sessions SET status = "COMPLETED", end_time = NOW() WHERE id = ?', [sessionId]);

      // Record Transaction
      await pool.query('INSERT INTO transactions (team_id, player_id, amount) VALUES (?, ?, ?)', [highest_bidder_id, playerId, current_bid]);

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
       await pool.query('UPDATE auction_sessions SET status = "UNSOLD", end_time = NOW() WHERE id = ?', [sessionId]);
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
  // Access io from app (passed via req)
  const io = req.app.get('socketio');

  try {
    // Check if player exists and is unsold
    const [players] = await pool.query('SELECT * FROM players WHERE id = ? AND is_sold = 0', [playerId]);
    if (players.length === 0) return res.status(400).json({ message: 'Player not found or already sold' });

    const player = players[0];
    const initialBid = player.base_price;

    // Create auction session
    await pool.query(
      'INSERT INTO auction_sessions (player_id, current_bid, status, start_time) VALUES (?, ?, "ONGOING", NOW())',
      [playerId, initialBid]
    );

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

  // Check if auction is active for ANY player (simplified single auction room)
  // In a real app we'd check req.body.playerId matches activeAuction.playerId
  if (!activeAuction.playerId) return res.status(400).json({ message: 'No active auction' });

  try {
    // Validate team and budget
    const [teams] = await pool.query('SELECT * FROM team_owners WHERE id = ?', [teamId]);
    if (teams.length === 0) return res.status(404).json({ message: 'Team not found' });
    
    const team = teams[0];
    if (parseFloat(team.budget) < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient budget', currentBudget: team.budget });
    }

    // Get current session
    const [sessions] = await pool.query(
      'SELECT * FROM auction_sessions WHERE player_id = ? AND status = "ONGOING" ORDER BY id DESC LIMIT 1',
      [activeAuction.playerId]
    );

    if (sessions.length === 0) return res.status(400).json({ message: 'Auction session not found' });

    const currentBid = parseFloat(sessions[0].current_bid);
    // Bid must be strictly greater than current bid? Or equal if no bids?
    // Usually strict increase.
    if (parseFloat(amount) <= currentBid) {
      return res.status(400).json({ message: 'Bid must be higher than current bid' });
    }

    // Update session
    await pool.query(
      'UPDATE auction_sessions SET current_bid = ?, highest_bidder_id = ? WHERE id = ?',
      [amount, teamId, sessions[0].id]
    );

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
        // Fetch details
        const [players] = await pool.query('SELECT * FROM players WHERE id = ?', [activeAuction.playerId]);
        const [sessions] = await pool.query('SELECT * FROM auction_sessions WHERE player_id = ? AND status = "ONGOING" ORDER BY id DESC LIMIT 1', [activeAuction.playerId]);
        
        if (players.length > 0 && sessions.length > 0) {
            return res.json({
                active: true,
                player: players[0],
                currentBid: sessions[0].current_bid,
                highestBidderId: sessions[0].highest_bidder_id,
                endTime: activeAuction.endTime
            });
        }
    }
    res.json({ active: false });
};
