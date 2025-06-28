import axiosInstance from "@shared/config/axios";

export const TopicApi = {
    getTopicDetail: (value) => {
      return axiosInstance.get(
        "/topics/detail", {
            params: {
                name: value
            }
        }
      );
    },
    getAllTopic: () => {
      return axiosInstance.get("/topics");
    },
  };