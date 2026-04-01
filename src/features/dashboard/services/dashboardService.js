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

export const fetchGlobalRecentActivities = async (offset = 0, limit = 15) => {
  try {
    const response = await axiosInstance.get(`/activities/recent?limit=${limit}&offset=${offset}`);
    const activities = response.data?.data || [];
    const pagination = response.data?.pagination || { total: 0, hasMore: false };

    const actionLabels = {
      create: "Created",
      update: "Updated",
      delete: "Deleted",
    };

    const typeMap = {
      class: "class",
      session: "session",
      topic: "exam",
      question: "question",
      part: "part",
      section: "section",
    };

    const entityLabels = {
      class: "Class",
      session: "Session",
      topic: "Exam Set",
      question: "Question",
      part: "Part",
      section: "Section",
    };

    const data = activities.map((a) => {
      const action = actionLabels[a.action] || a.action;
      const entityLabel = entityLabels[a.entityType] || a.entityType;
      const title = a.details
        ? `${a.user || "Unknown"} ${action}: ${a.details}`
        : `${a.user || "Unknown"} ${action} ${entityLabel}: ${a.entityName || ""}`;

      return {
        id: a.ID,
        title,
        type: typeMap[a.entityType] || "user",
        status: action,
        timestamp: a.createdAt,
        details: a.details || "",
      };
    });

    return { data, pagination };
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return { data: [], pagination: { total: 0, hasMore: false } };
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
