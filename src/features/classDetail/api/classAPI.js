import axiosInstance from "@shared/config/axios";

export const ClassDetailApi = {
  getClassById: (classId) => {
    return axiosInstance.get(`/classes/${classId}`);
  },
  generateSessionKey: () => {
    return axiosInstance.get(`/sessions/generate-key`);
  },
  createSession: (sessionData) => {
    return axiosInstance.post(`/sessions`, sessionData);
  },
  updateSession: (sessionId, sessionData) => {
    return axiosInstance.put(`/sessions/${sessionId}`, sessionData);
  },
  deleteSession: (sessionId) => {
    return axiosInstance.delete(`/sessions/${sessionId}`);
  },
  getSessionById: (sessionId) => {
    return axiosInstance.get(`/sessions/${sessionId}`);
  },
  getTopics: (params) => {
    return axiosInstance.get(`/topics`, {params});
  },
};
