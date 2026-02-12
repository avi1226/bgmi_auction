import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    ...(role === 'player' ? [{ label: 'My Dashboard', path: '/player/dashboard' }] : []),
    ...(role === 'team_owner' ? [{ label: 'My Team', path: '/team/dashboard' }] : []),
    ...(role === 'admin' ? [{ label: 'Admin Panel', path: '/admin/dashboard' }] : []),
    { label: 'Live Auction', path: '/auction' }, // Everyone can view
  ];

  return (
    <nav className="bg-esports-light border-b border-esports-accent/20 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <span className="font-bold text-2xl text-esports-highlight tracking-widest text-glow">
                BGMI<span className="text-white">AUCTION</span>
              </span>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8 items-center">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {user ? (
              <>
                <div className="text-sm text-gray-400">
                  {role === 'team_owner' ? 'Owner' : role === 'admin' ? 'Admin' : 'Player'}: 
                  <span className="text-white ml-1 font-semibold">{user.username || user.name || user.team_name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-esports-danger hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={() => navigate('/login')}
                  className="text-white hover:text-esports-highlight px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-esports-accent hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-transform transform hover:scale-105"
                >
                  Register
                </button>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden bg-esports-light border-t border-gray-700">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              >
                {link.label}
              </button>
            ))}
            {!user && (
              <>
                <button
                  onClick={() => { navigate('/login'); setIsOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Login
                </button>
                <button
                  onClick={() => { navigate('/register'); setIsOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-esports-highlight hover:text-white hover:bg-gray-700"
                >
                  Register
                </button>
              </>
            )}
            {user && (
               <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-red-500 hover:text-red-400 hover:bg-gray-700"
                >
                  Logout
                </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
