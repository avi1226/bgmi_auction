import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const [role, setRole] = useState('player');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(role, { username, password });
    if (result.success) {
      if (role === 'player') {
        navigate('/player/dashboard');
      } else if (role === 'team_owner') {
        navigate('/team/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-esports-dark bg-cover relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-black/80 z-0"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-esports-light/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 z-10"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6 uppercase tracking-wider text-glow">
          Login
        </h2>

        {error && <div className="bg-red-500/20 text-red-500 p-3 mb-4 rounded text-center border border-red-500/50">{error}</div>}

        <div className="flex justify-center space-x-4 mb-6">
          {['player', 'team_owner', 'admin'].map((r) => (
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 uppercase tracking-wide">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-esports-accent transition-all duration-200 placeholder-gray-500"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-esports-accent transition-all duration-200 placeholder-gray-500"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-esports-accent hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-[1.02] shadow-indigo-500/50"
          >
            Sign In
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-400">
          Don't have an account? <span className="text-esports-highlight cursor-pointer hover:underline" onClick={() => navigate('/register')}>Register here</span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
