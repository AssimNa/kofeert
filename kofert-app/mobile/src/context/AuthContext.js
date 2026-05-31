import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { saveJWT, getJWT, saveUserData, getUserData } from '../services/storage';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const token = await getJWT();
      const userData = await getUserData();
      
      if (token && userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Erreur bootstrap:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // In the Kofert backend, login expects form-data with username and password
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const { access_token } = response.data;
      
      // Fetch user profile
      const userRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const userData = userRes.data;
      
      await saveJWT(access_token);
      await saveUserData(userData);
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error(error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erreur de connexion' 
      };
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await saveJWT('');
      await saveUserData(null);
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
