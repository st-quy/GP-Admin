import axiosInstance from "@shared/config/axios";

export const TopicApi = {
  create: (payload) => {
    return axiosInstance.post("/topics", payload);
  },

  getAll: () => {
    return axiosInstance.get("/topics");
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
};
