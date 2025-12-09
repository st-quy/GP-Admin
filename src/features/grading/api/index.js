import axiosInstance from "@shared/config/axios";

export const ParticipantApi = {
  getParticipantDetail: (participantId) => {
    return axiosInstance.get(`/session-participants/detail/${participantId}`);
  },
  getParticipants: (sessionId, { page = 1, limit = 10 } = {}) => {
    return axiosInstance.get(`/session-participants/${sessionId}`, {
      params: { page, limit },
    });
  },
};

export const GradeApi = {
  getGrade: (participantId, skill) => {
    return axiosInstance.get(
      `/grades/participants?sessionParticipantId=${participantId}&skillName=${skill}`
    );
  },
  postGrade: (params) => {
    return axiosInstance.post(`/grades/teacher-grade`, params);
  },
};

export const getAudioFileName = async (classId, sessionId) => {
  const [classRes, sessionRes] = await Promise.all([
    axiosInstance.get(`/classes/${classId}`),
    axiosInstance.get(`/sessions/${sessionId}`),
  ]);

  return {
    className: classRes.data.data.className,
    sessionName: sessionRes.data.data.sessionName,
    session: sessionRes.data.data,
  };
};

export const fetchExamReview = async (sessionParticipantId) => {
  try {
    const response = await axiosInstance.get(`/grades/review/${sessionParticipantId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching exam review:', error)
    throw error
  }
}