/* eslint-disable no-unsafe-optional-chaining */
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { ListeningSubmission } from "@assets/images";
import { fetchListeningTestDetails } from "@features/listening/api";
import PlayStopButton from "@features/listening/ui/play-stop-button";
import TestNavigation from "@features/listening/ui/test-navigation";
import useGlobalData from "@shared/hook/useGlobalData";
import DropdownQuestion from "@shared/ui/question-type/dropdown-question";
import MultipleChoice from "@shared/ui/question-type/multiple-choice";
import NextScreen from "@shared/ui/submission/next-screen";
import { useQuery } from "@tanstack/react-query";
import { Spin, Alert, Typography, Modal, message, Button } from "antd";
import { useState, useMemo, useEffect, useCallback } from "react";
import { calculatePoints } from "@shared/utils/calculatePoints";
const { Title } = Typography;

const STORAGE_KEY = "listening_test_answers";
const buildListeningItems = (testData, formattedAnswers) => {
  if (!testData?.Sections?.[0]?.Parts) return [];

  const parts = testData.Sections[0].Parts;

  const findQuestionById = (questionId) => {
    const idStr = String(questionId);
    for (const part of parts) {
      for (const q of part.Questions) {
        if (String(q.ID) === idStr) {
          return q;
        }
      }
    }
    return null;
  };

  return formattedAnswers.questions
    .map((qAns) => {
      const question = findQuestionById(qAns.questionId);
      if (!question) return null;

      const type = question.Type;
      const skillType = question.Part?.Skill?.Name || "LISTENING";
      const correctContent =
        typeof question.AnswerContent === "string"
          ? JSON.parse(question.AnswerContent)
          : question.AnswerContent;

      let rawStudentAnswer = null;

      if (type === "listening-questions-group") {
        // answerText: [{ ID, answer }]
        rawStudentAnswer = JSON.stringify(qAns.answerText || []);
      } else if (type === "dropdown-list") {
        // answerText: [{ key, value }]
        rawStudentAnswer = JSON.stringify(qAns.answerText || []);
      } else {
        // multiple-choice / các loại khác: string
        if (typeof qAns.answerText === "string") {
          rawStudentAnswer = qAns.answerText;
        } else {
          rawStudentAnswer = qAns.answerText ?? "";
        }
      }

      return {
        questionId: question.ID,
        type,
        skillType,
        correctContent,
        rawStudentAnswer,
      };
    })
    .filter(Boolean);
};

