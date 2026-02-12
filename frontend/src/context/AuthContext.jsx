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
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  const login = async (roleType, credentials) => {
    try {
      const endpoint = roleType === 'player' ? '/auth/login/player' :
                       roleType === 'team_owner' ? '/auth/login/team-owner' :
                       '/auth/login/admin';
      
      const { data } = await api.post(endpoint, credentials);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('user', JSON.stringify(data[roleType] || data.admin));
      
      setUser(data[roleType] || data.admin);
      setRole(data.role);
      return { success: true };
    } catch (error) {
       console.error(error);
       return { success: false, message: error.response?.data?.message || 'Login failed' };
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
    <AuthContext.Provider value={{ user, role, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
