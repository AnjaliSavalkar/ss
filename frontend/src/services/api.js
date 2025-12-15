import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (email, password) => {
    const response = await api.post("/auth/register", { email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
};

// Subscriptions API
export const subscriptionsAPI = {
  getSubscriptions: async () => {
    const response = await api.get("/subscriptions");
    return response.data;
  },

  addSubscription: async (ticker) => {
    const response = await api.post("/subscriptions", { ticker });
    return response.data;
  },

  removeSubscription: async (ticker) => {
    const response = await api.delete(`/subscriptions/${ticker}`);
    return response.data;
  },
};

export default api;
