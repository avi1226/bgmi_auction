import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Activity, Map, Trophy, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlayerDashboard = () => {
    const { user } = useAuth();
    const [player, setPlayer] = useState(null);
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (player) {
            setFormData({
                name: player.name,
                role: player.role,
                tier: player.tier,
                kd_ratio: player.kd_ratio,
                experience_years: player.experience_years,
                video_link: player.video_link,
                profile_image: player.profile_image
            });
        }
    }, [player]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/players/${player.id}`, formData);
            setPlayer(data);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        }
    };

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
                         {player.profile_image ? (
                             <img src={player.profile_image} alt={player.name} className="w-full h-full object-cover" />
                         ) : (
                             <>
                                <User className="absolute inset-0 m-auto text-gray-700 w-12 h-12" />
                                <span className="text-4xl font-black relative z-10">{player.name.charAt(0)}</span>
                             </>
                         )}
                    </div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            {player.name}
                        </h1>
                        <p className="text-gray-400 font-mono tracking-widest text-sm mt-1 uppercase mb-2">Pro Player Profile</p>
                        
                        {/* Verification Status */}
                        {(player.verification_status || 'PENDING') === 'PENDING' && (
                            <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                                Pending Approval
                            </span>
                        )}
                        {(player.verification_status) === 'VERIFIED' && (
                            <span className="bg-green-500/20 text-green-500 border border-green-500/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                Verified
                            </span>
                        )}
                        {(player.verification_status) === 'REJECTED' && (
                            <span className="bg-red-500/20 text-red-500 border border-red-500/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                Application Rejected
                            </span>
                        )}
                        
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="ml-4 mt-2 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider block md:inline-block"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>

                <div className="mt-8 md:mt-0 flex flex-col items-end gap-4">
                     {player.is_sold ? (
                         <div className="flex flex-col gap-2 items-end">
                             <div className="px-6 py-4 bg-green-500/10 border border-green-500 rounded-xl text-green-400 font-bold uppercase tracking-widest flex items-center shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                                 <Trophy className="w-5 h-5 mr-3 animate-bounce" />
                                 SOLD : ₹{player.sold_price.toLocaleString()}
                             </div>
                             {player.team_id && (
                                <div className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm font-mono flex items-center justify-center">
                                    Sold to: <span className="text-white font-bold ml-2">{player.team_id.team_name || 'Unknown Team'}</span>
                                </div>
                             )}
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

            {isEditing && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-gray-900/90 p-8 rounded-2xl w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Edit Profile</h2>
                            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white">
                                ✖
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">Profile Image URL</label>
                                <input 
                                    type="text" 
                                    value={formData.profile_image || ''} 
                                    onChange={e => setFormData({...formData, profile_image: e.target.value})}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-esports-accent outline-none focus:ring-1 focus:ring-esports-accent transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name || ''} 
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-esports-accent outline-none focus:ring-1 focus:ring-esports-accent transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">Role</label>
                                <select 
                                    value={formData.role || ''} 
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-esports-accent outline-none focus:ring-1 focus:ring-esports-accent transition"
                                >
                                    <option value="IGL">IGL</option>
                                    <option value="Assaulter">Assaulter</option>
                                    <option value="Support">Support</option>
                                    <option value="Sniper">Sniper</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">Tier</label>
                                <input 
                                    type="text" 
                                    value={formData.tier || ''} 
                                    onChange={e => setFormData({...formData, tier: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-esports-accent outline-none focus:ring-1 focus:ring-esports-accent transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">K/D Ratio</label>
                                <input 
                                    type="number" step="0.01"
                                    value={formData.kd_ratio || ''} 
                                    onChange={e => setFormData({...formData, kd_ratio: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-esports-accent outline-none focus:ring-1 focus:ring-esports-accent transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">Experience (Years)</label>
                                <input 
                                    type="number"
                                    value={formData.experience_years || ''} 
                                    onChange={e => setFormData({...formData, experience_years: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-esports-accent outline-none focus:ring-1 focus:ring-esports-accent transition"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">Video Link (YouTube)</label>
                                <input 
                                    type="text" 
                                    value={formData.video_link || ''} 
                                    onChange={e => setFormData({...formData, video_link: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-esports-accent outline-none focus:ring-1 focus:ring-esports-accent transition"
                                />
                            </div>
                            
                            <div className="col-span-2 flex justify-end gap-4 mt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold uppercase tracking-wider transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-3 bg-esports-accent hover:bg-indigo-600 rounded-lg text-white font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/30 transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerDashboard;
