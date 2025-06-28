import axios from "axios";

export const fetchAllSessions = async () => {
  try {
    const response = await axios.get("/sessions/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
};

export const getSessionStatusStatistics = async () => {
  try {
    const response = await axios.get("/sessions/statistics");
    return response.data;
  } catch (error) {
    console.error("Error fetching session statistics:", error);
    return [];
  }
};

export const getRecentActivities = async () => {
  try {
    const response = await axios.get("/activities/recent");
    return response.data.map((activity) => ({
      ...activity,
      timestamp: new Date(activity.timestamp),
    }));
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return [];
  }
};
