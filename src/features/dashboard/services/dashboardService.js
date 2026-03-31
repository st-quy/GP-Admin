import axiosInstance from "@shared/config/axios";

export const fetchDashboardStats = async () => {
  try {
    const [studentsRes, sessionsRes, classesRes, topicsRes, sectionsRes] = await Promise.all([
      axiosInstance.get("/users/students?limit=9999"),
      axiosInstance.get("/sessions/all?limit=9999"),
      axiosInstance.get("/classes?limit=9999"),
      axiosInstance.get("/topics?limit=9999"),
      axiosInstance.get("/sections?limit=9999"),
    ]);

    const students = studentsRes.data?.data?.students || [];
    const sessions = sessionsRes.data?.data || [];
    const classes = classesRes.data?.data || [];
    const topics = topicsRes.data?.data || [];
    const sections = sectionsRes.data?.data || [];

    const activeTesting = sessions.filter(s => s.status === "ON_GOING").length;
    const gradingQueue = sessions.filter(s => s.status === "COMPLETE" && !s.isPublished).length;

    return {
      studentCount: students.length,
      activeTesting,
      gradingQueue,
      totalSessions: sessions.length,
      totalClasses: classes.length,
      totalExams: topics.length,
      totalQuestionBank: sections.length
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      studentCount: 0,
      activeTesting: 0,
      gradingQueue: 0,
      totalSessions: 0,
      totalClasses: 0,
      totalExams: 0,
      totalQuestionBank: 0
    };
  }
};

export const fetchGlobalRecentActivities = async () => {
  try {
    const [sessionsRes, studentsRes, classesRes, topicsRes] = await Promise.all([
      axiosInstance.get("/sessions/all?limit=5"),
      axiosInstance.get("/users/students?limit=5"),
      axiosInstance.get("/classes?limit=5"),
      axiosInstance.get("/topics?limit=5"),
    ]);

    const sessions = (sessionsRes.data?.data || []).map(s => ({
      id: s.ID,
      title: `New Session: ${s.sessionName}`,
      type: "session",
      timestamp: s.createdAt,
      status: "success"
    }));

    const students = (studentsRes.data?.data?.students || []).map(s => ({
      id: s.ID,
      title: `New Student: ${s.firstName} ${s.lastName}`,
      type: "user",
      timestamp: s.createdAt,
      status: "success"
    }));

    const classes = (classesRes.data || []).map(c => ({
      id: c.ID,
      title: `New Class: ${c.className}`,
      type: "class",
      timestamp: c.createdAt,
      status: "success"
    }));

    const topics = (topicsRes.data?.data || []).map(t => ({
      id: t.ID,
      title: `New Exam Set: ${t.Name}`,
      type: "exam",
      timestamp: t.createdAt,
      status: "success"
    }));

    return [...sessions, ...students, ...classes, ...topics]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 15);
  } catch (error) {
    console.error("Error fetching global activities:", error);
    return [];
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
