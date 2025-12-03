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

export const useGetPartsBySkillAndSequence = (skillName, sequence, options = {}) => {
  return useQuery({
    queryKey: ['parts', 'by-skill-sequence', skillName, sequence],
    queryFn: async () => {
      const { data } = await PartApi.getListBySkillAndSequence(skillName, sequence);
      return data.data || [];
    },
    enabled: !!skillName && !!sequence,
    ...options,
  });
};

export const useGetPartById = (partId, options = {}) => {
  return useQuery({
    queryKey: ['part', partId],
    queryFn: async () => {
      const { data } = await PartApi.getPartById(partId);
      return data.data || null;
    },
    enabled: !!partId, 
    ...options,
  });
};
