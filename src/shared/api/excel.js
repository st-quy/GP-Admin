import axiosInstance from '@shared/config/axios';

export const ExcelApi = {
  exportTemplate: () => {
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