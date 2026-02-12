import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Timer, Activity, Shield_Check } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [players, setPlayers] = useState([]);
    const [activeAuctionCode, setActiveAuctionCode] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/players');
                setPlayers(data);
            } catch (error) {
                console.error("Failed to fetch players:", error);
            }
        };
        fetchData();
    }, []);

    const startAuction = async (playerId) => {
        try {
            const { data } = await api.post('/auction/start', { playerId });
            alert(`Auction Started! Code: ${data.auctionCode}`);
            setActiveAuctionCode(data.auctionCode);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to start auction');
        }
    };

    return (
        <div className="p-8 bg-esports-dark min-h-screen">
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

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                 <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                     <div className="flex items-center justify-between">
                         <h3 className="text-gray-400 uppercase text-xs font-bold">Total Players</h3>
                         <Users className="w-5 h-5 text-esports-highlight" />
                     </div>
                     <div className="text-4xl font-black text-white mt-4">{players.length}</div>
                 </div>
                 <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                     <div className="flex items-center justify-between">
                         <h3 className="text-gray-400 uppercase text-xs font-bold">Sold Players</h3>
                         <Shield_Check className="w-5 h-5 text-green-400" />
                     </div>
                     <div className="text-4xl font-black text-white mt-4">{players.filter(p => p.is_sold).length}</div>
                 </div>
                 <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                     <div className="flex items-center justify-between">
                         <h3 className="text-gray-400 uppercase text-xs font-bold">Pending</h3>
                         <Timer className="w-5 h-5 text-yellow-400" />
                     </div>
                     <div className="text-4xl font-black text-white mt-4">{players.filter(p => !p.is_sold).length}</div>
                 </div>
             </div>

             <div className="bg-gray-900/60 backdrop-blur rounded-2xl border border-gray-800 overflow-hidden">
                 <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                     <h2 className="text-xl font-bold text-white flex items-center">
                        <Activity className="w-5 h-5 mr-3 text-esports-accent" />
                        Auction Queue
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
                             {players.map(player => (
                                 <tr key={player.id} className="hover:bg-gray-800/30 transition">
                                     <td className="px-6 py-4 font-medium text-white">{player.name}</td>
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
                                                onClick={() => startAuction(player.id)}
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
                 </div>
             </div>
        </div>
    );
};

export default AdminDashboard;
