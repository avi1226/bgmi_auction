import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Activity, Map, Trophy, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlayerDashboard = () => {
    const { user } = useAuth();
    const [player, setPlayer] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlayerData = async () => {
             try {
                if (user?.id) {
                    const { data } = await api.get(`/players/${user.id}`);
                    setPlayer(data);
                }
             } catch (error) {
                 console.error("Failed to fetch player data", error);
             }
        };

        if (user) fetchPlayerData();
    }, [user]);

    if (!player) return <div className="flex justify-center items-center h-screen text-white">Loading Player Data...</div>;

    return (
        <div className="p-8 bg-esports-dark min-h-screen text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-12">
                <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-full border-4 border-esports-accent overflow-hidden bg-gray-900 flex items-center justify-center relative">
                         <User className="absolute inset-0 m-auto text-gray-700 w-12 h-12" />
                         <span className="text-4xl font-black relative z-10">{player.name.charAt(0)}</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            {player.name}
                        </h1>
                        <p className="text-gray-400 font-mono tracking-widest text-sm mt-1 uppercase">Pro Player Profile</p>
                    </div>
                </div>

                <div className="mt-8 md:mt-0 flex gap-4">
                     {player.is_sold ? (
                         <div className="px-6 py-4 bg-green-500/10 border border-green-500 rounded-xl text-green-400 font-bold uppercase tracking-widest flex items-center shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                             <Trophy className="w-5 h-5 mr-3 animate-bounce" />
                             SOLD : ₹{player.sold_price.toLocaleString()}
                         </div>
                     ) : (
                         <div className="px-6 py-4 bg-yellow-500/10 border border-yellow-500 rounded-xl text-yellow-500 font-bold uppercase tracking-widest flex items-center shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                             <Activity className="w-5 h-5 mr-3 animate-pulse" />
                             UNSOLD
                         </div>
                     )}
                     
                     <button 
                        onClick={() => navigate('/auction')}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-wider transition border border-gray-700 hover:border-esports-accent"
                    >
                        Watch Auction
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="p-6 bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700 hover:border-esports-accent transition group">
                     <Target className="w-8 h-8 text-esports-accent mb-4 opacity-50 group-hover:opacity-100 transition" />
                     <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Role</h3>
                     <div className="text-2xl font-black text-white">{player.role}</div>
                </div>

                <div className="p-6 bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700 hover:border-esports-highlight transition group">
                     <Activity className="w-8 h-8 text-esports-highlight mb-4 opacity-50 group-hover:opacity-100 transition" />
                     <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">K/D Ratio</h3>
                     <div className="text-2xl font-black text-white">{player.kd_ratio}</div>
                </div>

                <div className="p-6 bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700 hover:border-purple-500 transition group">
                     <Map className="w-8 h-8 text-purple-500 mb-4 opacity-50 group-hover:opacity-100 transition" />
                     <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Tier</h3>
                     <div className="text-2xl font-black text-white">{player.tier}</div>
                </div>
                
                 <div className="p-6 bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700 hover:border-pink-500 transition group">
                     <Trophy className="w-8 h-8 text-pink-500 mb-4 opacity-50 group-hover:opacity-100 transition" />
                     <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Experience</h3>
                     <div className="text-2xl font-black text-white">{player.experience_years} Years</div>
                </div>
            </div>

            {player.video_link && (
                <div className="aspect-w-16 aspect-h-9 w-full rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative">
                     <div className="absolute top-0 left-0 bg-esports-accent text-white px-4 py-1 text-xs font-bold uppercase z-10 rounded-br-lg">
                         Featured Gameplay
                     </div>
                     <iframe 
                         width="100%" 
                         height="500px"
                         src={player.video_link.replace("watch?v=", "embed/")} 
                         title="Player Gameplay" 
                         frameBorder="0" 
                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                         allowFullScreen
                         className="w-full h-full object-cover"
                     ></iframe>
                </div>
            )}
        </div>
    );
};

export default PlayerDashboard;
