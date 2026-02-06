import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL configuration:
// - For physical devices: Use your Mac's LAN IP (e.g., 192.168.2.100)
//   Find your Mac's IP: ifconfig | grep "inet " | grep -v 127.0.0.1
// - For iOS simulator: Use "http://127.0.0.1:8000"
// - For Android emulator: Use "http://10.0.2.2:8000"
//
// IMPORTANT: Make sure your Mac and phone are on the SAME WiFi network!
const API_BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("[API] Response error", {
      message: error?.message,
      code: error?.code,
      url: error?.config?.url,
      baseURL: error?.config?.baseURL,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("user");
    }
    return Promise.reject(error);
  },
);

export const setApiBaseUrl = (url) => {
  api.defaults.baseURL = url;
};

export default api;
