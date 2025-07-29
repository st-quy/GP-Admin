import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { GradeApi, ParticipantApi, getAudioFileName } from "../api";
import { message } from "antd";

export const useGetParticipants = (
  sessionId,
  { page = 1, limit = 10 } = {}
) => {
  return useQuery({
    queryKey: ["participants", sessionId, page, limit],
    queryFn: async () =>
      await ParticipantApi.getParticipants(sessionId, { page, limit }),
  });
};

export const useGetParticipantDetail = (participantId) => {
  return useQuery({
    queryKey: ["participantDetail", participantId],
    queryFn: async () => {
      const response = await ParticipantApi.getParticipantDetail(participantId);
      return response.data.data;
    },
  });
};

export const useGetWritingQuestionsAnswers = (participantId) => {
  return useQuery({
    queryKey: ["writing"],
    queryFn: async () => await GradeApi.getGrade(participantId, "writing"),
  });
};

export const useGetSpeakingQuestionsAnswers = (participantId) => {
  return useQuery({
    queryKey: ["speaking"],
    queryFn: async () => await GradeApi.getGrade(participantId, "speaking"),
  });
};

export const useGetGrade = (participantId, skillName) => {
  return useQuery({
    queryKey: ["grade", participantId, skillName],
    queryFn: async () => {
      const response = await GradeApi.getGrade(participantId, skillName);
      return response.data.data.scoreBySkill;
    },
  });
};

export const usePostGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const { data } = await GradeApi.postGrade(params);
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      return data.data;
    },
    onError({ response }) {
      message.error(response?.data?.message || "Post grade error");
    },
  });
};

export const useAudioFileName = (classId, sessionId) => {
  return useQuery({
    queryKey: ["audioFileName", classId, sessionId],
    queryFn: () => getAudioFileName(classId, sessionId),
    enabled: !!classId && !!sessionId,
  });
};
