import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');

    const decodedToken = accessToken ? jwtDecode(accessToken) : null;
    if (decodedToken && decodedToken.exp * 1000 < Date.now()) {
      localStorage.clear();
      window.location.href = '/login';
    }

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
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
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
