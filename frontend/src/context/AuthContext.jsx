import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'player', 'team_owner', 'admin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage on load
    const initializeAuth = () => {
        try {
            const token = localStorage.getItem('token');
            const storedRole = localStorage.getItem('role');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser && storedRole) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    // Check for either 'id' or '_id' which is common with MongoDB objects
                    if (parsedUser && (parsedUser.id || parsedUser._id)) { 
                        setUser(parsedUser);
                        setRole(storedRole);
                    } else {
                        console.warn("Invalid user data in localStorage, removing user info.");
                        localStorage.removeItem('user');
                        localStorage.removeItem('role');
                    }
                } catch (e) {
                    console.error("Failed to parse stored user", e);
                    localStorage.removeItem('user');
                }
            }
        } catch (e) {
            console.error("Auth initialization error:", e);
        } finally {
            setLoading(false);
        }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      
      const role = data.role;
      const user = data[role === 'team_owner' ? 'team_owner' : role];

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', role);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setRole(role);
      return { success: true, role };
    } catch (error) {
       console.error(error);
       return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const updateUser = (updatedUserData) => {
      if (!updatedUserData) return;
      try {
          setUser(prevUser => {
              // Merge with existing user data
              const newUser = { ...prevUser, ...updatedUserData };
              // Ensure we have an 'id' field for consistency if '_id' is provided
              if (newUser._id && !newUser.id) newUser.id = newUser._id;
              
              localStorage.setItem('user', JSON.stringify(newUser));
              return newUser;
          });
      } catch (error) {
          console.error("Failed to update user context", error);
      }
  };


  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setUser(null);
    setRole(null);
  };

  const register = async (roleType, formData) => {
      try {
        const endpoint = roleType === 'player' ? '/auth/register/player' : '/auth/register/team-owner';
        await api.post(endpoint, formData);
        return { success: true };
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Registration failed' };
      }
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, register, updateUser, loading }}>
      {!loading ? children : <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading...</div>}
    </AuthContext.Provider>
  );
};
