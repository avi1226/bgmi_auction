import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Timer, Activity, ShieldCheck } from 'lucide-react';
import { getYouTubeEmbedUrl } from '../utils';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [players, setPlayers] = useState([]);
    const [activeAuctionCode, setActiveAuctionCode] = useState(null);
    const [pendingPlayers, setPendingPlayers] = useState([]);
    const [verifiedPlayers, setVerifiedPlayers] = useState([]);
    const [viewingPlayer, setViewingPlayer] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/players');
                setPlayers(data);
                setPendingPlayers(data.filter(p => (p.verification_status || 'PENDING') === 'PENDING'));
                setVerifiedPlayers(data.filter(p => (p.verification_status || 'PENDING') === 'VERIFIED'));
            } catch (error) {
                console.error("Failed to fetch players:", error);
            }
        };
        fetchData();
    }, []);

    const verifyPlayer = async (playerId, status) => {
        try {
            await api.put(`/players/${playerId}/verify`, { status });
            // Refresh logic - optimistic update
            setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, verification_status: status } : p));
            setPendingPlayers(prev => prev.filter(p => p.id !== playerId));
            if (status === 'VERIFIED') {
                const updatedPlayer = players.find(p => p.id === playerId);
                if (updatedPlayer) setVerifiedPlayers(prev => [...prev, { ...updatedPlayer, verification_status: status }]);
            }
        } catch (error) {
            console.error("Verification failed:", error);
            alert(error.response?.data?.message || "Failed to update status. Check backend connection.");
        }
    };

    const startAuction = async (playerId) => {
        try {
            const { data } = await api.post('/auction/start', { playerId });
            setActiveAuctionCode(data.auctionCode);
            // Optional: Scroll to top to see code
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error("Auction Start Error:", error);
            alert(error.response?.data?.message || 'Failed to start auction');
        }
    };

    return (
        <div className="p-8 bg-esports-dark min-h-screen relative">
             <div className="flex justify-between items-center mb-12">
                 <div>
                     <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                        Admin <span className="text-esports-accent">Control</span>
                     </h1>
                     <p className="text-gray-400 mt-2">Manage players, teams, and live auctions.</p>
                 </div>
                 {activeAuctionCode && (
                     <div className="bg-esports-accent/20 border border-esports-accent p-4 rounded-xl animate-pulse">
                         <div className="text-xs text-esports-accent uppercase tracking-widest font-bold">Active Session Code</div>
                         <div className="text-3xl font-mono text-white tracking-[0.5em] font-bold">{activeAuctionCode}</div>
                     </div>
                 )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                 <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                     <div className="flex items-center justify-between">
                         <h3 className="text-gray-400 uppercase text-xs font-bold">Total Players</h3>
                         <Users className="w-5 h-5 text-esports-highlight" />
                     </div>
                     <div className="text-4xl font-black text-white mt-4">{players.length}</div>
                 </div>
                 <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                     <div className="flex items-center justify-between">
                         <h3 className="text-gray-400 uppercase text-xs font-bold">Pending Review</h3>
                         <Activity className="w-5 h-5 text-orange-400" />
                     </div>
                     <div className="text-4xl font-black text-white mt-4">{pendingPlayers.length}</div>
                 </div>
                 <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                     <div className="flex items-center justify-between">
                         <h3 className="text-gray-400 uppercase text-xs font-bold">Verified</h3>
                         <ShieldCheck className="w-5 h-5 text-green-400" />
                     </div>
                     <div className="text-4xl font-black text-white mt-4">{verifiedPlayers.length}</div>
                 </div>
                 <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                     <div className="flex items-center justify-between">
                         <h3 className="text-gray-400 uppercase text-xs font-bold">Sold Players</h3>
                         <Timer className="w-5 h-5 text-yellow-400" />
                     </div>
                     <div className="text-4xl font-black text-white mt-4">{players.filter(p => p.is_sold).length}</div>
                 </div>
             </div>

             {/* Pending Approvals Section */}
             {pendingPlayers.length > 0 && (
                <div className="bg-gray-900/60 backdrop-blur rounded-2xl border border-orange-500/30 overflow-hidden mb-12">
                     <div className="px-6 py-4 border-b border-gray-800 bg-orange-900/20">
                         <h2 className="text-xl font-bold text-orange-400 flex items-center">
                            <Activity className="w-5 h-5 mr-3" />
                            Pending Verification
                         </h2>
                     </div>
                     <div className="overflow-x-auto">
                         <table className="w-full text-left text-gray-400">
                             <thead className="bg-gray-800/50 text-xs uppercase font-bold text-gray-500">
                                 <tr>
                                     <th className="px-6 py-3">Player</th>
                                     <th className="px-6 py-3">Role</th>
                                     <th className="px-6 py-3">Details</th>
                                     <th className="px-6 py-3 text-right">Action</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-800">
                                 {pendingPlayers.map(player => (
                                     <tr key={player.id} className="hover:bg-gray-800/30 transition">
                                         <td 
                                            className="px-6 py-4 font-medium text-white cursor-pointer hover:text-esports-accent underline decoration-dotted"
                                            onClick={() => setViewingPlayer(player)}
                                         >
                                            {player.name}
                                         </td>
                                         <td className="px-6 py-4">{player.role}</td>
                                         <td className="px-6 py-4 text-xs">
                                            KD: {player.kd_ratio} | Exp: {player.experience_years}y | Tier: {player.tier}
                                         </td>
                                         <td className="px-6 py-4 text-right space-x-2">
                                             <button 
                                                onClick={(e) => { e.stopPropagation(); verifyPlayer(player.id, 'VERIFIED'); }}
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold uppercase"
                                             >
                                                 Approve
                                             </button>
                                             <button 
                                                onClick={(e) => { e.stopPropagation(); verifyPlayer(player.id, 'REJECTED'); }}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold uppercase"
                                             >
                                                 Reject
                                             </button>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                </div>
             )}

             {/* Auction Queue (Verified Players Only) */}
             <div className="bg-gray-900/60 backdrop-blur rounded-2xl border border-gray-800 overflow-hidden">
                 <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                     <h2 className="text-xl font-bold text-white flex items-center">
                        <Activity className="w-5 h-5 mr-3 text-esports-accent" />
                        Auction Queue (Verified Only)
                     </h2>
                 </div>
                 <div className="overflow-x-auto">
                     <table className="w-full text-left text-gray-400">
                         <thead className="bg-gray-800/50 text-xs uppercase font-bold text-gray-500">
                             <tr>
                                 <th className="px-6 py-3">Player</th>
                                 <th className="px-6 py-3">Role</th>
                                 <th className="px-6 py-3">Base Price</th>
                                 <th className="px-6 py-3">Status</th>
                                 <th className="px-6 py-3 text-right">Action</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-800">
                             {verifiedPlayers.map(player => (
                                 <tr key={player.id} className="hover:bg-gray-800/30 transition">
                                     <td 
                                         className="px-6 py-4 font-medium text-white cursor-pointer hover:text-esports-accent"
                                         onClick={() => setViewingPlayer(player)}
                                     >
                                        {player.name}
                                     </td>
                                     <td className="px-6 py-4">
                                         <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${player.role === 'IGL' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                             {player.role}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4 font-mono text-gray-300">₹{player.base_price.toLocaleString()}</td>
                                     <td className="px-6 py-4">
                                         {player.is_sold ? (
                                             <span className="text-green-500 font-bold flex items-center">
                                                 SOLD <span className="text-gray-600 text-xs ml-2">(₹{player.sold_price.toLocaleString()})</span>
                                             </span>
                                         ) : (
                                             <span className="text-yellow-500 font-bold">UNSOLD</span>
                                         )}
                                     </td>
                                     <td className="px-6 py-4 text-right">
                                         {!player.is_sold && (
                                             <button 
                                                onClick={(e) => { e.stopPropagation(); startAuction(player.id); }}
                                                className="bg-esports-accent hover:bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition transform hover:scale-105 shadow-lg"
                                             >
                                                 Start Auction
                                             </button>
                                         )}
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                     {verifiedPlayers.length === 0 && <div className="p-8 text-center text-gray-500">No verified players available for auction</div>}
                 </div>
             </div>
        
            {/* Player Details Modal */}
            {viewingPlayer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setViewingPlayer(null)}>
                    <div className="bg-esports-dark border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setViewingPlayer(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                        
                        <div className="p-8">
                            <div className="flex items-center space-x-6 mb-8">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-black text-white">
                                    {viewingPlayer.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{viewingPlayer.name}</h2>
                                    <div className="flex space-x-2 mt-2">
                                        <span className="bg-gray-800 px-3 py-1 rounded text-xs font-bold uppercase text-gray-300">{viewingPlayer.role}</span>
                                        <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                                            (viewingPlayer.verification_status || 'PENDING') === 'VERIFIED' ? 'bg-green-500/20 text-green-500' :
                                            (viewingPlayer.verification_status || 'PENDING') === 'REJECTED' ? 'bg-red-500/20 text-red-500' :
                                            'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                            {viewingPlayer.verification_status || 'PENDING'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                    <div className="text-gray-500 text-xs uppercase font-bold mb-1">K/D Ratio</div>
                                    <div className="text-2xl font-mono text-white">{viewingPlayer.kd_ratio}</div>
                                </div>
                                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                    <div className="text-gray-500 text-xs uppercase font-bold mb-1">Tier</div>
                                    <div className="text-2xl font-mono text-white">{viewingPlayer.tier}</div>
                                </div>
                                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                    <div className="text-gray-500 text-xs uppercase font-bold mb-1">Experience</div>
                                    <div className="text-2xl font-mono text-white">{viewingPlayer.experience_years} Years</div>
                                </div>
                                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                    <div className="text-gray-500 text-xs uppercase font-bold mb-1">Base Price</div>
                                    <div className="text-2xl font-mono text-white">₹{viewingPlayer.base_price.toLocaleString()}</div>
                                </div>
                            </div>
                            
                            {/* Verification Documents */}
                            <div className="mb-8 p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                                <h3 className="text-gray-400 uppercase text-xs font-bold mb-4 flex items-center">
                                    <ShieldCheck className="w-4 h-4 mr-2 text-esports-accent" />
                                    Verification Documents
                                </h3>
                                
                                {(!viewingPlayer.profile_screenshot && !viewingPlayer.rank_proof_image) ? (
                                    <div className="text-center py-8 text-gray-500 italic border-2 border-dashed border-gray-700 rounded-xl">
                                        No verification proofs have been uploaded by this player yet.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {viewingPlayer.profile_screenshot && (
                                            <div>
                                                <h4 className="text-gray-500 text-[10px] uppercase font-bold mb-2">Profile Proof</h4>
                                                <a href={viewingPlayer.profile_screenshot} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-gray-600 hover:border-esports-accent transition group relative">
                                                    <img 
                                                        src={viewingPlayer.profile_screenshot} 
                                                        alt="Profile Proof" 
                                                        className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                                                        onError={(e) => {e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';}}
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                        <span className="text-white text-xs font-bold uppercase tracking-widest border border-white px-3 py-1 rounded">View Full</span>
                                                    </div>
                                                </a>
                                            </div>
                                        )}
                                        {viewingPlayer.rank_proof_image && (
                                            <div>
                                                <h4 className="text-gray-500 text-[10px] uppercase font-bold mb-2">Rank Proof</h4>
                                                <a href={viewingPlayer.rank_proof_image} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-gray-600 hover:border-esports-accent transition group relative">
                                                    <img 
                                                        src={viewingPlayer.rank_proof_image} 
                                                        alt="Rank Proof" 
                                                        className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                                                        onError={(e) => {e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';}}
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                        <span className="text-white text-xs font-bold uppercase tracking-widest border border-white px-3 py-1 rounded">View Full</span>
                                                    </div>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Videos Grid */}
                            <div className="grid grid-cols-1 gap-6 mb-8">
                                {/* Legacy video_link support */}
                                {viewingPlayer.video_link && !viewingPlayer.video_links?.includes(viewingPlayer.video_link) && (
                                     <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-gray-700 shadow-2xl relative">
                                         {getYouTubeEmbedUrl(viewingPlayer.video_link) ? (
                                            <iframe 
                                                width="100%" 
                                                height="100%"
                                                src={getYouTubeEmbedUrl(viewingPlayer.video_link)} 
                                                title="Player Gameplay" 
                                                frameBorder="0" 
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                allowFullScreen
                                                className="w-full h-full object-cover"
                                            ></iframe>
                                         ) : (
                                            <video 
                                                controls
                                                className="w-full h-full object-cover"
                                                src={viewingPlayer.video_link}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                         )}
                                    </div>
                                )}

                                {/* New video_links array support */}
                                {viewingPlayer.video_links && viewingPlayer.video_links.map((link, index) => (
                                    <div key={index} className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-gray-700 shadow-2xl relative">
                                        <h4 className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">Video {index + 1}</h4>
                                         {getYouTubeEmbedUrl(link) ? (
                                            <iframe 
                                                width="100%" 
                                                height="100%"
                                                src={getYouTubeEmbedUrl(link)} 
                                                title={`Player Gameplay ${index + 1}`}
                                                frameBorder="0" 
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                allowFullScreen
                                                className="w-full h-full object-cover"
                                            ></iframe>
                                         ) : (
                                            <video 
                                                controls
                                                className="w-full h-full object-cover"
                                                src={link}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                         )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex space-x-4 border-t border-gray-800 pt-6">
                                {(viewingPlayer.verification_status || 'PENDING') === 'PENDING' && (
                                    <>
                                        <button 
                                            onClick={() => { verifyPlayer(viewingPlayer.id, 'VERIFIED'); setViewingPlayer(null); }}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl uppercase tracking-wider transition"
                                        >
                                            Approve Player
                                        </button>
                                        <button 
                                            onClick={() => { verifyPlayer(viewingPlayer.id, 'REJECTED'); setViewingPlayer(null); }}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl uppercase tracking-wider transition"
                                        >
                                            Reject Player
                                        </button>
                                    </>
                                )}
                                {(viewingPlayer.verification_status === 'VERIFIED' && !viewingPlayer.is_sold) && (
                                    <button 
                                        onClick={() => { startAuction(viewingPlayer.id); setViewingPlayer(null); }}
                                        className="w-full bg-esports-accent hover:bg-indigo-600 text-white font-bold py-3 rounded-xl uppercase tracking-wider transition"
                                    >
                                        Start Auction Immediately
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
