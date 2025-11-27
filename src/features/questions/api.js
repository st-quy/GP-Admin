import axiosInstance from '@shared/config/axios';

export const QuestionApi = {
  createSpeaking: (payload) => {
    return axiosInstance.post('/questions', payload);
  },
  getAll: (params) => axiosInstance.get('/questions', { params }),
  getQuestionDetailApi: (id) => axiosInstance.get(`/questions/${id}`),
};
