import axiosInstance from "@shared/config/axios";

export const fetchDashboardStats = async () => {
  try {
    const [studentsRes, sessionsRes] = await Promise.all([
      axiosInstance.get("/users/students?limit=9999"),
      axiosInstance.get("/sessions/all?limit=9999"),
    ]);

    const students = studentsRes.data?.data?.students || [];
    const sessions = sessionsRes.data?.data || [];

    const activeTesting = sessions.filter(s => s.status === "ON_GOING").length;
    const gradingQueue = sessions.filter(s => s.status === "COMPLETE" && !s.isPublished).length;
    const completedTotal = sessions.filter(s => s.status === "COMPLETE").length;

    return {
      studentCount: students.length,
      activeTesting,
      gradingQueue,
      totalSessions: sessions.length,
      completedTotal
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      studentCount: 0,
      activeTesting: 0,
      gradingQueue: 0,
      totalSessions: 0,
      completedTotal: 0
    };
  }
};

export const fetchRecentActivities = async () => {
  try {
    const response = await axiosInstance.get("/activities/recent");
    return response.data;
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return [];
  }
};

export const fetchPendingRequests = async () => {
  try {
    const response = await axiosInstance.get("/session-requests");
    return response.data.filter((request) => request.status === "pending");
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return [];
  }
};

export const approveSessionRequest = async (requestId) => {
  try {
    await axiosInstance.patch(`/session-requests/${requestId}/approve`);
    return true;
  } catch (error) {
    console.error("Error approving request:", error);
    return false;
  }
};

export const rejectSessionRequest = async (requestId) => {
  try {
    await axiosInstance.patch(`/session-requests/${requestId}/reject`);
    return true;
  } catch (error) {
    console.error("Error rejecting request:", error);
    return false;
  }
};