const ListeningTest = () => {
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState(() => {
    const savedAnswers = localStorage.getItem(STORAGE_KEY);
    return savedAnswers ? JSON.parse(savedAnswers) : {};
  });
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(
    () => localStorage.getItem("listening_test_submitted") === "true"
  );
  const {
    getGlobalData,
    errorMessage,
    setErrorMessage,
    showErrorModal,
    setShowErrorModal,
  } = useGlobalData();

  const [formattedAnswers, setFormattedAnswers] = useState(() => {
    const savedFormattedAnswers = localStorage.getItem(
      "listening_formatted_answers"
    );
    const globalData = getGlobalData();

    if (!globalData) {
      return {
        studentId: "",
        topicId: "",
        skillName: "LISTENING",
        sessionId: "",
        sessionParticipantId: "",
        questions: [],
      };
    }

    return savedFormattedAnswers
      ? JSON.parse(savedFormattedAnswers)
      : {
          studentId: globalData.studentId,
          topicId: globalData.topicId,
          skillName: "LISTENING",
          sessionId: globalData.sessionId,
          sessionParticipantId: globalData.sessionParticipantId,
          questions: [],
        };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userAnswers));
  }, [userAnswers]);

  useEffect(() => {
    localStorage.setItem(
      "listening_formatted_answers",
      JSON.stringify(formattedAnswers)
    );
  }, [formattedAnswers]);

  const {
    data: testData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["listeningTest"],
    queryFn: () => fetchListeningTestDetails(),
  });

  useEffect(() => {
    if (testData?.Sections?.[0]?.Parts) {
      const globalData = getGlobalData();
      if (!globalData) {
        return;
      }

      const existingFormattedAnswers = localStorage.getItem(
        "listening_formatted_answers"
      );
      let formattedAnswers = existingFormattedAnswers
        ? JSON.parse(existingFormattedAnswers)
        : {
            studentId: globalData.studentId,
            topicId: globalData.topicId,
            skillName: "LISTENING",
            sessionId: globalData.sessionId,
            sessionParticipantId: globalData.sessionParticipantId,
            questions: [],
          };

      const existingQuestionIds = new Set(
        formattedAnswers.questions.map((q) => q.questionId)
      );

      const newQuestions = [];

      testData?.Sections?.[0]?.Parts.forEach((part) => {
        part.Questions.forEach((question) => {
          if (
            question.Type === "listening-questions-group" &&
            question.GroupContent?.listContent
          ) {
            const parentId = question.ID;

            if (!existingQuestionIds.has(parentId)) {
              newQuestions.push({
                questionId: parentId,
                answerAudio: null,
                answerText: [],
              });
              existingQuestionIds.add(parentId);
            }
          } else if (question.Type === "dropdown-list") {
            if (!existingQuestionIds.has(question.ID)) {
              newQuestions.push({
                questionId: question.ID,
                answerAudio: null,
                answerText: [],
              });
              existingQuestionIds.add(question.ID);
            }
          } else {
            if (!existingQuestionIds.has(question.ID)) {
              newQuestions.push({
                questionId: question.ID,
                answerAudio: null,
                answerText: null,
              });
              existingQuestionIds.add(question.ID);
            }
          }
        });
      });

      if (newQuestions.length > 0) {
        formattedAnswers = {
          ...formattedAnswers,
          questions: [...formattedAnswers.questions, ...newQuestions],
        };

        localStorage.setItem(
          "listening_formatted_answers",
          JSON.stringify(formattedAnswers)
        );
        setFormattedAnswers(formattedAnswers);
      }
    }
  }, [testData, getGlobalData]);

  useEffect(() => {
    const dropdownListQuestions = Object.entries(userAnswers).filter(
      ([id, answer]) => {
        const isDropdownList =
          typeof answer === "object" &&
          !Array.isArray(answer) &&
          Object.keys(answer).length > 0;
        const isInFormattedAnswers = formattedAnswers.questions.some(
          (q) => q.questionId === id
        );
        return isDropdownList && !isInFormattedAnswers;
      }
    );

    if (dropdownListQuestions.length > 0) {
      setFormattedAnswers((prev) => {
        const newQuestions = [...prev.questions];

        dropdownListQuestions.forEach(([id, answer]) => {
          let questionContent = null;
          if (testData?.Sections?.[0]?.Parts) {
            for (const part of testData?.Sections?.[0]?.Parts) {
              for (const q of part.Questions) {
                if (q.ID === id) {
                  questionContent = q.Content;
                  break;
                }
              }
              if (questionContent) {
                break;
              }
            }
          }

          const formattedAnswer = Object.entries(answer)
            .filter(
              ([key]) =>
                key !== questionContent &&
                key !== "questionId" &&
                key !== "answerText" &&
                key !== "answerAudio"
            )
            .map(([key, value]) => ({
              key,
              value,
            }));

          newQuestions.push({
            questionId: id,
            answerAudio: null,
            answerText: formattedAnswer,
          });
        });

        return {
          ...prev,
          questions: newQuestions,
        };
      });
    }

    const existingDropdownListQuestions = formattedAnswers.questions.filter(
      (q) => {
        const userAnswer = userAnswers[q.questionId];
        return (
          userAnswer &&
          typeof userAnswer === "object" &&
          !Array.isArray(userAnswer) &&
          userAnswer.answerText &&
          Array.isArray(userAnswer.answerText)
        );
      }
    );

    if (existingDropdownListQuestions.length > 0) {
      setFormattedAnswers((prev) => {
        const newQuestions = [...prev.questions];

        existingDropdownListQuestions.forEach((q) => {
          const userAnswer = userAnswers[q.questionId];

          const questionIndex = newQuestions.findIndex(
            (nq) => nq.questionId === q.questionId
          );

          if (questionIndex >= 0) {
            if (userAnswer.answerText && Array.isArray(userAnswer.answerText)) {
              newQuestions[questionIndex] = {
                ...newQuestions[questionIndex],
                answerText: userAnswer.answerText,
              };
              return;
            }

            let questionContent = null;
            if (testData?.Sections?.[0]?.Parts) {
              for (const part of testData?.Sections?.[0]?.Parts) {
                for (const q of part.Questions) {
                  if (q.ID === q.questionId) {
                    questionContent = q.Content;
                    break;
                  }
                }
                if (questionContent) {
                  break;
                }
              }
            }

            const mergedAnswers = {};
            Object.entries(userAnswer).forEach(([key, value]) => {
              if (
                key !== questionContent &&
                key !== "questionId" &&
                key !== "answerText" &&
                key !== "answerAudio"
              ) {
                mergedAnswers[key] = value;
              }
            });

            const formattedAnswer = Object.entries(mergedAnswers).map(
              ([key, value]) => ({
                key,
                value,
              })
            );

            newQuestions[questionIndex] = {
              ...newQuestions[questionIndex],
              answerText: formattedAnswer,
            };
          }
        });

        return {
          ...prev,
          questions: newQuestions,
        };
      });
    }
  }, [userAnswers, formattedAnswers.questions, testData]);

  useEffect(() => {
    if (!testData?.Sections?.[0]?.Parts) {
      return;
    }

    const listeningGroupQuestions = [];

    testData?.Sections?.[0]?.Parts.forEach((part) => {
      part.Questions.forEach((question) => {
        if (
          question.Type === "listening-questions-group" &&
          question.GroupContent?.listContent
        ) {
          const parentId = question.ID;

          const allSubQuestionsAnswered =
            question.GroupContent.listContent.every((subQuestion) => {
              const subQuestionId = `${parentId}-${subQuestion.ID}`;
              return userAnswers[subQuestionId] !== undefined;
            });

          if (allSubQuestionsAnswered) {
            listeningGroupQuestions.push({
              parentId,
              subQuestions: question.GroupContent.listContent.map(
                (subQuestion) => ({
                  id: subQuestion.ID,
                  answer: userAnswers[`${parentId}-${subQuestion.ID}`],
                })
              ),
            });
          }
        }
      });
    });

    if (listeningGroupQuestions.length > 0) {
      setFormattedAnswers((prev) => {
        const newQuestions = [...prev.questions];

        listeningGroupQuestions.forEach((group) => {
          const existingQuestionIndex = newQuestions.findIndex(
            (q) => q.questionId === group.parentId
          );

          if (existingQuestionIndex >= 0) {
            const existingAnswer =
              newQuestions[existingQuestionIndex].answerText || [];

            if (!Array.isArray(existingAnswer)) {
              newQuestions[existingQuestionIndex].answerText =
                group.subQuestions.map((q) => ({
                  ID: q.id,
                  answer: q.answer,
                }));
            } else {
              const validSubQuestionIds = group.subQuestions.map((q) => q.id);

              const filteredAnswers = existingAnswer.filter((a) =>
                validSubQuestionIds.includes(a.ID)
              );

              const mergedAnswers = [...filteredAnswers];

              group.subQuestions.forEach((subQuestion) => {
                const subQuestionIndex = mergedAnswers.findIndex(
                  (a) => a.ID === subQuestion.id
                );

                if (subQuestionIndex >= 0) {
                  mergedAnswers[subQuestionIndex].answer = subQuestion.answer;
                } else {
                  mergedAnswers.push({
                    ID: subQuestion.id,
                    answer: subQuestion.answer,
                  });
                }
              });

              mergedAnswers.sort((a, b) => a.ID - b.ID);

              newQuestions[existingQuestionIndex].answerText = mergedAnswers;
            }
          } else {
            newQuestions.push({
              questionId: group.parentId,
              answerAudio: null,
              answerText: group.subQuestions.map((q) => ({
                ID: q.id,
                answer: q.answer,
              })),
            });
          }
        });

        return {
          ...prev,
          questions: newQuestions,
        };
      });
    }
  }, [userAnswers, testData]);

  const navigatorQuestions = useMemo(() => {
    if (!testData?.Sections?.[0]?.Parts) {
      return [];
    }

    const allQuestions = [];
    testData?.Sections?.[0]?.Parts.forEach((part, partIndex) => {
      part.Questions.forEach((question) => {
        allQuestions.push({
          partIndex,
          question,
          sequence: question.Sequence || 999,
        });
      });
    });

    allQuestions.sort((a, b) => a.sequence - b.sequence);

    return allQuestions.map(({ partIndex, question }) => ({
      partIndex,
      questionIndex: 0,
      question,
    }));
  }, [testData?.Sections?.[0]?.Parts]);

  const groupedQuestions = useMemo(() => {
    if (!testData?.Sections?.[0]?.Parts) {
      return [];
    }

    const audioGroups = {};
    testData?.Sections?.[0]?.Parts.forEach((part, partIndex) => {
      part.Questions.forEach((question) => {
        if (!audioGroups[question.AudioKeys]) {
          audioGroups[question.AudioKeys] = {
            audioUrl: question.AudioKeys,
            questions: [],
            partIndex,
          };
        }
        audioGroups[question.AudioKeys].questions.push({
          ...question,
          sequence: question.Sequence || 999,
        });
      });
    });

    Object.values(audioGroups).forEach((group) => {
      group.questions.sort((a, b) => a.sequence - b.sequence);
    });

    return Object.values(audioGroups).sort((a, b) => {
      const aFirstSeq = a.questions[0]?.sequence || 999;
      const bFirstSeq = b.questions[0]?.sequence || 999;
      return aFirstSeq - bFirstSeq;
    });
  }, [testData]);

  const getTotalQuestions = () => {
    if (!groupedQuestions.length) {
      return 0;
    }
    return groupedQuestions.length;
  };

  const getCurrentGroup = useCallback(() => {
    if (!groupedQuestions.length) {
      return null;
    }
    return groupedQuestions[currentPartIndex] || null;
  }, [groupedQuestions, currentPartIndex]);

  const getCurrentQuestion = () => {
    const group = getCurrentGroup();
    if (!group) {
      return null;
    }
    return group.questions[currentQuestionIndex] || null;
  };

  const getCurrentFlatIndex = () => {
    if (!groupedQuestions.length) {
      return 0;
    }
    return currentPartIndex;
  };

  const checkAudioPlayed = useCallback(() => {
    const audioQuestionId = getCurrentGroup()?.questions[0]?.ID;
    if (!audioQuestionId) {
      return true;
    } // Không chặn nếu không tìm thấy ID audio (lỗi an toàn)

    const playedQuestions = JSON.parse(
      localStorage.getItem("listening_played_questions") || "{}"
    );
    // Kiểm tra xem 1 trong 2 lần nghe (1 hoặc 2) đã được bấm hay chưa
    const hasPlayed =
      playedQuestions[audioQuestionId] &&
      (playedQuestions[audioQuestionId][1] ||
        playedQuestions[audioQuestionId][2]);

    if (!hasPlayed) {
      message.warning("Please listen to the Audio before choosing the answer.");
      return false;
    }
    return true;
  }, [getCurrentGroup]);

  const goToNext = () => {
    if (isAudioPlaying) {
      return;
    }

    const currentGroup = getCurrentGroup();
    if (!currentGroup) {
      return;
    }

    if (currentQuestionIndex < currentGroup.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentPartIndex < groupedQuestions.length - 1) {
      setCurrentPartIndex(currentPartIndex + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const goToQuestion = (flatIndex) => {
    if (isAudioPlaying) {
      return;
    }

    if (!groupedQuestions.length) {
      return;
    }

    setCurrentPartIndex(flatIndex);
    setCurrentQuestionIndex(0);
  };

  const handleAnswerSubmit = (questionId, answer) => {
    // *** BẮT ĐẦU THAY ĐỔI ***
    // Xóa logic kiểm tra ở đây, vì nó đã được chuyển vào component con
    // if (!checkAudioPlayed()) {
    //   return
    // }
    // *** KẾT THÚC THAY ĐỔI ***

    setUserAnswers((prev) => {
      if (typeof answer === "object" && !Array.isArray(answer)) {
        const existingAnswer = prev[questionId] || {};
        const newAnswers = {
          ...prev,
          [questionId]: {
            ...existingAnswer,
            ...answer,
          },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newAnswers));
        return newAnswers;
      } else {
        const newAnswers = {
          ...prev,
          [questionId]: answer,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newAnswers));
        return newAnswers;
      }
    });

    setFormattedAnswers((prev) => {
      const isSubQuestion = questionId.includes("-");
      let parentQuestionId = questionId;
      let subQuestionId = null;

      if (isSubQuestion) {
        const parts = questionId.split("-");
        parentQuestionId = parts[0];
        subQuestionId = parts[1];
      }

      let question = null;
      let questionType = null;
      let fullQuestionId = parentQuestionId;

      if (testData?.Sections?.[0]?.Parts) {
        for (const part of testData?.Sections?.[0]?.Parts) {
          for (const q of part.Questions) {
            if (q.ID.startsWith(parentQuestionId)) {
              question = q;
              questionType = q.Type;
              fullQuestionId = q.ID;
              break;
            }
          }
          if (question) {
            break;
          }
        }
      }

      if (
        !question &&
        userAnswers[questionId] &&
        typeof userAnswers[questionId] === "object"
      ) {
        questionType = "dropdown-list";
        fullQuestionId = questionId;
      }

      const newQuestions = [...prev.questions];

      const existingQuestionIndex = newQuestions.findIndex(
        (q) => q.questionId === fullQuestionId
      );

      if (existingQuestionIndex >= 0) {
        if (questionType === "listening-questions-group" && subQuestionId) {
          let existingAnswer =
            newQuestions[existingQuestionIndex].answerText || [];

          if (!Array.isArray(existingAnswer)) {
            existingAnswer = [];
          }

          const subQuestionIndex = existingAnswer.findIndex(
            (a) => a.ID === parseInt(subQuestionId)
          );

          if (subQuestionIndex >= 0) {
            existingAnswer[subQuestionIndex] = {
              ID: parseInt(subQuestionId),
              answer: answer,
            };
          } else {
            existingAnswer.push({
              ID: parseInt(subQuestionId),
              answer: answer,
            });
          }

          existingAnswer.sort((a, b) => a.ID - b.ID);

          newQuestions[existingQuestionIndex].answerText = existingAnswer;
        } else if (questionType === "dropdown-list") {
          const userAnswer = userAnswers[fullQuestionId];

          if (
            userAnswer &&
            userAnswer.answerText &&
            Array.isArray(userAnswer.answerText)
          ) {
            newQuestions[existingQuestionIndex].answerText =
              userAnswer.answerText;
          } else {
            const answerKey = Object.keys(answer)[0];
            const answerValue = answer[answerKey];

            if (answerKey === question?.Content) {
              return {
                ...prev,
                questions: newQuestions,
              };
            }

            newQuestions[existingQuestionIndex].answerText = [
              {
                key: answerKey,
                value: answerValue,
              },
            ];
          }
        } else {
          newQuestions[existingQuestionIndex].answerText = answer;
        }
      } else {
        const newQuestion = {
          questionId: fullQuestionId,
          answerAudio: null,
        };

        if (questionType === "listening-questions-group" && subQuestionId) {
          newQuestion.answerText = [
            {
              ID: parseInt(subQuestionId),
              answer: answer,
            },
          ];
        } else if (questionType === "dropdown-list") {
          const userAnswer = userAnswers[fullQuestionId];

          if (
            userAnswer &&
            userAnswer.answerText &&
            Array.isArray(userAnswer.answerText)
          ) {
            newQuestion.answerText = userAnswer.answerText;
          } else {
            const answerKey = Object.keys(answer)[0];
            const answerValue = answer[answerKey];

            if (answerKey === question?.Content) {
              return {
                ...prev,
                questions: newQuestions,
              };
            }

            newQuestion.answerText = [
              {
                key: answerKey,
                value: answerValue,
              },
            ];
          }
        } else {
          newQuestion.answerText = answer;
        }

        newQuestions.push(newQuestion);
      }

      return {
        ...prev,
        questions: newQuestions,
      };
    });
  };

  const handleAutoFillCorrect = () => {
    if (!testData?.Sections?.[0]?.Parts) return;

    testData.Sections[0].Parts.forEach((part) => {
      (part.Questions || []).forEach((question) => {
        const formattedQ = formatQuestionData(question);
        if (!formattedQ) return;

        // =========================
        // 1) listening-questions-group (MC sub-questions)
        // =========================
        if (question.Type === "listening-questions-group") {
          if (!Array.isArray(formattedQ)) return;

          formattedQ.forEach((subQ) => {
            try {
              const parsed =
                typeof subQ.AnswerContent === "string"
                  ? JSON.parse(subQ.AnswerContent)
                  : subQ.AnswerContent;

              const cfg = Array.isArray(parsed) ? parsed[0] : parsed;
              if (!cfg || cfg.correctAnswer == null) return;

              // subQ.ID is like `${parentId}-${subId}`
              handleAnswerSubmit(subQ.ID, String(cfg.correctAnswer));
            } catch (e) {
              // ignore malformed
            }
          });
          return;
        }

        const qType = formattedQ.Type || question.Type;

        // =========================
        // 2) MULTIPLE-CHOICE
        // =========================
        if (qType === "multiple-choice") {
          try {
            const parsed =
              typeof formattedQ.AnswerContent === "string"
                ? JSON.parse(formattedQ.AnswerContent)
                : formattedQ.AnswerContent;

            const cfg = Array.isArray(parsed) ? parsed[0] : parsed;
            if (!cfg || cfg.correctAnswer == null) return;

            handleAnswerSubmit(String(question.ID), String(cfg.correctAnswer));
          } catch (e) {
            // ignore malformed
          }
          return;
        }
        // =========================
        // 3) DROPDOWN-LIST
        // =========================
        if (qType === "dropdown-list") {
          let ac;
          try {
            ac =
              typeof formattedQ.AnswerContent === "string"
                ? JSON.parse(formattedQ.AnswerContent)
                : formattedQ.AnswerContent;
          } catch (e) {
            return;
          }

          const questionId = String(question.ID);
          let answerText = [];

          // Case A: right-left style (your screenshot)
          if (
            Array.isArray(ac.leftItems) &&
            Array.isArray(ac.rightItems) &&
            ac.leftItems.length > 0
          ) {
            const correctArr = Array.isArray(ac.correctAnswer)
              ? ac.correctAnswer
              : [];

            // Build a map from "1" / "2" / ... (or any key) -> correct value
            const correctMap = new Map(
              correctArr
                .filter(
                  (item) => item && item.key != null && item.value != null
                )
                .map((item) => [String(item.key), item.value])
            );

            answerText = ac.leftItems.map((leftItem, idx) => {
              // typical pattern: key "1" corresponds to first leftItem, etc.
              const seqKey = String(idx + 1);
              const value =
                correctMap.get(seqKey) || // prefer "1", "2", ...
                correctMap.get(leftItem) || // fallback if your data already uses leftItem as key
                ac.rightItems[idx] ||
                ""; // final fallback

              return {
                key: leftItem, // IMPORTANT: use leftItem text as key (what UI expects)
                value,
              };
            });
          } else {
            // Case B: paragraph style dropdown (no leftItems / rightItems)
            const correct = ac && ac.correctAnswer;
            if (!correct) return;

            if (Array.isArray(correct)) {
              answerText = correct
                .filter(
                  (item) => item && item.key != null && item.value != null
                )
                .map((item) => ({ key: item.key, value: item.value }));
            } else if (typeof correct === "object") {
              answerText = Object.entries(correct).map(([key, value]) => ({
                key,
                value,
              }));
            }
          }

          if (answerText.length === 0) return;

          // 3a) Update userAnswers in the SAME SHAPE as DropdownQuestion does
          setUserAnswers((prev) => ({
            ...prev,
            [questionId]: {
              questionId,
              answerText,
              answerAudio: null,
            },
          }));

          // 3b) Update formattedAnswers for scoring
          setFormattedAnswers((prev) => {
            const newQuestions = [...prev.questions];
            const idx = newQuestions.findIndex(
              (q) =>
                String(q.questionId) === questionId ||
                q.questionId === questionId
            );

            if (idx >= 0) {
              newQuestions[idx] = {
                ...newQuestions[idx],
                answerText,
              };
            } else {
              newQuestions.push({
                questionId,
                answerAudio: null,
                answerText,
              });
            }

            return {
              ...prev,
              questions: newQuestions,
            };
          });
        }
      });
    });
  };

  const handleClearAnswers = () => {
    // Clear local user answers
    setUserAnswers({});
    setFlaggedQuestions([]);

    // Clear localStorage related to answers (but keep audio-played info)
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("listening_test_answers");
    localStorage.removeItem("listening_formatted_answers");

    const globalData = getGlobalData();

    // Rebuild empty formattedAnswers skeleton so scoring still works later
    if (testData?.Sections?.[0]?.Parts && globalData) {
      const base = {
        studentId: globalData.studentId,
        topicId: globalData.topicId,
        skillName: "LISTENING",
        sessionId: globalData.sessionId,
        sessionParticipantId: globalData.sessionParticipantId,
        questions: [],
      };

      const questions = [];

      testData.Sections[0].Parts.forEach((part) => {
        (part.Questions || []).forEach((question) => {
          if (
            question.Type === "listening-questions-group" &&
            question.GroupContent?.listContent
          ) {
            questions.push({
              questionId: question.ID,
              answerAudio: null,
              answerText: [],
            });
          } else if (question.Type === "dropdown-list") {
            questions.push({
              questionId: question.ID,
              answerAudio: null,
              answerText: [],
            });
          } else {
            questions.push({
              questionId: question.ID,
              answerAudio: null,
              answerText: null,
            });
          }
        });
      });

      const newFormatted = { ...base, questions };
      setFormattedAnswers(newFormatted);
      localStorage.setItem(
        "listening_formatted_answers",
        JSON.stringify(newFormatted)
      );
    } else {
      // Fallback: just clear questions
      setFormattedAnswers((prev) => ({
        ...prev,
        questions: [],
      }));
    }
  };

  const handleSubmitAnswers = useCallback(
    async (isAutoSubmit = false) => {
      try {
        const globalData = getGlobalData();
        if (!globalData) {
          throw new Error("Cannot submit: Missing required data");
        }

        const items = buildListeningItems(testData, formattedAnswers);

        const { points } = calculatePoints({
          items,
          skillName: "LISTENING",
          pointsPerQuestion: 2,
        });


        // Lưu tạm điểm vào localStorage (tuỳ bạn xử lý tiếp)
        localStorage.setItem("listening_points", String(points));

        const updatedFormattedAnswers = {
          ...formattedAnswers,
          studentId: globalData.studentId,
          topicId: globalData.topicId,
          sessionId: globalData.sessionId,
          sessionParticipantId: globalData.sessionParticipantId,
        };

        localStorage.setItem("listening_test_submitted", "true");
        localStorage.setItem(
          "listening_formatted_answers",
          JSON.stringify(updatedFormattedAnswers)
        );

        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("listening_test_answers");
        localStorage.removeItem("listening_formatted_answers");
        localStorage.removeItem("listening_played_questions");

        setUserAnswers({});
        setFormattedAnswers({
          studentId: globalData.studentId,
          topicId: globalData.topicId,
          skillName: "LISTENING",
          sessionId: globalData.sessionId,
          sessionParticipantId: globalData.sessionParticipantId,
          questions: [],
        });

        setIsSubmitted(true);
        localStorage.setItem("current_skill", "grammar");
      } catch (error) {
        console.error(
          `Error ${isAutoSubmit ? "auto-" : ""}submitting listening test:`,
          error
        );
        setErrorMessage(
          error.message || "Failed to submit the test. Please try again."
        );
        setShowErrorModal(true);
      }
    },
    [
      formattedAnswers,
      getGlobalData,
      setErrorMessage,
      setShowErrorModal,
      setUserAnswers,
      setFormattedAnswers,
      setIsSubmitted,
    ]
  );

  const handleSubmit = () => {
    handleSubmitAnswers(false);
  };
  const handleForceSubmit = useCallback(() => {
    handleSubmitAnswers();
  }, [handleSubmitAnswers]);

  useEffect(() => {
    window.addEventListener("forceSubmit", handleForceSubmit);
    return () => {
      window.removeEventListener("forceSubmit", handleForceSubmit);
    };
  }, [handleForceSubmit]);

  const handleAutoSubmit = () => {
    handleSubmitAnswers(true);
  };

  const toggleFlag = (isFlagged) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) {
      return;
    }

    if (isFlagged) {
      setFlaggedQuestions([...flaggedQuestions, currentQuestion.ID]);
    } else {
      setFlaggedQuestions(
        flaggedQuestions.filter((id) => id !== currentQuestion.ID)
      );
    }
  };

  const formatQuestionData = (question) => {
    if (!question) {
      return null;
    }

    try {
      const answerContent =
        typeof question.AnswerContent === "string"
          ? JSON.parse(question.AnswerContent)
          : question.AnswerContent;

      if (
        question.Type === "listening-questions-group" &&
        question.AnswerContent.groupContent?.listContent.length > 0
      ) {
        const formattedQuestions =
          question.AnswerContent.groupContent?.listContent.map(
            (subQuestion) => {
              const options = subQuestion.options.map((option, index) => ({
                key: String.fromCharCode(65 + index),
                value: option,
              }));

              return {
                ...question,
                ID: `${question.ID}-${subQuestion.ID}`,
                Content: subQuestion.content,
                Type: subQuestion.type,
                AnswerContent: JSON.stringify([
                  {
                    title: subQuestion.content,
                    options,
                    correctAnswer: subQuestion.correctAnswer,
                  },
                ]),
              };
            }
          );

        return formattedQuestions;
      }

      if (
        answerContent.options &&
        Array.isArray(answerContent.options) &&
        answerContent.correctAnswer
      ) {
        const options = answerContent.options.map((option, index) => ({
          key: String.fromCharCode(65 + index),
          value: option,
        }));

        return {
          ...question,
          AnswerContent: JSON.stringify([
            {
              title: question.Content,
              options,
              correctAnswer: answerContent.correctAnswer,
            },
          ]),
        };
      } else if (
        answerContent.leftItems &&
        Array.isArray(answerContent.leftItems) &&
        answerContent.rightItems &&
        Array.isArray(answerContent.rightItems)
      ) {
        let formattedCorrectAnswer = [];
        if (
          answerContent.correctAnswer &&
          Array.isArray(answerContent.correctAnswer)
        ) {
          formattedCorrectAnswer = answerContent.correctAnswer.map((item) => {
            if (item.key && item.value) {
              return item;
            }
            return item;
          });
        } else if (
          answerContent.correctAnswer &&
          typeof answerContent.correctAnswer === "object"
        ) {
          formattedCorrectAnswer = Object.entries(
            answerContent.correctAnswer
          ).map(([key, value]) => ({
            key,
            value,
          }));
        } else {
          formattedCorrectAnswer = answerContent.leftItems.map(
            (leftItem, index) => ({
              key: index,
              value: answerContent.rightItems[index] || "",
            })
          );
        }

        return {
          ...question,
          Type: "dropdown-list",
          AnswerContent: {
            ...answerContent,
            correctAnswer: formattedCorrectAnswer,
            type: "dropdown-list",
          },
        };
      } else if (answerContent.type === "dropdown-list") {
        let formattedCorrectAnswer = [];

        if (
          answerContent.correctAnswer &&
          Array.isArray(answerContent.correctAnswer)
        ) {
          formattedCorrectAnswer = answerContent.correctAnswer.map((item) => {
            if (item.key && item.value) {
              return item;
            }
            return item;
          });
        } else if (
          answerContent.correctAnswer &&
          typeof answerContent.correctAnswer === "object"
        ) {
          formattedCorrectAnswer = Object.entries(
            answerContent.correctAnswer
          ).map(([key, value]) => ({
            key,
            value,
          }));
        }

        return {
          ...question,
          AnswerContent: {
            ...answerContent,
            correctAnswer: formattedCorrectAnswer,
          },
        };
      }

      throw new Error("Invalid question format: missing required fields");
    } catch (error) {
      console.error("Error formatting question data:", error);
      return null;
    }
  };

  if (isSubmitted) {
    return (
      <NextScreen
        nextPath="/grammar"
        skillName="Listening"
        imageSrc={ListeningSubmission}
      />
    );
  }

  if (isLoading) {
    return (
      <Spin
        size="large"
        className="flex min-h-screen items-center justify-center"
      />
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Failed to load test data"
        description={error.message}
      />
    );
  }

  const currentGroup = getCurrentGroup();
  const flatIndex = getCurrentFlatIndex();
  const totalQuestions = getTotalQuestions();
  const isFlagged =
    currentGroup?.questions[0] &&
    flaggedQuestions.includes(currentGroup.questions[0].ID);

  return (
    <>
      <TestNavigation
        testData={{
          ...testData,
          Parts: navigatorQuestions.map((q) => ({
            ...q.question.Part,
            Questions: [q.question],
          })),
        }}
        currentQuestion={currentGroup?.questions[0]}
        flatIndex={flatIndex}
        totalQuestions={totalQuestions}
        isFlagged={isFlagged}
        onFlag={toggleFlag}
        onQuestionChange={goToQuestion}
        onNext={goToNext}
        onSubmit={handleSubmit}
        onAutoSubmit={handleAutoSubmit}
        userAnswers={userAnswers}
        flaggedQuestions={flaggedQuestions}
      >
        {currentGroup && (
          <>
            <div className="mb-4 flex justify-end">
              <Button type="default" onClick={handleAutoFillCorrect}>
                Auto-Fill
              </Button>
              <Button danger onClick={handleClearAnswers}>
                Clear Answers
              </Button>
            </div>
            <Title level={5} className="mb-6 text-lg">
              {currentGroup.questions[0].Content}
            </Title>
            <PlayStopButton
              audioUrl={currentGroup.audioUrl}
              questionId={currentGroup.questions[0]?.ID}
              onPlayingChange={setIsAudioPlaying}
            />
          </>
        )}

        {currentGroup?.questions.map((question) => {
          const formattedQ = formatQuestionData(question);
          const qType = formattedQ?.Type || question.Type;

          if (question.Type === "listening-questions-group") {
            if (!Array.isArray(formattedQ)) {
              return null;
            }

            return (
              <div key={question.ID} className="mt-6">
                {formattedQ.map((subQuestion) => (
                  <div key={subQuestion.ID} className="mb-8">
                    <Title level={5} className="mb-6 text-lg">
                      {subQuestion.Content}
                    </Title>
                    <MultipleChoice
                      questionData={subQuestion}
                      userAnswer={userAnswers}
                      setUserAnswer={setUserAnswers}
                      // *** BẮT ĐẦU THAY ĐỔI ***
                      // Thêm onBeforeAnswer
                      onBeforeAnswer={checkAudioPlayed}
                      // *** KẾT THÚC THAY ĐỔI ***
                      onSubmit={(answer) =>
                        handleAnswerSubmit(subQuestion.ID, answer)
                      }
                      className="mt-6"
                      setUserAnswerSubmit={() => {}}
                    />
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div key={question.ID} className="mt-6">
              {qType === "multiple-choice" ? (
                <>
                  <MultipleChoice
                    questionData={formattedQ}
                    userAnswer={userAnswers}
                    setUserAnswer={setUserAnswers}
                    // *** BẮT ĐẦU THAY ĐỔI ***
                    // Thêm onBeforeAnswer
                    onBeforeAnswer={checkAudioPlayed}
                    // *** KẾT THÚC THAY ĐỔI ***
                    onSubmit={(answer) =>
                      handleAnswerSubmit(question.ID, answer)
                    }
                    className="z-0 mt-6"
                    setUserAnswerSubmit={() => {}}
                  />
                </>
              ) : qType === "dropdown-list" ? (
                <DropdownQuestion
                  questionData={formattedQ}
                  userAnswer={userAnswers}
                  setUserAnswer={setUserAnswers}
                  onBeforeAnswer={checkAudioPlayed}
                  className="z-0 mt-6 shadow-none"
                />
              ) : null}
            </div>
          );
        })}
      </TestNavigation>

      <Modal
        title={
          <div className="flex items-center">
            <ExclamationCircleOutlined className="mr-2 text-red-500" />
            <span>Submission Error</span>
          </div>
        }
        open={showErrorModal}
        onOk={() => setShowErrorModal(false)}
        onCancel={() => setShowErrorModal(false)}
        okText="OK"
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <p>{errorMessage}</p>
      </Modal>
    </>
  );
};

export default ListeningTest;
