import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PlayerDashboard from './pages/PlayerDashboard';
import TeamDashboard from './pages/TeamDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuctionRoom from './pages/AuctionRoom';
import PlayerProfile from './pages/PlayerProfile';
import Verification from './pages/Verification';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="bg-esports-dark min-h-screen text-white font-sans">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route element={<PrivateRoute allowedRoles={['player']} />}>
              <Route path="/player/dashboard" element={<PlayerDashboard />} />
              <Route path="/verification" element={<Verification />} />
            </Route>
            
            <Route element={<PrivateRoute allowedRoles={['team_owner']} />}>
              <Route path="/team/dashboard" element={<TeamDashboard />} />
            </Route>
            
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            {/* Auction accessible to all roles, but controls vary */}
            <Route path="/auction" element={<AuctionRoom />} />
            
            <Route element={<PrivateRoute allowedRoles={['team_owner', 'admin']} />}>
               <Route path="/player/:id" element={<PlayerProfile />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
