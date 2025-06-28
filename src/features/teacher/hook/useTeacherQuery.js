import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTeachers, createTeachers, updateTeachers } from "../api/teacherAPI";

// Fetch teachers
export const useFetchTeachers = (filterData = {}) => {
  return useQuery({
    queryKey: ["teachers", filterData],
    queryFn: () => getTeachers(filterData),
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
