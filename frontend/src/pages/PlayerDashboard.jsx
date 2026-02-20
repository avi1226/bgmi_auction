import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Activity, Map, Trophy, Target, Trash2, Smartphone, Hash, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getYouTubeEmbedUrl } from '../utils';

const PlayerDashboard = () => {
    const { user, updateUser } = useAuth();
    const [player, setPlayer] = useState(null);
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [selectedProfileScreenshot, setSelectedProfileScreenshot] = useState(null);
    const [selectedRankProof, setSelectedRankProof] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState(null);
    const [previewRankProofUrl, setPreviewRankProofUrl] = useState(null);
    const [videoLink, setVideoLink] = useState('');
    const [isUploadingProofs, setIsUploadingProofs] = useState(false);

    // Effect for initial loading...
    useEffect(() => {
        if (player) {
            setFormData({
                name: player.name,
                role: player.role,
                tier: player.tier,
                kd_ratio: player.kd_ratio,
                experience_years: player.experience_years,
                dob: player.dob ? new Date(player.dob).toISOString().split('T')[0] : '',
                profile_image: player.profile_image,
                bgmi_uid: player.bgmi_uid || '',
                team_experience: player.team_experience || false,
                device: player.device || 'Android'
            });
            setPreviewUrl(player.profile_image);
        }
    }, [player]);

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'image') {
                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
            } else if (type === 'video') {
                setSelectedVideo(file);
            } else if (type === 'profile_screenshot') {
                setSelectedProfileScreenshot(file);
                setPreviewScreenshotUrl(URL.createObjectURL(file));
            } else if (type === 'rank_proof_image') {
                setSelectedRankProof(file);
                setPreviewRankProofUrl(URL.createObjectURL(file));
            }
        }
    };

    const handleDeleteVideo = async (videoUrl) => {
        if (window.confirm("Are you sure you want to delete this video?")) {
            try {
                const { data } = await api.put(`/players/${player.id}/video/delete`, { video_url: videoUrl });
                setPlayer(data);
            } catch (error) {
                 console.error("Failed to delete video", error);
            }
        }
    };

    const handleVideoSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            if (videoLink) data.append('video_link', videoLink);
            if (selectedVideo) data.append('gameplay_video', selectedVideo);

            const response = await api.put(`/players/${player.id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setPlayer(response.data);
            setIsUploading(false);
            setSelectedVideo(null);
            setVideoLink('');
        } catch (error) {
             console.error("Failed to upload video", error);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            if (selectedFile) {
                data.append('profile_image', selectedFile);
            }
            if (selectedProfileScreenshot) {
                data.append('profile_screenshot', selectedProfileScreenshot);
            }
            if (selectedRankProof) {
                data.append('rank_proof_image', selectedRankProof);
            }

            const response = await api.put(`/players/${player.id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setPlayer(response.data);
            
            // Update auth context so session remains strictly valid and up-to-date
            if (updateUser) {
                updateUser(response.data);
            }

            setIsEditing(false);
            setIsUploadingProofs(false);
            setSelectedFile(null);
            setSelectedProfileScreenshot(null);
            setSelectedRankProof(null);
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
                        {/* Verification Status */}
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                            {/* Status: Pending */}
                            {(player.verification_status || '').toLowerCase() === 'pending' && (
                                <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                                    Verification Pending
                                </span>
                            )}

                            {/* Status: Verified (Only if video exists or not sold logic overrides) */}
                            {(player.verification_status || '').toLowerCase() === 'verified' && player.verification_video_url && (
                                <span className="bg-green-500/20 text-green-500 border border-green-500/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Verified
                                </span>
                            )}

                            {/* Button: Get Verified (Unverified/Rejected) */}
                            {((player.verification_status || 'unverified').toLowerCase() === 'rejected' || (player.verification_status || 'unverified').toLowerCase() === 'unverified') && (
                                <button 
                                    onClick={() => navigate('/verification')}
                                    className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center transition"
                                >
                                    {(player.verification_status || '').toLowerCase() === 'rejected' ? 'Verification Rejected' : 'Get Verified'}
                                    <span className="ml-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                </button>
                            )}

                            {/* Button: Upload Video (If Verified/Sold but NO video) */}
                            {/* This replaces the 'Action Required' badge with a direct clickable action */}
                            {((player.verification_status || '').toLowerCase() === 'verified' || player.is_sold) && !player.verification_video_url && (
                                <button 
                                    onClick={() => navigate('/verification')}
                                    className="bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 border border-orange-500/50 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center transition animate-pulse"
                                >
                                    ⚠️ Upload Video Proof
                                </button>
                            )}
                        </div>

                        <div className="flex gap-4 mt-6">
                            <div className="text-center">
                                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1 tracking-widest">Profile Proof</p>
                                {(player.profile_screenshot || previewScreenshotUrl) ? (
                                    <a href={player.profile_screenshot || previewScreenshotUrl} target="_blank" rel="noopener noreferrer" className="block w-24 h-16 rounded overflow-hidden border border-gray-700 hover:border-esports-accent transition shadow-lg group">
                                        <img src={previewScreenshotUrl || player.profile_screenshot} alt="Profile Proof" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                    </a>
                                ) : (
                                    <button 
                                        onClick={() => setIsUploadingProofs(true)}
                                        className="w-24 h-16 rounded border-2 border-dashed border-gray-700 hover:border-esports-highlight flex flex-col items-center justify-center text-[8px] text-gray-500 hover:text-esports-highlight transition group"
                                    >
                                        <Activity className="w-4 h-4 mb-1 opacity-50 group-hover:opacity-100" />
                                        UPLOAD PROOF
                                    </button>
                                )}
                            </div>

                            <div className="text-center">
                                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1 tracking-widest">Rank Proof</p>
                                {(player.rank_proof_image || previewRankProofUrl) ? (
                                    <a href={player.rank_proof_image || previewRankProofUrl} target="_blank" rel="noopener noreferrer" className="block w-24 h-16 rounded overflow-hidden border border-gray-700 hover:border-esports-accent transition shadow-lg group">
                                        <img src={previewRankProofUrl || player.rank_proof_image} alt="Rank Proof" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                    </a>
                                ) : (
                                    <button 
                                        onClick={() => setIsUploadingProofs(true)}
                                        className="w-24 h-16 rounded border-2 border-dashed border-gray-700 hover:border-esports-accent flex flex-col items-center justify-center text-[8px] text-gray-500 hover:text-esports-accent transition group"
                                    >
                                        <Trophy className="w-4 h-4 mb-1 opacity-50 group-hover:opacity-100" />
                                        UPLOAD RANK
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mt-4">
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/30 transition"
                            >
                                Edit Profile
                            </button>
                            <button 
                                onClick={() => setIsUploading(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/30 transition"
                            >
                                Upload Gameplay
                            </button>
                        </div>
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

                {/* New Cards */}
                <div className="p-6 bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700 hover:border-blue-500 transition group">
                     <Hash className="w-8 h-8 text-blue-500 mb-4 opacity-50 group-hover:opacity-100 transition" />
                     <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">BGMI UID</h3>
                     <div className="text-2xl font-black text-white">{player.bgmi_uid || 'N/A'}</div>
                </div>

                <div className="p-6 bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700 hover:border-green-500 transition group">
                     <Users className="w-8 h-8 text-green-500 mb-4 opacity-50 group-hover:opacity-100 transition" />
                     <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Team Exp.</h3>
                     <div className="text-2xl font-black text-white">{player.team_experience ? 'Yes' : 'No'}</div>
                </div>

                <div className="p-6 bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700 hover:border-orange-500 transition group">
                     <Smartphone className="w-8 h-8 text-orange-500 mb-4 opacity-50 group-hover:opacity-100 transition" />
                     <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Device</h3>
                     <div className="text-2xl font-black text-white">{player.device || 'N/A'}</div>
                </div>
            </div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Legacy video_link support */}
                {player.video_link && !player.video_links?.includes(player.video_link) && (
                     <div className="aspect-video w-full max-w-xl rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative group">
                         {/* Delete Button */}
                         <button 
                            onClick={() => handleDeleteVideo(player.video_link)}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full z-20 opacity-0 group-hover:opacity-100 transition shadow-lg"
                            title="Delete Video"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>

                         {getYouTubeEmbedUrl(player.video_link) ? (
                            <iframe 
                                width="100%" 
                                height="100%"
                                src={getYouTubeEmbedUrl(player.video_link)} 
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
                                src={player.video_link}
                            >
                                Your browser does not support the video tag.
                            </video>
                         )}
                    </div>
                )}

                {/* New video_links array support */}
                {player.video_links && player.video_links.map((link, index) => (
                    <div key={index} className="aspect-video w-full max-w-xl rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative group">
                         {/* Delete Button */}
                         <button 
                            onClick={() => handleDeleteVideo(link)}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full z-20 opacity-0 group-hover:opacity-100 transition shadow-lg"
                            title="Delete Video"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>

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
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">Profile Image</label>
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-600 bg-gray-800">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-full h-full p-4 text-gray-500" />
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'image')}
                                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-esports-accent file:text-white hover:file:bg-indigo-600"
                                    />
                                </div>
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">Profile Screenshot</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'profile_screenshot')}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-esports-accent file:text-white hover:file:bg-indigo-600"
                                />
                                {(player.profile_screenshot || previewScreenshotUrl) && <p className="text-green-500 text-xs mt-1">File uploaded or available</p>}
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">Rank Proof</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'rank_proof_image')}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-esports-accent file:text-white hover:file:bg-indigo-600"
                                />
                                {(player.rank_proof_image || previewRankProofUrl) && <p className="text-green-500 text-xs mt-1">File uploaded or available</p>}
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
                                <select 
                                    value={formData.tier || ''} 
                                    onChange={e => setFormData({...formData, tier: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-esports-accent outline-none focus:ring-1 focus:ring-esports-accent transition"
                                >
                                    <option value="Bronze">Bronze</option>
                                    <option value="Silver">Silver</option>
                                    <option value="Gold">Gold</option>
                                    <option value="Platinum">Platinum</option>
                                    <option value="Diamond">Diamond</option>
                                    <option value="Crown">Crown</option>
                                    <option value="Ace">Ace</option>
                                    <option value="Conqueror">Conqueror</option>
                                </select>
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
                            <div>
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">BGMI UID</label>
                                <input 
                                    type="text"
                                    value={formData.bgmi_uid || ''} 
                                    onChange={e => setFormData({...formData, bgmi_uid: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-esports-accent outline-none focus:ring-1 focus:ring-esports-accent transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">Team Experience?</label>
                                <select 
                                    value={formData.team_experience} 
                                    onChange={e => setFormData({...formData, team_experience: e.target.value === 'true'})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-esports-accent outline-none focus:ring-1 focus:ring-esports-accent transition"
                                >
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">Device</label>
                                <select 
                                    value={formData.device || 'Android'} 
                                    onChange={e => setFormData({...formData, device: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-esports-accent outline-none focus:ring-1 focus:ring-esports-accent transition"
                                >
                                    <option value="Android">Android</option>
                                    <option value="iOS">iOS</option>
                                    <option value="Emulator">Emulator</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">
                                    Date of Birth 
                                </label>
                                {formData.dob && (
                                    <span className="text-esports-accent text-xs mb-2 block font-bold">
                                        (Age: {Math.floor((new Date() - new Date(formData.dob)) / 31557600000)})
                                    </span>
                                )}
                                <input 
                                    type="date"
                                    value={formData.dob || ''} 
                                    onChange={e => setFormData({...formData, dob: e.target.value})}
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

            {isUploading && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-gray-900/90 p-8 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Upload Gameplay</h2>
                            <button onClick={() => setIsUploading(false)} className="text-gray-400 hover:text-white">
                                ✖
                            </button>
                        </div>
                        <form onSubmit={handleVideoSubmit} className="flex flex-col gap-6">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">Paste YouTube Link</label>
                                <input 
                                    type="text" 
                                    placeholder="https://youtube.com/..."
                                    value={videoLink} 
                                    onChange={e => setVideoLink(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-esports-accent outline-none focus:ring-1 focus:ring-esports-accent transition"
                                />
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="h-px bg-gray-700 flex-1"></div>
                                <span className="text-gray-500 text-xs uppercase font-bold">OR</span>
                                <div className="h-px bg-gray-700 flex-1"></div>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">Upload Video File</label>
                                <input 
                                    type="file" 
                                    accept="video/*"
                                    onChange={(e) => handleFileChange(e, 'video')}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-esports-accent file:text-white hover:file:bg-indigo-600"
                                />
                                {selectedVideo && <div className="mt-2 text-green-500 text-xs">Selected: {selectedVideo.name}</div>}
                            </div>

                            <div className="flex justify-end gap-4 mt-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsUploading(false)}
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold uppercase tracking-wider transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/30 transition"
                                >
                                    Upload Video
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isUploadingProofs && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-gray-900/90 p-8 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Upload Identity Proofs</h2>
                            <button onClick={() => setIsUploadingProofs(false)} className="text-gray-400 hover:text-white">
                                ✖
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="flex flex-col gap-6">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider font-mono">Profile Screenshot</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'profile_screenshot')}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-esports-highlight file:text-white"
                                />
                                {previewScreenshotUrl && (
                                    <img src={previewScreenshotUrl} className="mt-2 w-32 h-20 object-cover rounded border border-gray-700" alt="Preview" />
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider font-mono">Rank Screenshot</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'rank_proof_image')}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-esports-accent file:text-white"
                                />
                                {previewRankProofUrl && (
                                    <img src={previewRankProofUrl} className="mt-2 w-32 h-20 object-cover rounded border border-gray-700" alt="Preview" />
                                )}
                            </div>

                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">
                                Note: These proofs help us verify your tier and stats accurately.
                            </p>

                            <div className="flex justify-end gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsUploadingProofs(false)}
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold uppercase tracking-wider transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/30 transition"
                                >
                                    Save Proofs
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
