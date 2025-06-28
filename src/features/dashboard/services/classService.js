import axios from "axios";

export const getAllClasses = async () => {
  try {
    const response = await axios.get("/classes");
    return response.data;
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
};

export const getClassPerformance = async () => {
  try {
    const response = await axios.get("/classes/performance");
    return response.data.map((item) => ({
      classId: item.classId,
      className: item.className,
      performance: item.performance,
    }));
  } catch (error) {
    console.error("Error fetching class performance:", error);
    return [];
  }
};
