// hooks/useGetPartsBySkill.ts
// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { PartApi } from '../api';

export const useGetPartsBySkillName = (skillName, options = {}) => {
  return useQuery({
    queryKey: ['parts', 'by-skill', skillName],
    queryFn: async () => {
      const { data } = await PartApi.getListBySkill(skillName);
      return data.data || [];
    },
    ...options,
  });
};

export const useGetParts = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['parts', params],
    queryFn: async () => {
      const { data } = await PartApi.getList(params);
      return data || [];
    },
    keepPreviousData: true,
    ...options,
  });
};
