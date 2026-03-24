import axiosInstance from "@shared/config/axios";

export const ClassApi = {
  getAll: (teacherId = null) => {
    return axiosInstance.get("/classes", {
      params: {
        teacherId,
      },
    });
  },
  createClass: (params) => {
    return axiosInstance.post(`/classes`, params);
  },
  updateClass: (classId, params) => {
    return axiosInstance.put(`/classes/${classId}`, params);
  },
  deleteClass: (classId) => {
    return axiosInstance.delete(`/classes/${classId}`);
  },
};

export const ExcelApi = {
  exportExcel: () => {
    return axiosInstance.get("excel/export-template", { responseType: "blob" });
  },
  importExcel: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosInstance.post("excel/import-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
