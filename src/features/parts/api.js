import axiosInstance from '@shared/config/axios';

export const PartApi = {
  getListBySkill: (params) => {
    return axiosInstance.get('/parts', {
      params: { skillName: params },
    });
  },
};
