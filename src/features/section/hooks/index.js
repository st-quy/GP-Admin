import { useQuery } from "@tanstack/react-query";
import { SectionApi } from "../api";
import { message } from "antd";

export const useGetSections = (skillName, options = {}) => {
  return useQuery({
    queryKey: ["sections", 'by-skill', skillName],
    queryFn: async () => {
      try {
        const { data } = await SectionApi.getAllBySkill(skillName);
        return data.data || [];
        } catch (error) {
        message.error(error.response?.data?.message);
        return null;
      }
    }, ...options,
    });
};