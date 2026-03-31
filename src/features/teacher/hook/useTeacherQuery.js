import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTeachers,
  createTeachers,
  updateTeachers,
  getTeacherById,
} from "../api/teacherAPI";

// Fetch teachers
export const useFetchTeachers = (filterData = {}) => {
  return useQuery({
    queryKey: ["teachers", filterData],
    queryFn: () => getTeachers(filterData),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFetchTeacherById = (teacherId, options = {}) => {
  return useQuery({
    queryKey: ["teacher", teacherId],
    queryFn: () => getTeacherById(teacherId),
    enabled: Boolean(teacherId) && (options.enabled ?? true),
    staleTime: 5 * 60 * 1000,
  });
};

// Create teacher
export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createTeachers(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};

// Update teacher
export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => updateTeachers(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};
