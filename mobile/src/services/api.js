import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL per platform:
// - iOS simulator: localhost
// - Android emulator: 10.0.2.2 (host loopback)
// - Physical devices: replace with your Mac's LAN IP if needed
const API_BASE_URL = Platform.select({
  ios: "http://127.0.0.1:8000",
  android: "http://10.0.2.2:8000",
  default: "http://127.0.0.1:8000",
});

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
  }
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
  }
);

export const setApiBaseUrl = (url) => {
  api.defaults.baseURL = url;
};

export default api;
