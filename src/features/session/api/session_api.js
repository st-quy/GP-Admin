import axiosInstance from "@shared/config/axios";

export const fetchSessionParticipants = async (
  sessionId,
  { page = 1, limit = 10 } = {}
) => {
  try {
    const response = await axiosInstance.get(
      `/session-participants/${sessionId}`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching session participants:", error);
    throw error;
  }
};

export const fetchStudentParticipants = async (
  studentId,
  { page = 1, limit = 10 } = {}
) => {
  const response = await axiosInstance.get(
    `/session-participants/user/${studentId}`,
    {
      params: { page, limit },
    }
  );
  return response.data;
};
export const fetchSessionRequests = async (sessionId) => {
  if (!sessionId) return [];

  const response = await axiosInstance.get(`/session-requests/${sessionId}`);
  return response.data.data;
};

export const approveRequest = (sessionId, requestId) => {
  return axiosInstance.patch(`/session-requests/${sessionId}/approve`, {
    requestId,
  });
};

export const rejectRequest = (sessionId, requestId) => {
  return axiosInstance.patch(`/session-requests/${sessionId}/reject`, {
    requestId,
  });
};

export const sendEmail = async (userId, payload) => {
  try {
    const res = await axiosInstance.post(`/send-email/${userId}`, payload);
    return res.data;
  } catch (error) {
    console.error(`Failed to send email to ${userId}:`, error);
    return null;
  }
};

export const publishScoresAndSendEmails = async (participants) => {
  const emailPromises = participants.map(async (participant) => {
    const user = participant.User;
    const totalScore = participant.Total;
    const safeScore = typeof totalScore === "number" ? totalScore : "N/A";

    if (!user?.ID) {
      console.warn("Missing user ID:", participant);
      return { success: false, error: "Missing user ID" };
    }

    const emailPayload = {
      sessionName: "Your Test Session",
      testDetails: `You scored ${safeScore} in the test.`,
      nextSteps: "Please wait for the final results.",
      contactInfo: "support@example.com",
    };

    const result = await sendEmail(user.ID, emailPayload);
    return {
      success: !!result,
      error: result ? null : `Failed to send to ${user.ID}`,
    };
  });

  const results = await Promise.all(emailPromises);
  const failed = results.filter((r) => !r.success);

  if (failed.length > 0) {
    console.error("Some emails failed to send:", failed);
    throw new Error(`${failed.length} email(s) failed to send.`);
  }

  return true;
};

export const getSessionById = async (id) => {
  const response = await axiosInstance.get(`/sessions/${id}`);
  return response.data.data || response.data;
};

export const getStudentById = async (id) => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data.data || response.data;
};

export const putStudentLevel = async (params) => {  
  return axiosInstance.put(`/session-participants/${params.id}/level`, { newLevel: params.value });
};

export const publishScores = async (sessionId) => {  
  return axiosInstance.put(`/session-participants/publish-scores`, { sessionId });
};