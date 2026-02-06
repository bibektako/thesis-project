import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  login,
  logout as logoutService,
  getCurrentUser,
} from "../services/auth";

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  apiBaseUrl: "http://192.168.1.100:8000",

  initialize: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem("access_token");
      const userStr = await AsyncStorage.getItem("user");

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({
          token,
          user,
          isAuthenticated: true,
        });

        // Verify token is still valid
        try {
          const currentUser = await getCurrentUser();
          set({ user: currentUser });
        } catch (error) {
          // Token invalid, clear auth
          await get().logout();
        }
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await login(email, password);
      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
      });
      return { success: true };
    } catch (error) {
      console.log("[AUTH_STORE] Login error surfaced to UI", {
        message: error?.message,
        code: error?.code,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL,
        status: error?.response?.status,
        detail: error?.response?.data,
      });
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        "Login failed. Please check your connection and try again.";
      return {
        success: false,
        error: message,
      };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await logoutService();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  refreshUser: async () => {
    try {
      const currentUser = await getCurrentUser();
      set({ user: currentUser });
      return currentUser;
    } catch (error) {
      console.error("Refresh user error:", error);
      return null;
    }
  },

  setApiBaseUrl: (url) => {
    set({ apiBaseUrl: url });
  },
}));

export default useAuthStore;




