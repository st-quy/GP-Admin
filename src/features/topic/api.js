import axiosInstance from "@shared/config/axios";

export const TopicApi = {
  create: (payload) => {
    return axiosInstance.post("/topics", payload);
  },

  getAll: (params) => {
    return axiosInstance.get("/topics", { params });
  },

  getTopicByName: (name) => {
    return axiosInstance.get("/topics/detail", {
      params: { name },
    });
  },

  getTopicWithRelations: (id, params) => {
    return axiosInstance.get(`/topics/${id}`, { params });
  },

  getDetail: (id, params) => {
    return axiosInstance.get(`/topics/${id}`, { params });
  },
 
  deleteTopic: (id) => {
    return axiosInstance.delete(`/topics/${id}`);
  },

  updateTopic: (id, data) => {
    return axiosInstance.put(`/topics/${id}`, data);
  },

  createTopicSection: (TopicID, SectionID) => {
    return axiosInstance.post("/topicsections", {
      TopicID,
      SectionID,
    });
  },

  removeTopicSection: (id) => {
    return axiosInstance.delete(`/topicsections/${id}`);
  },
  deleteTopicSectionbyTopicID: (TopicID) => {
    return axiosInstance.delete(`/topicsections/topic/${TopicID}`);
  },

  updateTopicSection: (TopicID, data) => {
    return axiosInstance.put(`/topicsections/topic/${TopicID}`, data);
  },

  duplicateTopic: (id) => {
    return axiosInstance.post(`/topics/${id}/duplicate`);
  },

  bulkUpdateStatus: (ids, status) => {
    return axiosInstance.patch('/topics/bulk-status', { ids, status });
  },

  bulkDelete: (ids) => {
    return axiosInstance.delete('/topics/bulk', { data: { ids } });
  },

  bulkDuplicate: (ids) => {
    return axiosInstance.post('/topics/bulk-duplicate', { ids });
  },
};
