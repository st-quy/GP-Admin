// File: src/features/account/accountAPI.js
import axiosInstance from "@shared/config/axios";

export const createTeachers = async (data) => {
  return await axiosInstance.post("/users/register", data);
};
export const updateTeachers = async (data) => {
  return await axiosInstance.put(`/users/${data.ID}`, data);
};
export const getTeachers = async (data) => {
  const res = await axiosInstance.get(`/users/teachers`, {
    params: data,
  });
  return res.data;
};
