import axiosInstance from '@shared/config/axios';

export const QuestionApi = {
  createSpeaking: (payload) => {
    return axiosInstance.post('/questions', payload);
  },
};
