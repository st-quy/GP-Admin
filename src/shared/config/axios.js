import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Use relative path for Docker with nginx proxy
// This ensures requests go through nginx proxy (HTTPS) instead of direct HTTP call
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_BASE_URL;
  
  // If running in production/Docker mode (not DEV), always use relative path
  // This allows nginx to proxy requests to backend
  if (!import.meta.env.DEV) {
    return "/api"; // Relative path for nginx proxy
  }
  
  // For local development, use configured URL or default to localhost
  if (envURL && !envURL.includes("127.0.0.1:3010")) {
    return envURL;
  }
  
  return "http://localhost:3010/api"; // Local dev fallback
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");

    const decodedToken = accessToken ? jwtDecode(accessToken) : null;
    if (decodedToken && decodedToken.exp * 1000 < Date.now()) {
      localStorage.clear();
      window.location.href = "/login";
    }

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
