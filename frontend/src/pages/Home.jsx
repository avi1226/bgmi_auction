import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="bg-esports-dark min-h-screen text-white relative overflow-hidden flex flex-col items-center justify-center text-center px-4">
             {/* Background Effects */}
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-esports-dark/80 to-esports-dark z-0 pointer-events-none"></div>
             
             {/* Hero Content */}
             <div className="z-10 animate-fade-in-up">
                 <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600 animate-text-shimmer">
                     BGMI<br/>AUCTION
                 </h1>
                 <p className="text-xl md:text-2xl text-gray-300 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
                     The ultimate Battlegrounds esports player trading platform. <br/>
                     <span className="text-esports-highlight font-bold">Build your dream squad live.</span>
                 </p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                     <button onClick={() => navigate('/auction')} className="relative group px-8 py-4 bg-esports-accent hover:bg-indigo-600 rounded-xl overflow-hidden shadow-2xl shadow-indigo-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95">
                         <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                         <span className="relative z-10 font-bold text-lg uppercase tracking-wider">Join Live Auction</span>
                     </button>
                     
                     <div 
                        className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-esports-highlight transition cursor-pointer group"
                        onClick={() => navigate('/register')}
                     >
                         <h3 className="text-xl font-bold mb-2 group-hover:text-esports-highlight">Register as Player</h3>
                         <p className="text-sm text-gray-400">Showcase your skills and get picked by top teams.</p>
                     </div>

                     <div 
                        className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-esports-highlight transition cursor-pointer group"
                        onClick={() => navigate('/register')} // Or distinct registration page if needed
                     >
                         <h3 className="text-xl font-bold mb-2 group-hover:text-esports-highlight">Create a Team</h3>
                         <p className="text-sm text-gray-400">Manage budget, bid strategically, and win titles.</p>
                     </div>
                 </div>
             </div>

             {/* Footer */}
             <footer className="absolute bottom-4 text-xs text-gray-500">
                 &copy; 2026 BGMI Auction System. Professional Esports Simulation.
             </footer>
        </div>
    );
};

export default Home;
