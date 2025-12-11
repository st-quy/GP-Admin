import PlayStopButton from "./play-stop-button";
import DropdownQuestion from "@shared/ui/question-type/dropdown-question";
import MultipleChoice from "@shared/ui/question-type/multiple-choice";
import { Typography } from "antd";
import { useState } from "react";
// @ts-ignore
import { transformListeningData } from "@shared/lib/utils/transformExcelDataToStructuredJSON";

const { Title } = Typography;

const ListeningTest = ({ dataExam }) => {
  console.log("data", dataExam)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

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
        question.GroupContent?.listContent
      ) {
        const formattedQuestions = question.GroupContent.listContent.map(
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
  const dataListening = transformListeningData(dataExam);

  return (
    <>
      {dataListening?.Parts?.map((part, index) => (
        <div key={index}>
          {part?.Questions.map((question, _) => {
            const formattedQ = formatQuestionData(question);
            const qType = formattedQ?.Type || question.Type;

            if (question.Type === "listening-questions-group") {
              if (!Array.isArray(formattedQ)) {
                return null;
              }

              return (
                <div
                  key={question.ID}
                  className="mt-6 bg-gray border border-slate-200 border-solid p-4 rounded-xl shadow-lg"
                >
                  <div className="rounded-xl bg-[#003087] px-4 py-1 text-base font-semibold text-white my-6 w-fit">
                    Questions {formattedQ?.[0].Sequence} of 17
                  </div>
                  <Title level={5} className="mb-6 text-lg">
                    {question.Content}
                  </Title>
                  <PlayStopButton
                    audioUrl={question.AudioKeys}
                    questionId={question.ID}
                    onPlayingChange={setIsAudioPlaying}
                  />
                  {formattedQ.map((subQuestion) => (
                    <div key={subQuestion.ID} className="mb-8">
                      <Title level={5} className="mb-6 text-lg">
                        {subQuestion.Content}
                      </Title>
                      <MultipleChoice
                        questionData={subQuestion}
                        userAnswer={subQuestion.AnswerContent.correctAnswer}
                        onSubmit={() => console.log("Submit answer")}
                        setUserAnswer={() => console.log("Set user answer")}
                        className="mt-6"
                        setUserAnswerSubmit={() => {}}
                      />
                    </div>
                  ))}
                </div>
              );
            }

            return (
              <div
                key={question.ID}
                className="mt-6 bg-gray border border-slate-200 border-solid p-4 rounded-xl shadow-lg"
              >
                <>
                  <div className="rounded-xl bg-[#003087] px-4 py-1 text-base font-semibold text-white my-6 w-fit">
                    Questions {question.Sequence} of 17
                  </div>
                  <Title level={5} className="mb-6 text-lg">
                    {question.Content}
                  </Title>
                  <PlayStopButton
                    audioUrl={question.AudioKeys}
                    questionId={question.ID}
                    onPlayingChange={setIsAudioPlaying}
                  />
                </>
                {qType === "multiple-choice" ? (
                  <>
                    <MultipleChoice
                      questionData={formattedQ}
                      userAnswer={question.AnswerContent.correctAnswer}
                      onSubmit={() => console.log("Submit answer")}
                      className="z-0 mt-6"
                      setUserAnswer={() => console.log("Set user answer")}
                      setUserAnswerSubmit={() => {}}
                    />
                  </>
                ) : qType === "dropdown-list" ? (
                  <DropdownQuestion
                    questionData={formattedQ}
                    userAnswer={[{}]}
                    setUserAnswer={() => console.log("Set user answer")}
                    className="z-0 mt-6 shadow-none"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
};

export default ListeningTest;
