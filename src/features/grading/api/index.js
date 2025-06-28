import axiosInstance from "@shared/config/axios";

export const ParticipantApi = {
  getParticipant: (sessionId, participantId) => {
    return axiosInstance.get(``);
  },
  getParticipants: (sessionId) => {
    return axiosInstance.get(`/session-participants/${sessionId}`);
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
    session: sessionRes.data.data
  };
};
