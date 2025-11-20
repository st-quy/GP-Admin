// @ts-nocheck
// hooks/useCreateSpeaking.ts
import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { QuestionApi } from '../api';

export const useCreateSpeaking = () => {
  const navigate = useNavigate();
  const { partId } = useParams();

  return useMutation({
    mutationFn: async (params) => {
      const payload = {
        ...params,
        PartID: params.PartID || partId,
      };

      const { data } = await QuestionApi.createSpeaking(payload);

      message.success(
        data.message || 'Created speaking questions successfully!'
      );
      return data.data;
    },
    onSuccess() {
      navigate(-1);
    },
    onError(error) {
      const msg = error?.response?.data?.message || 'Create speaking failed';
      message.error(msg);
    },
  });
};
