import axiosInstance from "@shared/config/axios";

export const fetchStudents = async () => {
  try {
    const response = await axiosInstance.get("/users/students");
    if (response.data.status === 200) {
      return response.data.data.students;
    }
    return [];
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
};

export const fetchTeachers = async () => {
  try {
    const response = await axiosInstance.get("/users/teachers");
    if (response.data.status === 200) {
      return response.data.data.teachers;
    }
    return [];
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }
};
