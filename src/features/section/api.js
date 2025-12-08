import axiosInstance from "@shared/config/axios";

export const SectionApi = {
    getAllBySkill: (params) => { 
        return axiosInstance.get("/sections", {
      params: { skillName: params },
    });
    },
}