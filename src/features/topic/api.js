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

  getDetail: (id, params) => {
    return axiosInstance.get(`/topics/${id}`, { params });
  },
 
  deleteTopic: (id) => {
    return axiosInstance.delete(`/topics/${id}`);
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
};
