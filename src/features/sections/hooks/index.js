// hooks/useGetPartsBySkill.ts
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { SectionApi } from '../api';
import { message } from 'antd';

export const useGetSections = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['sections', params],
    queryFn: async () => {
      const { data } = await SectionApi.getList(params);
      return data || [];
    },
    keepPreviousData: true,
    ...options,
  });
};

export const useGetSectionDetail = (id, skillName) => {
  return useQuery({
    queryKey: ['sectionsDetail', id, skillName],
    queryFn: async () => {
      const { data } = await SectionApi.getDetail(id, skillName);
      return data.data || [];
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sectionId) => {
      const response = await SectionApi.deleteSection(sectionId);
      return response.data;
    },
    onSuccess: (data) => {
      message.success('Question deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
    onError: ({ response }) => {
      const errorMsg = response?.data?.message || 'Failed to delete question';
      message.error(errorMsg);
    },
  });
};
