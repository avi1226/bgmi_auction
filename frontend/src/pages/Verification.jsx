import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Verification = () => {
  const { user: authUser, updateUser } = useAuth();
  const [player, setPlayer] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [rankFile, setRankFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [previews, setPreviews] = useState({ profile: null, rank: null });
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser?.id) fetchPlayer();
  }, [authUser]);

  const fetchPlayer = async () => {
    try {
      const response = await api.get(`/players/${authUser.id}`);
      setPlayer(response.data);
      if (updateUser) updateUser(response.data);
    } catch (error) {
      console.error('Error fetching player:', error);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'video') {
      setVideoFile(file);
    } else if (type === 'profile') {
      setProfileFile(file);
      setPreviews(prev => ({ ...prev, profile: URL.createObjectURL(file) }));
    } else if (type === 'rank') {
      setRankFile(file);
      setPreviews(prev => ({ ...prev, rank: URL.createObjectURL(file) }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (videoFile) formData.append('verification_video', videoFile);
    if (profileFile) formData.append('profile_screenshot', profileFile);
    if (rankFile) formData.append('rank_proof_image', rankFile);

    if (!videoFile && !profileFile && !rankFile) return setMessage('Please select at least one file to upload.');

    setLoading(true);
    setMessage('');
    
    try {
      await api.put(`/players/${authUser.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
      setMessage('Proofs uploaded successfully! Status: Pending Review.');
      fetchPlayer(); // Refresh status
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Failed to upload video. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setVideoFile(null);
      setProfileFile(null);
      setRankFile(null);
    }
  };

  if (!player) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">Player Verification</h2>
        
        <div className="mb-6 p-4 rounded-lg bg-gray-700 flex justify-between items-center">
          <span className="text-lg font-semibold">Current Status:</span>
          {((player.verification_status || '').toLowerCase() === 'verified' && !player.verification_video_url) ? (
             <span className="px-4 py-2 rounded-full font-bold uppercase bg-orange-500 text-white animate-pulse">
                Action Required
             </span>
          ) : (
              <span className={`px-4 py-2 rounded-full font-bold uppercase ${
                (player.verification_status || '').toLowerCase() === 'verified' ? 'bg-green-500 text-black' :
                (player.verification_status || '').toLowerCase() === 'rejected' ? 'bg-red-500 text-white' :
                (player.verification_status || '').toLowerCase() === 'pending' ? 'bg-yellow-500 text-black' :
                'bg-gray-500 text-white'
              }`}>
                {player.verification_status || 'Unverified'}
              </span>
          )}
        </div>

        {player.rejection_reason && (player.verification_status || '').toLowerCase() === 'rejected' && (
           <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded text-red-200">
               <strong>Reason for Rejection:</strong> {player.rejection_reason}
           </div>
        )}

        {(player.verification_status || '').toLowerCase() === 'verified' && player.verification_video_url ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-green-400">You are Verified!</h3>
            <p className="mt-2 text-gray-300">Your profile is fully verified with video proof.</p>
            <button onClick={() => navigate('/player/dashboard')} className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition">
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-gray-700/50 p-6 rounded-lg mb-6 border-l-4 border-yellow-400">
              <h3 className="text-xl font-semibold mb-3 text-yellow-300">Requirements</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-300 text-sm">
                <li>Video length: <strong>45–60 seconds</strong>.</li>
                <li>Your face must be clearly visible (front camera).</li>
                <li>Show yourself opening the BGMI app live.</li>
                <li>Navigate to your Profile &rarr; Show ID, Rank, Tier, KD.</li>
                <li>Scroll through your Match History.</li>
                <li>Verbally state your Name and BGMI ID on camera.</li>
              </ul>
            </div>

            {player.verification_status === 'pending' ? (
               <div className="text-center py-8">
                   <div className="text-6xl mb-4">⏳</div>
                   <h3 className="text-xl font-bold text-yellow-500">Verification Pending</h3>
                   <p className="text-gray-400 mt-2">Your video is under review. This usually takes 24-48 hours.</p>
                   <p className="text-sm text-gray-500 mt-4">Need to correct something? You can re-upload below.</p>
               </div>
            ) : null}

            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                       <label className="text-xs font-bold uppercase text-gray-500 tracking-widest">1. Profile Screenshot</label>
                       <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-esports-highlight transition relative min-h-[120px] flex items-center justify-center bg-gray-900/50">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleFileChange(e, 'profile')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {previews.profile || player.profile_screenshot ? (
                            <img src={previews.profile || player.profile_screenshot} className="max-h-24 rounded border border-gray-700" alt="Profile" />
                        ) : (
                            <div className="text-gray-500">
                                <p className="text-sm">Upload Profile Proof</p>
                                <p className="text-[10px]">Lobby screenshot showing Name & ID</p>
                            </div>
                        )}
                      </div>
                  </div>

                  <div className="space-y-2">
                       <label className="text-xs font-bold uppercase text-gray-500 tracking-widest">2. Rank Screenshot</label>
                       <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-esports-accent transition relative min-h-[120px] flex items-center justify-center bg-gray-900/50">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleFileChange(e, 'rank')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {previews.rank || player.rank_proof_image ? (
                            <img src={previews.rank || player.rank_proof_image} className="max-h-24 rounded border border-gray-700" alt="Rank" />
                        ) : (
                            <div className="text-gray-500">
                                <p className="text-sm">Upload Rank Proof</p>
                                <p className="text-[10px]">Season rank page showing K/D & Tier</p>
                            </div>
                        )}
                      </div>
                  </div>
              </div>

              <div className="h-px bg-gray-700 my-4"></div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-widest">3. Verification Video (Required)</label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-yellow-400 transition relative bg-gray-900/50">
                    <input 
                    type="file" 
                    accept="video/*" 
                    onChange={(e) => handleFileChange(e, 'video')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center">
                        <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <p className="text-sm font-medium">{videoFile ? videoFile.name : 'Select or drop verification video'}</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase">Recommended: MP4, 45-60s</p>
                    </div>
                </div>
              </div>

              {loading && (
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}

              {message && (
                 <p className={`text-center ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                    {message}
                 </p>
              )}

              <button 
                type="submit" 
                disabled={loading || (!videoFile && !profileFile && !rankFile)}
                className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-widest transition shadow-2xl ${
                    loading || (!videoFile && !profileFile && !rankFile) ? 'bg-gray-600 cursor-not-allowed text-gray-400' : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/20'
                }`}
              >
                {loading ? `Uploading... ${uploadProgress}%` : 'Submit Verification'}
              </button>
            </form>
            
             <button onClick={() => navigate('/player/dashboard')} className="mt-4 w-full text-center text-gray-400 hover:text-white underline">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verification;
