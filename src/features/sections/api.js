import axiosInstance from '@shared/config/axios';

export const SectionApi = {
  getList: (params = {}) => {
    return axiosInstance.get('/sections', { params });
  },
  deleteSection: (id) => {
    return axiosInstance.delete(`/sections/${id}`);
  },
};
