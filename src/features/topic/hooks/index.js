// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { TopicApi } from "../api";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

// export const useGetTopicDetail = () => {
//   const { topicData } = useSelector((state) => state.session);
//     return useQuery({
//       queryKey: ["topicDetail", topicData?.examSet],
//       queryFn: async () => {
//         try {
//           const { data } = await TopicApi.getTopicDetail(topicData?.examSet);
//           return data;
//         } catch (error) {
//           message.error(error.response?.data?.message);
//           return null;
//         }
//       },
//       enabled: !!topicData?.examSet,
//     });
//   };

//   export const useGetTopics = () => {
//       return useQuery({
//         queryKey: ["topics"],
//         queryFn: async () => {
//           try {
//             const { data } = await TopicApi.getAllTopic();
//             return data.data;
//           } catch (error) {
//             message.error(error.response?.data?.message);
//             return null;
//           }
//         },
//       });
//     };

export const useGetTopics = () => {
  return useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      try {
        const { data } = await TopicApi.getAll();
        return data.data;
      } catch (error) { 
        message.error(error.response?.data?.message);
        return null;
      } 
    },
  });
};

export const useCreateTopic = () => {  
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await TopicApi.create(payload);
      return data.data;
    }
    ,
    onError(error) {
      const msg = error?.response?.data?.message || "Create topic failed";
      message.error(msg);
    },
  });
} ;

export const useCreateTopicSection = () => {
  return useMutation({
    mutationFn: async ({ topicId, sectionId }) =>{
      const { data } = await TopicApi.createTopicSection(topicId, sectionId);
      return data.data;
  },
  onError(error) {
    const msg = error?.response?.data?.message || "Create topic section failed";
    message.error(msg);
  },
  });
};

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => TopicApi.deleteTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
    onError: (error) => {
      console.error("Error deleting topic:", error);
    },
  });
};

export const useDeleteTopicSectionByTopicId = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (topicId) => TopicApi.deleteTopicSectionbyTopicID(topicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["topicSections"] });
    },
    onError: (error) => {
      console.error("Error deleting TopicSection by TopicID:", error);
    },
  });
};


