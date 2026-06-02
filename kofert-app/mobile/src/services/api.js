import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const defaultApiUrl = Platform.OS === 'web' 
  ? 'http://127.0.0.1:8000/api' 
  : 'http://192.168.1.73:8000/api'; // IP du PC pour un appareil physique

const API_URL = Constants.expoConfig?.extra?.API_URL || defaultApiUrl;
const TIMEOUT = Constants.expoConfig?.extra?.TIMEOUT || 10000;

const api = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
});

api.interceptors.request.use(
  async (config) => {
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

export default api;
