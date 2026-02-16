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
                    if (parsedUser && parsedUser.id) { // Ensure valid user object
                        setUser(parsedUser);
                        setRole(storedRole);
                    } else {
                        console.warn("Invalid user data in localStorage, clearing.");
                        localStorage.clear();
                    }
                } catch (e) {
                    console.error("Failed to parse stored user, clearing storage", e);
                    localStorage.clear();
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
      try {
          // Merge with existing user data to preserve fields like id/role if not present in update
          const newUser = { ...user, ...updatedUserData };
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
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
