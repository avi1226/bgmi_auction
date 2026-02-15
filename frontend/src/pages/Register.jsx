import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
  const [role, setRole] = useState('player');
  const [formData, setFormData] = useState({
    username: '', password: '', name: '', role: 'Assaulter', tier: 'Gold', kd_ratio: 0, experience_years: 0, tournament_history: '', video_link: '', team_name: '', team_logo: ''
  });
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(role, formData);
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-esports-dark bg-cover relative overflow-hidden py-10">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-black/80 z-0"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl p-8 bg-esports-light/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 z-10"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6 uppercase tracking-wider text-glow">
          Register
        </h2>

        {error && <div className="bg-red-500/20 text-red-500 p-3 mb-4 rounded text-center border border-red-500/50">{error}</div>}

        <div className="flex justify-center space-x-4 mb-6">
          {['player', 'team_owner'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-300 ${
                role === r 
                  ? 'bg-esports-accent text-white shadow-lg scale-105 ring-2 ring-indigo-400' 
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {r.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 uppercase tracking-wide">Username</label>
              <input type="text" name="username" onChange={handleChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-esports-accent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 uppercase tracking-wide">Password</label>
              <input type="password" name="password" onChange={handleChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-esports-accent" required />
            </div>
          </div>
          
          <div className="space-y-4">
            {role === 'player' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 uppercase tracking-wide">Full Name</label>
                  <input type="text" name="name" onChange={handleChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-esports-accent" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-300 uppercase tracking-wide">Role</label>
                     <select name="role" onChange={handleChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-esports-accent">
                       <option value="Assaulter">Assaulter</option>
                       <option value="Sniper">Sniper</option>
                       <option value="IGL">IGL</option>
                       <option value="Support">Support</option>
                     </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-300 uppercase tracking-wide">Tier</label>
                      <select name="tier" onChange={handleChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-esports-accent">
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-300 uppercase tracking-wide">K/D Ratio</label>
                      <input type="number" step="0.1" name="kd_ratio" onChange={handleChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-esports-accent" required />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-300 uppercase tracking-wide">Experience (Years)</label>
                      <input type="number" name="experience_years" onChange={handleChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-esports-accent" required />
                   </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 uppercase tracking-wide">Video Link (YouTube)</label>
                  <input type="url" name="video_link" onChange={handleChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-esports-accent" placeholder="https://youtube.com/..." />
                </div>
              </>
            ) : (
              <>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 uppercase tracking-wide">Team Name</label>
                    <input type="text" name="team_name" onChange={handleChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-esports-accent" required />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 uppercase tracking-wide">Team Logo (URL)</label>
                    <input type="text" name="team_logo" onChange={handleChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-esports-accent" />
                 </div>
              </>
            )}
          </div>
          
          <div className="md:col-span-2 mt-6">
             <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-esports-accent hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-[1.02] shadow-indigo-500/50"
          >
            Create Account
          </button>
          </div>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account? <span className="text-esports-highlight cursor-pointer hover:underline" onClick={() => navigate('/login')}>Login here</span>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
