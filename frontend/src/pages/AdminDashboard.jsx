import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [pData, tData] = await Promise.all([
                    api.get('/players'),
                    api.get('/teams')
                ]);
                setPlayers(pData.data);
                setTeams(tData.data);
            } catch (error) {
                console.error("Error fetching admin data:", error);
            }
        };
        fetchAll();
    }, []);

    const startAuctionForPlayer = async (playerId) => {
        try {
            await api.post('/auction/start', { playerId });
            navigate('/auction');
        } catch (error) {
            console.error("Failed to start auction:", error);
            alert("Failed to start auction: " + (error.response?.data?.message || 'Unknown error'));
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-glow">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-esports-light p-6 rounded-lg shadow-lg border border-gray-700">
                    <h2 className="text-xl font-bold text-gray-300 mb-4">Players ({players.length})</h2>
                    <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {players.map(p => (
                            <li key={p.id} className="bg-gray-800 p-3 rounded flex justify-between items-center hover:bg-gray-700 transition">
                                <span className="font-medium text-white">{p.name || p.username}</span>
                                <div className="space-x-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${p.is_sold ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
                                        {p.is_sold ? 'SOLD' : 'UNSOLD'}
                                    </span>
                                    {!p.is_sold && (
                                        <button 
                                            onClick={() => startAuctionForPlayer(p.id)}
                                            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition ml-2"
                                        >
                                            Start Auction
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-esports-light p-6 rounded-lg shadow-lg border border-gray-700">
                     <h2 className="text-xl font-bold text-gray-300 mb-4">Teams ({teams.length})</h2>
                     <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {teams.map(t => (
                            <li key={t.id} className="bg-gray-800 p-3 rounded flex justify-between items-center hover:bg-gray-700 transition">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-300 border border-indigo-700">
                                        {t.team_name.substring(0,2).toUpperCase()}
                                    </div>
                                    <span className="font-medium text-white">{t.team_name}</span>
                                </div>
                                <span className="text-sm text-gray-400">Owner: {t.username}</span>
                            </li>
                        ))}
                     </ul>
                </div>
            </div>

            <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => navigate('/auction')}
                  className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-red-600/30 transform hover:scale-105 transition"
                >
                    Go to Live Auction Control
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
