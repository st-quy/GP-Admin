import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClassApi, ExcelApi } from "../api";
import { message } from "antd";
import { useSelector } from "react-redux";

export const fileInputRef = { current: null };

export const handleImportClick = () => {
  fileInputRef.current?.click();
};

export const handleFileChange = async (e, queryClient, setImportLoading) => {
  const file = e.target.files[0];
  if (!file) return;

  setImportLoading(true);
  try {
    const response = await ExcelApi.importExcel(file);

    const result = response.data;

    if (result?.status === 200) {
      message.success(result?.message || "Import successful");
    }
  } catch (error) {
    const status = error?.response?.status;
    const messageText = error?.response?.data?.message || error.message;

    if (status === 400) {
      message.error(messageText || "Import failed (data invalid)");
    } else {
      message.error("Import failed: " + messageText);
    }
  } finally {
    setImportLoading(false);
    e.target.value = "";
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
  const { user } = useSelector((state) => state.auth);

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const response = await ClassApi.createClass({
        ...params,
        userId: user.userId,
      });
      return response.data;
    },
    onSuccess: (data) => {
      message.success("Class created successfully");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: ({ response }) => {
      message.error(response.data.message || "Failed to create class");
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const response = await ClassApi.updateClass(params.classId, {
        className: params.className,
      });
      return response.data;
    },
    onSuccess: (data) => {
      message.success("Class updated successfully");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
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
    onSuccess: (data) => {
      message.success("Deleted class successfully");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: ({ response }) => {
      message.error("Can't delete this class because it has sessions");
    },
  });
};
