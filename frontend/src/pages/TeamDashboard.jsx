import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Trophy, Shield, Activity, User, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeamDashboard = () => {
    const { user } = useAuth();
    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTeamData = async () => {
             try {
                 // MongoDB uses _id which is mapped to id in frontend if we use the auth user object correctly
                 // However, let's just fetch by ID from the token user object
                 if (user?.id) {
                     const { data } = await api.get(`/teams/${user.id}`);
                     setTeam(data);
                 }
             } catch (error) {
                 console.error("Failed to fetch team data", error);
             }
        };

        if (user) fetchTeamData();
    }, [user]);

    // Fetch players owned by this team
    useEffect(() => {
        const fetchTeamPlayers = async () => {
            if (user?.id) {
                try {
                    const { data } = await api.get('/players'); // In a real app filtering should happen on backend
                    const myPlayers = data.filter(p => p.team_id === user.id);
                    setPlayers(myPlayers);
                } catch (error) {
                    console.error("Failed to fetch players", error);
                }
            }
        };
        if (user) fetchTeamPlayers();
    }, [user]);

    if (!team) return <div className="flex justify-center items-center h-screen text-white">Loading Team Data...</div>;

    return (
        <div className="p-8 bg-esports-dark min-h-screen text-white">
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-full border-4 border-esports-accent overflow-hidden bg-gray-900 flex items-center justify-center">
                        {team.team_logo ? (
                            <img src={team.team_logo} alt={team.team_name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-black">{team.team_name.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            {team.team_name}
                        </h1>
                        <p className="text-gray-400 font-mono tracking-widest text-sm mt-1 uppercase">Owner Dashboard</p>
                    </div>
                </div>
                
                <button 
                    onClick={() => navigate('/auction')}
                    className="flex items-center space-x-2 bg-gradient-to-r from-esports-accent to-purple-600 px-8 py-4 rounded-xl shadow-2xl hover:scale-105 transform transition font-bold uppercase tracking-wider glow-effect"
                >
                    <Activity className="w-5 h-5 animate-pulse" />
                    <span>Join Auction</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-gray-800/80 backdrop-blur border border-gray-700 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <DollarSign className="w-24 h-24" />
                    </div>
                    <h3 className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-1">Remaining Budget</h3>
                    <div className="text-4xl font-mono font-bold text-green-400">₹{team.budget.toLocaleString()}</div>
                </div>

                <div className="bg-gray-800/80 backdrop-blur border border-gray-700 p-6 rounded-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <Shield className="w-24 h-24" />
                    </div>
                    <h3 className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-1">Squad Size</h3>
                    <div className="text-4xl font-mono font-bold text-blue-400">{players.length} / 6</div>
                </div>

                <div className="bg-gray-800/80 backdrop-blur border border-gray-700 p-6 rounded-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <Trophy className="w-24 h-24" />
                    </div>
                    <h3 className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-1">Status</h3>
                    <div className="text-4xl font-mono font-bold text-yellow-400">{players.length >= 4 ? 'READY' : 'BUILDING'}</div>
                </div>
            </div>

            <h2 className="text-2xl font-bold uppercase tracking-tighter mb-6 flex items-center">
                <User className="w-6 h-6 mr-3 text-esports-accent" />
                Current Roster
            </h2>

            {players.length === 0 ? (
                <div className="bg-gray-900/50 border border-dashed border-gray-700 rounded-xl p-12 text-center text-gray-500">
                    <PlusCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No players acquired yet. Join the auction to build your squad!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {players.map(player => (
                        <div key={player.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col hover:border-esports-accent transition cursor-default">
                             <div className="flex justify-between items-start mb-4">
                                <div className="bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                                    {player.role}
                                </div>
                                <div className="text-green-400 font-mono font-bold text-sm">
                                    ₹{player.sold_price.toLocaleString()}
                                </div>
                             </div>
                             <h3 className="text-2xl font-black italic">{player.name}</h3>
                             <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-400 uppercase">
                                 <div>KD: <span className="text-white">{player.kd_ratio}</span></div>
                                 <div>Tier: <span className="text-white">{player.tier}</span></div>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeamDashboard;
