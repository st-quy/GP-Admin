import { useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { TopicApi } from "../api";
import { useSelector } from "react-redux";

export const useGetTopicDetail = () => {
  const { topicData } = useSelector((state) => state.session);
    return useQuery({
      queryKey: ["topicDetail", topicData?.examSet],
      queryFn: async () => {
        try {
          const { data } = await TopicApi.getTopicDetail(topicData?.examSet);
          return data;
        } catch (error) {
          message.error(error.response?.data?.message);
          return null;
        }
      },
      enabled: !!topicData?.examSet,
    });
  };

  export const useGetTopics = () => {
      return useQuery({
        queryKey: ["topics"],
        queryFn: async () => {
          try {
            const { data } = await TopicApi.getAllTopic();
            return data.data;
          } catch (error) {
            message.error(error.response?.data?.message);
            return null;
          }
        },
      });
    };