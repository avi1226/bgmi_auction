import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const TeamDashboard = () => {
    const { user } = useAuth();
    const [teamData, setTeamData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const { data } = await api.get(`/teams/${user.id}`);
                setTeamData(data);
            } catch (error) {
                console.error("Error fetching team:", error);
            }
        };
        if (user?.id) fetchTeam();
    }, [user]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-glow">Team Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-esports-light p-6 rounded-lg shadow-lg border border-gray-700">
                    <div className="flex items-center space-x-4">
                       <img src={teamData.team_logo || `https://ui-avatars.com/api/?name=${teamData.team_name}`} alt="Team Logo" className="w-16 h-16 rounded-full" />
                       <div>
                           <h2 className="text-2xl font-bold">{teamData.team_name}</h2>
                           <p className="text-gray-400">Owner: {user.username}</p>
                       </div>
                    </div>
                </div>

                <div className="bg-esports-light p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col justify-center items-center">
                    <h3 className="text-xl font-bold text-gray-400">Remaining Budget</h3>
                    <div className="text-4xl font-bold text-green-400 mt-2">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(teamData.budget || 0)}
                    </div>
                    <button 
                        onClick={() => navigate('/auction')}
                        className="mt-4 px-6 py-2 bg-esports-accent hover:bg-indigo-600 rounded-full text-white font-bold transition duration-300 transform hover:scale-105 shadow-ld"
                    >
                        Join Live Auction
                    </button>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">My Squad</h2>
            {/* Here we would list players bought by this team. Need an endpoint for that or filter players. */}
            <div className="bg-gray-800 p-8 rounded-lg text-center text-gray-500">
                <p>No players purchased yet.</p>
                <p className="text-sm mt-2">Go to the auction to build your squad!</p>
            </div>
        </div>
    );
};

export default TeamDashboard;
