import axiosInstance from '@shared/config/axios';

export const QuestionApi = {
  createQuestions: (payload) => {
    return axiosInstance.post('/questions', payload);
  },
  getAll: (params) => axiosInstance.get('/questions', { params }),
  getQuestionDetailApi: (id) => axiosInstance.get(`/questions/${id}`),
  createReading: (payload) => {
    return axiosInstance.post('/questions/reading/create', payload);
  },
};
