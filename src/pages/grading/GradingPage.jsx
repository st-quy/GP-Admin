import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import Assessment from "@features/grading/ui/Assessment";
import AssessmentScores from "@features/grading/ui/AssessmentScores";
import StudentInfoCard from "@features/grading/ui/StudentInfoCard";
import StudentListModal from "@features/grading/ui/StudentListModal";
import ScrollToTop from "@features/grading/utils/ScrollToTop";

import {
  useGetParticipants,
  useGetSpeakingQuestionsAnswers,
  useGetWritingQuestionsAnswers,
  useAudioFileName,
  useGetParticipantDetail,
} from "@features/grading/hooks";

const GradingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, participantId, classId } = useParams();

  const { data: audioFileName } = useAudioFileName(classId, sessionId);

  const currentParticipantIdRef = useRef(participantId);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [speakingComments, setSpeakingComments] = useState([]);
  const [writingComments, setWritingComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9999); // Set a large page size to fetch all participants
  const [isChangingParticipant, setIsChangingParticipant] = useState(false);

  const [editedCommentIds, setEditedCommentIds] = useState(new Set());

  const {
    isPending: isWritingPending,
    data: writingData,
    refetch: refetchWriting,
  } = useGetWritingQuestionsAnswers(participantId);
  const {
    isPending: isSpeakingPending,
    data: speakingData,
    refetch: refetchSpeaking,
  } = useGetSpeakingQuestionsAnswers(participantId);
  const { isPending: isParticipantsPending, data: participantsData } =
    useGetParticipants(sessionId, { page: currentPage, limit: pageSize });

  const { data: participantDetail } = useGetParticipantDetail(participantId);

  const onTabChange = (key) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("skill", key ? "speaking" : "writing");
    const newQueryString = searchParams.toString();
    const newUrl = `${location.pathname}?${newQueryString}`;
    window.history.replaceState(null, "", newUrl);
    navigate(newUrl);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const skillParam = searchParams.get("skill");

    if (skillParam === "speaking") {
      setIsSpeaking(true);
    } else {
      setIsSpeaking(false);
    }
  }, [location.search]);

  // Handle participant change
  useEffect(() => {
    if (currentParticipantIdRef.current !== participantId) {
      setIsChangingParticipant(true);
      refetchWriting();
      refetchSpeaking();

      setSpeakingComments([]);
      setWritingComments([]);
      setEditedCommentIds(new Set());

      currentParticipantIdRef.current = participantId;
    }
  }, [participantId]);

  // Extract comments from database data
  const extractCommentsFromData = (data, part) => {
    if (
      !data ||
      !data.data ||
      !data.data.data ||
      !data.data.data.topic ||
      !data.data.data.topic.Parts
    ) {
      return [];
    }

    const comments = [];
    try {
      const partData = data.data.data.topic.Parts.find(
        (p) =>
          p.Content &&
          p.Content.toLowerCase().includes(`part ${part}`.toLowerCase())
      );

      if (partData && partData.Questions) {
        partData.Questions.forEach((question) => {
          if (
            question.studentAnswer &&
            question.studentAnswer.ID &&
            question.studentAnswer.Comment
          ) {
            const commentId = `${question.studentAnswer.ID}-${part}`;
            if (!editedCommentIds.has(commentId)) {
              comments.push({
                studentAnswerId: question.studentAnswer.ID,
                messageContent: question.studentAnswer.Comment,
                part: part,
              });
            }
          }
        });
      }
    } catch (error) {
      console.error("Error extracting comments:", error);
    }

    return comments;
  };

  // Initialize writing comments from database when data is loaded
  useEffect(() => {
    if (!isWritingPending && writingData) {
      if (currentParticipantIdRef.current === participantId) {
        const allWritingComments = [];
        for (let part = 1; part <= 4; part++) {
          const partComments = extractCommentsFromData(
            writingData,
            part.toString()
          );
          allWritingComments.push(...partComments);
        }
        setWritingComments((prevComments) => {
          // Keep comments that have been edited by the user
          const userEditedComments = prevComments.filter((comment) =>
            editedCommentIds.has(`${comment.studentAnswerId}-${comment.part}`)
          );
          // Filter out database comments that conflict with user edits
          const newComments = allWritingComments.filter(
            (newComment) =>
              !userEditedComments.some(
                (editedComment) =>
                  editedComment.studentAnswerId ===
                    newComment.studentAnswerId &&
                  editedComment.part === newComment.part
              )
          );

          return [...userEditedComments, ...newComments];
        });

        setIsChangingParticipant(false);
      }
    }
  }, [isWritingPending, writingData, participantId, editedCommentIds]);

  // Initialize speaking comments from database when data is loaded
  useEffect(() => {
    if (!isSpeakingPending && speakingData) {
      if (currentParticipantIdRef.current === participantId) {
        const allSpeakingComments = [];
        for (let part = 1; part <= 4; part++) {
          const partComments = extractCommentsFromData(
            speakingData,
            part.toString()
          );
          allSpeakingComments.push(...partComments);
        }
        setSpeakingComments((prevComments) => {
          // Keep comments that have been edited by the user
          const userEditedComments = prevComments.filter((comment) =>
            editedCommentIds.has(`${comment.studentAnswerId}-${comment.part}`)
          );
          // Filter out database comments that conflict with user edits
          const newComments = allSpeakingComments.filter(
            (newComment) =>
              !userEditedComments.some(
                (editedComment) =>
                  editedComment.studentAnswerId ===
                    newComment.studentAnswerId &&
                  editedComment.part === newComment.part
              )
          );

          return [...userEditedComments, ...newComments];
        });

        setIsChangingParticipant(false);
      }
    }
  }, [isSpeakingPending, speakingData, participantId, editedCommentIds]);

  // Handle comment changes from Assessment component
  const handleCommentChange = (commentData) => {
    const {
      studentAnswerId,
      messageContent,
      isSpeaking,
      part,
      isPartFour,
      allStudentAnswerIds,
    } = commentData;

    if (isChangingParticipant) return;

    // Mark this comment as edited by the user
    const commentId = `${studentAnswerId}-${part}`;
    setEditedCommentIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(commentId);
      return newSet;
    });

    if (isSpeaking) {
      // Special handling for speaking part 4
      if (isPartFour && allStudentAnswerIds && allStudentAnswerIds.length > 0) {
        setSpeakingComments((prevComments) => {
          const updatedComments = [...prevComments];
          const filteredComments = updatedComments.filter(
            (comment) =>
              !(
                comment.part === "4" &&
                allStudentAnswerIds.includes(comment.studentAnswerId)
              )
          );
          const newComments = allStudentAnswerIds.map((id) => {
            // Mark all part 4 comments as edited
            setEditedCommentIds((prev) => {
              const newSet = new Set(prev);
              newSet.add(`${id}-4`);
              return newSet;
            });

            return {
              studentAnswerId: id,
              messageContent,
              part: "4",
            };
          });

          return [...filteredComments, ...newComments];
        });
      } else {
        setSpeakingComments((prevComments) => {
          const existingIndex = prevComments.findIndex(
            (comment) =>
              comment.studentAnswerId === studentAnswerId &&
              comment.part === part
          );
          if (existingIndex >= 0) {
            const updatedComments = [...prevComments];
            updatedComments[existingIndex] = {
              studentAnswerId,
              messageContent,
              part,
            };
            return updatedComments;
          } else {
            return [...prevComments, { studentAnswerId, messageContent, part }];
          }
        });
      }
    } else {
      setWritingComments((prevComments) => {
        const existingIndex = prevComments.findIndex(
          (comment) =>
            comment.studentAnswerId === studentAnswerId && comment.part === part
        );

        if (existingIndex >= 0) {
          const updatedComments = [...prevComments];
          updatedComments[existingIndex] = {
            studentAnswerId,
            messageContent,
            part,
          };
          return updatedComments;
        } else {
          return [...prevComments, { studentAnswerId, messageContent, part }];
        }
      });
    }
  };

  // Function to prepare comments for submission
  const prepareCommentsForSubmission = (comments) => {
    const groupedComments = {};

    comments.forEach((comment) => {
      groupedComments[comment.studentAnswerId] = {
        studentAnswerId: comment.studentAnswerId,
        messageContent: comment.messageContent,
      };
    });

    return Object.values(groupedComments);
  };

  // Function to handle the change of participant
  const changeParticipant = (participantId) => {
    const newPath = location.pathname.replace(
      /participant\/[^/]+/,
      `participant/${participantId}`
    );
    setIsModalOpen(false);
    setIsSpeaking(false);
    navigate(newPath);
  };

  const handleNextParticipant = () => {
    if (!participantsData?.data.data) return;

    if (participantsData?.data.data.length > 1) {
      const currentIndex = participantsData?.data.data.findIndex(
        (item) => item.ID === participantId
      );
      const nextIndex = (currentIndex + 1) % participantsData?.data.data.length;
      const nextParticipantId = participantsData?.data.data[nextIndex].ID;
      changeParticipant(nextParticipantId);
    }
  };

  const handlePreviousParticipant = () => {
    if (!participantsData?.data.data) return;
    if (participantsData?.data.data.length > 1) {
      const currentIndex = participantsData?.data.data.findIndex(
        (item) => item.ID === participantId
      );
      const previousIndex =
        (currentIndex - 1 + participantsData?.data.data.length) %
        participantsData?.data.data.length;
      const previousParticipantId =
        participantsData?.data.data[previousIndex].ID;
      changeParticipant(previousParticipantId);
    }
  };

  const userData = participantDetail || {};

  if (isWritingPending || isSpeakingPending || isParticipantsPending)
    return (
      <Spin size="large" className="flex justify-center items-center h-60" />
    );

  return (
    <div className="p-8">
      <ScrollToTop />
      {/* Student Information Card */}
      <StudentInfoCard
        student={userData}
        onViewList={() => setIsModalOpen(true)}
        onNext={handleNextParticipant}
        onPrevious={handlePreviousParticipant}
      />
      <AssessmentScores
        onTabChange={onTabChange}
        key={participantId}
        isUserChange={isChangingParticipant}
        currentUser={participantId}
        speakingComments={prepareCommentsForSubmission(speakingComments)}
        writingComments={prepareCommentsForSubmission(writingComments)}
        isSpeaking={isSpeaking}
        audioFileName={audioFileName}
      />
      <Assessment
        key={`assessment-${isSpeaking ? "speaking" : "writing"}`}
        fileNameInfo={`${audioFileName?.className}-${audioFileName?.sessionName}-${userData?.User?.studentCode}-${userData?.User?.fullName}`}
        isSpeaking={isSpeaking}
        currentUser={participantId}
        data={isSpeaking ? speakingData : writingData}
        onCommentChange={handleCommentChange}
        speakingComments={speakingComments}
        writingComments={writingComments}
      />
      {/* Student List Modal */}
      <StudentListModal
        currentUser={userData}
        data={participantsData?.data.data}
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        handleSelect={changeParticipant}
      />
    </div>
  );
};

export default GradingPage;
