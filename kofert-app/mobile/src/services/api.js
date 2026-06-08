import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBackendUrl = () => {
  if (Platform.OS === 'web') return 'http://127.0.0.1:8000/api';
  
  // Using stable localtunnel URL to bypass Windows Firewall and Ngrok CORS issues
  return 'https://petite-weeks-juggle.loca.lt/api';
};

const defaultApiUrl = getBackendUrl();

const API_URL = Constants.expoConfig?.extra?.API_URL || defaultApiUrl;
const TIMEOUT = Constants.expoConfig?.extra?.TIMEOUT || 10000;

const api = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
});

api.interceptors.request.use(
  async (config) => {
    config.headers['Bypass-Tunnel-Reminder'] = 'true'; // Required for localtunnel
    config.headers['ngrok-skip-browser-warning'] = 'true'; // Just in case
    
    const token = await AsyncStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('jwt_token');
      await AsyncStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

export { API_URL };
export default api;
