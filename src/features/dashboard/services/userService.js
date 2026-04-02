import axios from "axios";

const API_URL = "https://dev-api-greenprep.onrender.com/api";

export const fetchTotalUsers = async () => {
  try {
    const response = await axios.get("/users/count");
    return response.data.count;
  } catch (error) {
    console.error("Error fetching total users:", error);
    return 0;
  }
};

export const fetchUserGrowth = async () => {
  try {
    const response = await axios.get("/users/growth");
    return response.data.map((item) => ({
      date: item.date,
      growth: item.growth,
    }));
  } catch (error) {
    console.error("Error fetching user growth:", error);
    return [];
  }
};

export const fetchStudents = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/students`);
    if (response.data.status === 200) {
      return response.data.data.students;
    }
    throw new Error("Failed to fetch students");
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

export const fetchTeachers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/teachers`);
    if (response.data.status === 200) {
      return response.data.data.teachers;
    }
    throw new Error("Failed to fetch teachers");
  } catch (error) {
    console.error("Error fetching teachers:", error);
    throw error;
  }
};
