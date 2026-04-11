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
      message.success('Topic deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
    onError: ({ response }) => {
      const errorMsg = response?.data?.message || 'Failed to delete question';
      message.error(errorMsg);
    },
  });
};

export const useUpdateSectionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, Status }) => {
      const response = await SectionApi.updateStatus(id, Status);
      return response.data;
    },
    onSuccess: (data) => {
      message.success(data.message || 'Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
    onError: ({ response }) => {
      const errorMsg = response?.data?.message || 'Failed to update status';
      message.error(errorMsg);
    },
  });
};

export const useDuplicateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => SectionApi.duplicateSection(id),
    onSuccess: (response) => {
      message.success(response.data.message || 'Question Bank duplicated successfully');
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
    onError: ({ response }) => {
      const errorMsg = response?.data?.message || 'Failed to duplicate question bank';
      message.error(errorMsg);
    },
  });
};

export const useBulkPublishSections = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => SectionApi.bulkPublish(ids),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
    onError: ({ response }) => {
      const errorMsg = response?.data?.message || 'Failed to bulk publish sections';
      message.error(errorMsg);
    },
  });
};

export const useBulkDeleteSections = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => SectionApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
    onError: ({ response }) => {
      const errorMsg = response?.data?.message || 'Failed to bulk delete sections';
      message.error(errorMsg);
    },
  });
};

export const useBulkDuplicateSections = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => SectionApi.bulkDuplicate(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
    onError: ({ response }) => {
      const errorMsg = response?.data?.message || 'Failed to bulk duplicate sections';
      message.error(errorMsg);
    },
  });
};

export const useGetAllTags = (options = {}) => {
  return useQuery({
    queryKey: ['sectionTags'],
    queryFn: async () => {
      const { data } = await SectionApi.getAllTags();
      return data?.data || [];
    },
    ...options,
  });
};
