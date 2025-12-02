// @ts-nocheck
// hooks/useCreateSpeaking.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { QuestionApi } from '../api';

export const useCreateQuestion = () => {
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
