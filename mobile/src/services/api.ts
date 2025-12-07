import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// IMPORTANT: Change this to your computer's local IP address
// Find it by running: ifconfig (Mac/Linux) or ipconfig (Windows)
const API_URL = "http://192.168.11.129:3000";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Network error (no internet, server down, etc.)
    if (!error.response) {
      error.message = "Network error. Please check your internet connection.";
    } else if (error.response.status === 401) {
      // Token expired or invalid - clear auth data
      await AsyncStorage.multiRemove(["token", "user"]);
      error.message = "Session expired. Please log in again.";
    } else if (error.response.status === 403) {
      error.message = "You do not have permission to perform this action.";
    } else if (error.response.status === 404) {
      error.message = "The requested resource was not found.";
    } else if (error.response.status === 500) {
      error.message = "Server error. Please try again later.";
    } else if (error.code === "ECONNABORTED") {
      error.message = "Request timeout. Please try again.";
    }

    return Promise.reject(error);
  }
);

export default api;
