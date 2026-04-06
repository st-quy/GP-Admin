import axiosInstance from '@shared/config/axios';

export const SectionApi = {
  createDraft: (skillName) => {
    return axiosInstance.post('/sections/draft', { skillName });
  },
  getDraft: (skillName) => {
    return axiosInstance.get(`/sections/draft/${skillName}`);
  },
  deleteDraft: (sectionId) => {
    return axiosInstance.delete(`/sections/${sectionId}`);
  },
  updateStatus: (sectionId, status) => {
    return axiosInstance.put(`/sections/${sectionId}/status`, { Status: status });
  },
};

export const QuestionApi = {
  createQuestions: (payload) => {
    return axiosInstance.post('/questions', payload);
  },
  createSpeaking: (payload) => {
    return axiosInstance.post('/questions/speaking', payload);
  },
  getAll: (params) => axiosInstance.get('/questions', { params }),
  getQuestionDetailApi: (id) => axiosInstance.get(`/questions/${id}`),
  createReading: (payload) => {
    return axiosInstance.post('/questions/reading/create', payload);
  },
  getDetail: ({ skillName, sectionId }) => {
    return axiosInstance.get('/questions/detail', {
      params: { skillName, sectionId },
    });
  },
  update: ({ sectionId, payload }) => {
    return axiosInstance.put(`/questions/update/${sectionId}`, payload);
  },
};
