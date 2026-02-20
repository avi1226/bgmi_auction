import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socket from '../services/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AuctionRoom = () => {
  const { user, role } = useAuth();
  const [activeAuction, setActiveAuction] = useState(null);
  const [timer, setTimer] = useState(30);
  const [bidAmount, setBidAmount] = useState(0);
  const [messages, setMessages] = useState([]);
  
  // Code entry state
  const [hasJoined, setHasJoined] = useState(role === 'admin'); // Admins bypass
  const [auctionCodeInput, setAuctionCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [eventActive, setEventActive] = useState(false); // Is there ANY auction event?

  const navigate = useNavigate();

  useEffect(() => {
    // Only connect if user is logged in
    if (user && !socket.connected) {
      socket.connect();
    }

    // Join room
    socket.emit('join_auction', 'auction_room');

    // Listen for updates
    socket.on('auction_update', (data) => {
      console.log("Auction Update:", data);
      handleAuctionUpdate(data);
    });

    // Check initial state
    fetchAuctionState();

    return () => {
      socket.off('auction_update');
    };
  }, [user]);

  const fetchAuctionState = async () => {
    try {
      const { data } = await api.get('/auction/state');
      setEventActive(data.eventActive || data.active); // If active player or just active event
      
      if (data.active) {
        setActiveAuction({
          player: data.player,
          currentBid: parseFloat(data.currentBid),
          highestBidderId: data.highestBidderId,
          endTime: data.endTime
        });
        setBidAmount(parseFloat(data.currentBid) + 5000); 
      } else {
        setActiveAuction(null);
      }
    } catch (error) {
      console.error("Error fetching state:", error);
    }
  };

  const handleAuctionUpdate = (data) => {
    setEventActive(true); // Any update implies event is active
    
    if (data.type === 'START') {
      setActiveAuction({
        player: data.payload.player,
        currentBid: parseFloat(data.payload.currentBid),
        highestBidderId: null,
        endTime: data.payload.endTime
      });
      setBidAmount(parseFloat(data.payload.currentBid) + 5000);
      setMessages(prev => [...prev, `Auction started for ${data.payload.player.name}`]);
    } else if (data.type === 'BID') {
      setActiveAuction(prev => ({
        ...prev,
        currentBid: parseFloat(data.payload.currentBid),
        highestBidderId: data.payload.highestBidderId,
        endTime: data.payload.endTime
      }));
      setBidAmount(parseFloat(data.payload.currentBid) + 5000);
      setMessages(prev => [...prev, `New Bid: ₹${data.payload.currentBid} by ${data.payload.teamName}`]);
    } else if (data.type === 'SOLD') {
      setMessages(prev => [...prev, `SOLD! ${data.payload.playerId} sold for ₹${data.payload.soldPrice}`]);
      setTimeout(() => setActiveAuction(null), 5000); 
    } else if (data.type === 'UNSOLD') {
      setMessages(prev => [...prev, `Player UNSOLD.`]);
      setTimeout(() => setActiveAuction(null), 5000);
    }
  };

  // Timer logic
  useEffect(() => {
    let interval;
    if (activeAuction?.endTime) {
      interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((new Date(activeAuction.endTime).getTime() - Date.now()) / 1000));
        setTimer(remaining);
        if (remaining <= 0) clearInterval(interval);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeAuction]);

  const handleJoinAuction = async (e) => {
      e.preventDefault();
      try {
          const { data } = await api.post('/auction/join', { code: auctionCodeInput });
          if (data.success) {
              setHasJoined(true);
          }
      } catch (error) {
          setJoinError(error.response?.data?.message || 'Invalid Code');
      }
  };

  const placeBid = async () => {
    if (role !== 'team_owner') return alert("Only Team Owners can bid!");
    try {
      await api.post('/auction/bid', { teamId: user.id, amount: bidAmount });
    } catch (error) {
      alert(error.response?.data?.message || "Bid failed");
    }
  };

  const stopAuction = async () => {
     try {
         await api.post('/auction/stop');
     } catch (e) { console.error(e); }
  };

  // 1. If not joined (and not admin), show Code Entry Screen
  if (!hasJoined) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-esports-dark bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-1.2.1&auto=format&fit=crop&w=2101&q=80')] bg-cover bg-center">
              <div className="bg-black/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-esports-accent w-full max-w-md">
                  <h2 className="text-3xl font-bold text-center text-white mb-2 text-glow">Join Live Auction</h2>
                  <p className="text-center text-gray-400 mb-6">Enter the 6-digit code provided by the Admin.</p>
                  
                  {joinError && <div className="bg-red-500/20 border border-red-500 text-red-400 p-2 rounded mb-4 text-center">{joinError}</div>}
                  
                  <form onSubmit={handleJoinAuction} className="space-y-4">
                      <input 
                        type="text" 
                        value={auctionCodeInput}
                        onChange={(e) => setAuctionCodeInput(e.target.value)}
                        placeholder="Ex: 123456"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-esports-accent transition"
                        maxLength={6}
                      />
                      <button 
                        type="submit" 
                        className="w-full bg-esports-accent hover:bg-indigo-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
                      >
                          ENTER AUCTION
                      </button>
                  </form>
                  <button onClick={() => navigate(-1)} className="mt-4 text-gray-500 hover:text-white w-full text-sm">Cancel</button>
              </div>
          </div>
      )
  }

  // 2. If joined but no active player auction
  if (!activeAuction) {
     return (
         <div className="flex flex-col items-center justify-center h-screen bg-esports-dark text-white">
             <h1 className="text-4xl font-bold mb-4 text-glow animate-pulse">Waiting for next player...</h1>
             <div className="w-16 h-16 border-4 border-t-esports-accent border-gray-700 rounded-full animate-spin"></div>
             <p className="mt-4 text-gray-400">Stay tuned. The admin will start the bidding soon.</p>
             {role === 'admin' && (
                 <button onClick={() => window.location.href = '/admin/dashboard'} className="mt-8 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm">
                     Back to Admin Dashboard
                 </button>
             )}
         </div>
     )
  }

  // 3. Active Auction Room
  return (
    <div className="flex flex-col h-screen bg-esports-dark text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-10 blur-sm pointer-events-none"></div>

        <div className="flex-1 flex flex-col md:flex-row z-10 p-6 md:p-12 gap-8">
            
            <div className="flex-1 flex flex-col space-y-6">
                <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-esports-light/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-gray-700 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${activeAuction.player.role === 'IGL' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}`}>
                            {activeAuction.player.role}
                        </span>
                    </div>

                    <div className="flex flex-col items-center md:items-start md:flex-row gap-6">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-1">
                             <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-4xl font-bold">
                                {activeAuction.player.name ? activeAuction.player.name.charAt(0) : '?'}
                             </div>
                        </div>
                        <div>
                            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                                {activeAuction.player.name}
                            </h2>
                             <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-gray-800/50 p-2 rounded">
                                    <span className="text-gray-400 block text-xs uppercase">K/D Ratio</span>
                                    <span className="font-mono text-lg text-esports-highlight">{activeAuction.player.kd_ratio}</span>
                                </div>
                                <div className="bg-gray-800/50 p-2 rounded">
                                    <span className="text-gray-400 block text-xs uppercase">Tier</span>
                                    <span className="font-mono text-lg text-green-400">{activeAuction.player.tier}</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 mt-4">
                                {activeAuction.player.profile_screenshot && (
                                    <div className="text-center">
                                        <p className="text-gray-500 text-[8px] font-bold uppercase mb-1">Profile Proof</p>
                                        <a href={activeAuction.player.profile_screenshot} target="_blank" rel="noopener noreferrer" className="block w-16 h-10 rounded overflow-hidden border border-gray-700 hover:border-esports-accent transition">
                                            <img src={activeAuction.player.profile_screenshot} alt="Profile" className="w-full h-full object-cover" />
                                        </a>
                                    </div>
                                )}
                                {activeAuction.player.rank_proof_image && (
                                    <div className="text-center">
                                        <p className="text-gray-500 text-[8px] font-bold uppercase mb-1">Rank Proof</p>
                                        <a href={activeAuction.player.rank_proof_image} target="_blank" rel="noopener noreferrer" className="block w-16 h-10 rounded overflow-hidden border border-gray-700 hover:border-esports-accent transition">
                                            <img src={activeAuction.player.rank_proof_image} alt="Rank" className="w-full h-full object-cover" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="flex-1 bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative group">
                    {activeAuction.player.video_link ? (
                           <iframe 
                             width="100%" 
                             height="100%" 
                             src={activeAuction.player.video_link.replace("watch?v=", "embed/")} 
                             title="Gameplay Video"
                             frameBorder="0"
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                             allowFullScreen
                             className="absolute inset-0 w-full h-full"
                           ></iframe>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                            No Gameplay Video Available
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full md:w-1/3 flex flex-col space-y-6">
                 <motion.div 
                    layout
                    className="bg-esports-light/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-gray-700 text-center"
                 >
                     <div className="mb-2 text-gray-400 uppercase text-xs tracking-widest">Current Bid</div>
                     <div className="text-5xl font-black text-green-400 font-mono tracking-tighter">
                        ₹{activeAuction.currentBid.toLocaleString()}
                     </div>
                     
                     <div className="my-6 relative">
                        <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden">
                            <motion.div 
                                className={`h-full ${timer < 10 ? 'bg-red-500' : 'bg-indigo-500'}`}
                                initial={{ width: '100%' }}
                                animate={{ width: `${(timer / 30) * 100}%` }}
                                transition={{ duration: 1, ease: "linear" }}
                            />
                        </div>
                        <div className={`mt-2 font-mono text-2xl font-bold ${timer < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            00:{timer < 10 ? `0${timer}` : timer}
                        </div>
                     </div>

                     {role === 'team_owner' ? (
                         <div className="flex flex-col space-y-3">
                             <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
                                 <span className="pl-3 text-gray-400 select-none">₹</span>
                                 <input 
                                    type="number" 
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    className="bg-transparent text-white w-full focus:outline-none font-mono text-lg p-2"
                                 />
                             </div>
                             <div className="flex space-x-2">
                                 <button 
                                    onClick={() => setBidAmount(prev => parseFloat(prev) + 10000)}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded text-xs font-bold"
                                 >
                                     +10k
                                 </button>
                                 <button 
                                    onClick={() => setBidAmount(prev => parseFloat(prev) + 50000)}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded text-xs font-bold"
                                 >
                                     +50k
                                 </button>
                             </div>
                             <button 
                                onClick={placeBid}
                                className="w-full bg-esports-accent hover:bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 text-xl uppercase tracking-wider"
                             >
                                 PLACE BID
                             </button>
                         </div>
                     ) : (
                         <div className="p-4 bg-gray-800/50 rounded-lg text-sm text-gray-400">
                             {role === 'admin' ? (
                                 <button onClick={stopAuction} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded">
                                     FORCE STOP AUCTION
                                 </button>
                             ) : (
                                 "Spectator Mode"
                             )}
                         </div>
                     )}
                 </motion.div>

                 <div className="flex-1 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800 p-4 overflow-hidden flex flex-col">
                     <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-800 pb-2">Live Activity</h3>
                     <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                         <AnimatePresence>
                             {[...messages].reverse().map((msg, i) => (
                                 <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-sm p-2 bg-gray-800/60 rounded border-l-2 border-esports-accent"
                                 >
                                     {msg}
                                 </motion.div>
                             ))}
                         </AnimatePresence>
                     </div>
                 </div>
            </div>

        </div>
    </div>
  );
};

export default AuctionRoom;
