import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClassApi, ExcelApi } from "../api";
import { message } from "antd";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { transformExcelDataToStructuredJSON } from "@shared/lib/utils/transformExcelDataToStructuredJSON";

export const fileInputRef = { current: null };

export const handleImportClick = () => {
  if (fileInputRef.current) {
    fileInputRef.current.value = ""; // reset để lần sau chọn cùng file vẫn trigger onChange
  }
  fileInputRef.current?.click();
};

export const handlePreviewFile = (file, setIsModalOpen, setDataExam) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    // @ts-ignore
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];

    // Dòng dữ liệu thô: mảng 2 chiều
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      range: "A1:M76", // CHỈ ĐỌC A1->M76, không lấy cột N, O, ...
    });

    // Chỉ giữ lại các cột từ A đến M (index 0 -> 12)
    const trimmedData = rawData.map((row) => row.slice(0, 13));
    const dataReal = transformExcelDataToStructuredJSON(trimmedData);
    setDataExam(dataReal);
    setIsModalOpen(true);
  };

  reader.readAsArrayBuffer(file);
};

export const handleFileChange = async (e) => {
  const file = e;
  if (!file) return;

  try {
    const response = await ExcelApi.importExcel(file);

    const result = response.data;

    if (result?.status === 200) {
      message.success("Import successfully");
    }
  } catch (error) {
    const status = error?.response?.status;
    const messageText = error?.response?.data?.message || error.message;

    if (status === 400) {
      message.error(messageText || "Import failed (data invalid)");
    } else {
      message.error("Import failed: " + messageText);
    }
  }
};

export const handleExportExcel = async (setExportLoading) => {
  try {
    const response = await ExcelApi.exportExcel();
    const blob = new Blob([response.data], {
      type:
        response.headers["content-type"] ||
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "template.xlsx";
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);

    message.success("Export successful");
  } catch (error) {
    console.error("Export error", error);
    message.error("Export failed");
  } finally {
    setExportLoading(false);
  }
};

export const useGetAllClass = (teacherId = null) => {
  return useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data } = await ClassApi.getAll(teacherId);
      return data.data;
    },
  });
};

export const useCreateClass = () => {
  // @ts-ignore
  const { user } = useSelector((state) => state.auth);

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const response = await ClassApi.createClass({
        // @ts-ignore
        ...params,
        userId: user.userId,
      });
      return response.data;
    },
    // @ts-ignore
    onSuccess: (data) => {
      message.success("Class created successfully");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    // @ts-ignore
    onError: ({ response }) => {
      message.error(response.data.message || "Failed to create class");
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      // @ts-ignore
      const response = await ClassApi.updateClass(params.classId, {
        // @ts-ignore
        className: params.className,
      });
      return response.data;
    },
    // @ts-ignore
    onSuccess: (data) => {
      message.success("Class updated successfully");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    // @ts-ignore
    onError: ({ response }) => {
      // Hiển thị error message từ backend
      message.error(response?.data?.message || "Failed to update class");
    },
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (classId) => {
      const response = await ClassApi.deleteClass(classId);
      return response.data;
    },
    // @ts-ignore
    onSuccess: (data) => {
      message.success("Deleted class successfully");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    // @ts-ignore
    onError: ({ response }) => {
      message.error("Can't delete this class because it has sessions");
    },
  });
};
