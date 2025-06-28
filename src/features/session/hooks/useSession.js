import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSessionParticipants,
  fetchSessionRequests,
  fetchStudentParticipants,
  approveRequest,
  rejectRequest,
  publishScoresAndSendEmails,
  getSessionById,
  getStudentById,
  putStudentLevel,
  publishScores,
} from "../api/session_api";
import { message } from "antd";

export const useSessionParticipants = (
  sessionId,
  { page = 1, limit = 10 } = {}
) => {
  return useQuery({
    queryKey: ["sessionParticipants", sessionId, page, limit],
    queryFn: () => fetchSessionParticipants(sessionId, { page, limit }),
    enabled: !!sessionId,
  });
};

export const useStudentParticipants = (
  studentId,
  { page = 1, limit = 10 } = {}
) => {
  return useQuery({
    queryKey: ["studentParticipants", studentId, page, limit],
    queryFn: () => fetchStudentParticipants(studentId, { page, limit }),
    enabled: !!studentId,
  });
};
export const useSessionRequests = (sessionId) => {
  return useQuery({
    queryKey: ["sessionRequests", sessionId],
    queryFn: () => fetchSessionRequests(sessionId),
    refetchInterval: 10000,
    enabled: !!sessionId,
  });
};
// Hook approve request
export const useApproveRequest = (sessionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId) => approveRequest(sessionId, requestId),
    onSuccess: () => {
      message.success("Request has been approved!");
      queryClient.invalidateQueries({
        queryKey: ["sessionRequests", sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["sessionParticipants"] });
    },
    onError: (error) => {
      message.error("Error approving request: " + error.message);
    },
  });
};

// Hook reject request
export const useRejectRequest = (sessionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId) => rejectRequest(sessionId, requestId),
    onSuccess: () => {
      message.success("Request has been rejected!");
      queryClient.invalidateQueries({
        queryKey: ["sessionRequests", sessionId],
      });
    },
    onError: (error) => {
      message.error("Error rejecting request: " + error.message);
    },
  });
};
export const useApproveSelectedRequest = (sessionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestIds) =>
      Promise.all(
        // @ts-ignore
        requestIds.map((requestId) => approveRequest(sessionId, requestId))
      ),
    onSuccess: () => {
      message.success("Selected Requests has been approved!");
      queryClient.invalidateQueries({
        queryKey: ["sessionRequests", sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["sessionParticipants"] });
    },
    onError: (error) => {
      message.error("Error approving request: " + error.message);
    },
  });
};

// Hook reject request
export const useRejectSelectedRequest = (sessionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestIds) =>
      Promise.all(
        // @ts-ignore
        requestIds.map((requestId) => rejectRequest(sessionId, requestId))
      ),
    onSuccess: () => {
      message.success("Selected Requests has been rejected!");
      queryClient.invalidateQueries({
        queryKey: ["sessionRequests", sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["sessionParticipants"] });
    },
    onError: (error) => {
      message.error("Error rejecting request: " + error.message);
    },
  });
};

export const usePublishScoresAndSendEmails = (onSuccessCallback) => {
  return useMutation({
    mutationFn: (participants) => publishScoresAndSendEmails(participants),
    onSuccess: () => {
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      console.error("Error publishing scores:", error);
      message.error("Some emails failed to send. Please try again.");
    },
  });
};

// Get session by ID
export const useSessionDetails = (sessionId) => {
  return useQuery({
    queryKey: ["sessionDetails", sessionId],
    queryFn: () => getSessionById(sessionId),
    enabled: !!sessionId,
  });
};

//Get Student by ID
export const useStudentDetails = (studentId) => {
  return useQuery({
    queryKey: ["studentDetails", studentId],
    queryFn: () => getStudentById(studentId),
    enabled: !!studentId,
  });
};


export const useUpdateLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => putStudentLevel(params),
    onSuccess: () => {
      message.success("Updated level successfully")
      queryClient.invalidateQueries({ queryKey: ["sessionParticipants"] });
    },
    onError: (error) => {
      message.error("Error approving request: " + error.message);
    },
  });
};

export const usePublishScores = (sessionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => publishScores(sessionId),
    onSuccess: () => {
      message.success("Publish Scores successfully")
      queryClient.invalidateQueries({ queryKey: ["sessionParticipants"] });
      queryClient.invalidateQueries({ queryKey: ["sessionDetails"] });
    },
    onError: (response) => {
      message.error("Some students are missing scores or levels. Please waiting or complete the data before publishing.");
    },
  });
};