import axiosInstance from '@shared/config/axios';

export const SectionApi = {
  getList: (params = {}) => {
    return axiosInstance.get('/sections', { params });
  },
  getDetail: (id, skillName) => {
    return axiosInstance.get(`/sections/${id}`, {
      params: {
        skillName,
      },
    });
  },
  deleteSection: (id) => {
    return axiosInstance.delete(`/sections/${id}`);
  },
};
