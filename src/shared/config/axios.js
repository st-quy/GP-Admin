import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN } from '@shared/lib/constants/auth';
import { clearAuthState } from '@shared/lib/auth/clearAuthState';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const shouldIgnore401Redirect = (url = '') =>
  ['/users/login', '/users/logout'].some((path) => url.includes(path));

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    const decodedToken = accessToken ? jwtDecode(accessToken) : null;

    if (decodedToken && decodedToken.exp * 1000 < Date.now()) {
      clearAuthState();
      window.location.href = '/login';
      return config;
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const requestAuthHeader =
      error.config?.headers?.Authorization || error.config?.headers?.authorization;
    const currentToken = localStorage.getItem(ACCESS_TOKEN);
    const currentAuthHeader = currentToken ? `Bearer ${currentToken}` : null;

    const shouldClearCurrentSession =
      status === 401 &&
      !shouldIgnore401Redirect(requestUrl) &&
      Boolean(requestAuthHeader) &&
      requestAuthHeader === currentAuthHeader;

    if (shouldClearCurrentSession) {
      clearAuthState();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
