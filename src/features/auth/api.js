import axiosInstance from "@shared/config/axios";

export const AuthApi = {

  login: (credentials) => {
    return axiosInstance.post("/users/login", credentials);
  },
  register: (params) => {
    return axiosInstance.post("/users/register", params);
  },
  forgotPassword: (params) => {
    return axiosInstance.post("/users/forgot-password", params);
  },
  resetPassword: (params) => {
    return axiosInstance.post("/users/reset-password", params);
  },
  getProfile: (userId) => {    
    return axiosInstance.get(`/users/${userId}`);
  },
  updateProfile: (userId, params) => {
    return axiosInstance.put(`/users/${userId}`, params);
  },
  changePassword: (userId, params) => {
    return axiosInstance.post(`/users/${userId}/change-password`, params);
  },
};