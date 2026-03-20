// @ts-nocheck
// hooks/useCreateSpeaking.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { QuestionApi } from '../api';

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { partId } = useParams();

  return useMutation({
    mutationFn: async (params) => {
      const payload = {
        ...params,
        PartID: params.PartID || partId,
      };
      const { data } = await QuestionApi.createQuestions(payload);
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sections'] });
      await queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
    onError(error) {
      const msg = error?.response?.data?.message || 'Create failed';
      message.error(msg);
    },
  });
};

export const useGetQuestions = (queryParams) => {
  return useQuery({
    queryKey: ['questions', queryParams],
    queryFn: async () => {
      const res = await QuestionApi.getAll(queryParams);
      return res.data.data;
    },
    keepPreviousData: true,
  });
};

export const useGetQuestionDetail = (id) => {
  return useQuery({
    queryKey: ['question-detail', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await QuestionApi.getQuestionDetailApi(id);
      return res.data?.data ?? res.data;
    },
  });
};

export const useCreateQuestionReading = () => {
  const navigate = useNavigate();
  const { partId } = useParams();

  return useMutation({
    mutationFn: async (params) => {
      const { data } = await QuestionApi.createReading(params);
      return data.data;
    },
    onError(error) {
      const msg = error?.response?.data?.message || 'Create failed';
      message.error(msg);
    },
  });
};

export const useGetQuestionGroupDetail = (skillName, sectionId) => {
  return useQuery({
    queryKey: ['question-group-detail', skillName, sectionId],
    queryFn: async () => {
      const res = await QuestionApi.getDetail({ skillName, sectionId });
      return res.data.data;
    },
    enabled: !!skillName && !!sectionId,
    retry: 1,
  });
};

export const useUpdateQuestionGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sectionId, payload }) => {
      const { data } = await QuestionApi.update({
        sectionId,
        payload,
      });
      return data;
    },

    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sections'] }),
        queryClient.invalidateQueries({ queryKey: ['question-group-detail'] }),
        queryClient.invalidateQueries({ queryKey: ['question-group-detail', variables?.payload?.SkillName, variables?.sectionId] }),
      ]);
    },

    onError(error) {
      const msg = error?.response?.data?.message || 'Update failed';
      message.error(msg);
    },
  });
};
