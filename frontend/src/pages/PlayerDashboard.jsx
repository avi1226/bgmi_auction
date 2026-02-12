import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PlayerDashboard = () => {
  const { user } = useAuth();
  const [playerData, setPlayerData] = useState({});

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const { data } = await api.get(`/players/${user.id}`);
        setPlayerData(data);
      } catch (error) {
        console.error("Error fetching player:", error);
      }
    };
    if (user?.id) fetchPlayer();
  }, [user]);

  const getStatusColor = (sold) => sold ? 'bg-red-500' : 'bg-green-500';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-glow">My Profile</h1>
      
      <div className="bg-esports-light p-6 rounded-lg shadow-lg border border-gray-700">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-4xl">
            👤
          </div>
          <div>
            <h2 className="text-2xl font-bold">{playerData.name || user.username}</h2>
            <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(playerData.is_sold)}`}>
              {playerData.is_sold ? 'SOLD' : 'UNSOLD'}
            </div>
            {playerData.is_sold && (
                <div className="mt-2 text-esports-highlight font-bold">
                    Sold Price: ₹{playerData.sold_price}
                </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
           <div className="bg-gray-800 p-4 rounded-lg">
              <span className="text-gray-400 block">Role</span>
              <span className="text-xl font-bold">{playerData.role}</span>
           </div>
           <div className="bg-gray-800 p-4 rounded-lg">
              <span className="text-gray-400 block">K/D Ratio</span>
              <span className="text-xl font-bold text-esports-accent">{playerData.kd_ratio}</span>
           </div>
           <div className="bg-gray-800 p-4 rounded-lg">
              <span className="text-gray-400 block">Tier</span>
              <span className="text-xl font-bold text-yellow-500">{playerData.tier}</span>
           </div>
           <div className="bg-gray-800 p-4 rounded-lg">
              <span className="text-gray-400 block">Experience</span>
              <span className="text-xl font-bold">{playerData.experience_years} Years</span>
           </div>
        </div>

        {playerData.video_link && (
            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Gameplay Video</h3>
                <div className="aspect-w-16 aspect-h-9">
                    {/* Basic embed or link handling - for now simple link if not embeddable */}
                    <a href={playerData.video_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        Watch Gameplay on YouTube
                    </a>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PlayerDashboard;
