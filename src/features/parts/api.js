import axiosInstance from '@shared/config/axios';

export const PartApi = {
  getListBySkill: (params) => {
    return axiosInstance.get('/parts', {
      params: { skillName: params },
    });
  },

  // Lấy parts theo skill + sequence
  getListBySkillAndSequence: (skillName, sequence) => {
    return axiosInstance.get('/parts', {
      params: { skillName, sequence },
    });
  },
  getPartById: (id) => {
    return axiosInstance.get(`/parts/${id}`);
  },
};


