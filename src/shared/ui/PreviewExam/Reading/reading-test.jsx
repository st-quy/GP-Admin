import OrderingQuestion from "@shared/ui/question-type/ordering-question";
import { Typography, Card, Select, Divider } from "antd";
import React, { useState } from "react";
import { transformReadingData } from "@shared/lib/utils/transformExcelDataToStructuredJSON";
const { Option } = Select;
const { Title, Text } = Typography;

const ReadingTest = ({ dataExam }) => {
  const testData = transformReadingData(dataExam);
  

  const [currentPartIndex, setCurrentPartIndex] = useState(0);

  const renderDropdownQuestion = (currentQuestion) => {
    const processedData = (() => {
      try {
        const parsedAnswerContent =
          typeof currentQuestion.AnswerContent === "string"
            ? JSON.parse(currentQuestion.AnswerContent)
            : currentQuestion.AnswerContent;

        if (parsedAnswerContent.leftItems && parsedAnswerContent.rightItems) {
          return {
            id: currentQuestion.ID,
            question: currentQuestion.Content,
            leftItems: parsedAnswerContent.leftItems,
            rightItems: parsedAnswerContent.rightItems,
            type: "right-left",
            correctAnswers: currentQuestion.AnswerContent.correctAnswer || [],
          };
        }

        if (parsedAnswerContent.options) {
          const options = parsedAnswerContent.options || [];
          const answers = {};
          options.forEach(({ key, value }) => {
            answers[key] = value;
          });
          return {
            id: currentQuestion.ID,
            question: currentQuestion.Content,
            answers,
            type: "paragraph",
            correctAnswers: currentQuestion.AnswerContent.correctAnswer || [],
          };
        }

        return {
          id: currentQuestion.ID,
          question: currentQuestion.Content,
          answers: parsedAnswerContent,
          type: "unknown",
          correctAnswers: currentQuestion.AnswerContent.correctAnswer || [],
        };
      } catch (error) {
        console.error("Error parsing question data:", error);
        return null;
      }
    })();

    if (!processedData) {
      return (
        <p className="text-center text-gray-600">No question data available.</p>
      );
    }

    if (
      currentQuestion.Type === "matching" &&
      processedData.type === "right-left"
    ) {
      const contentLines = processedData.question.split("\n");
      const paragraphs = [];
      let currentParagraph = "";

      for (let i = 0; i < contentLines.length; i++) {
        const line = contentLines[i];
        if (line.startsWith("Paragraph")) {
          const cleanedLine = line
            .replace(/^Paragraph\s*\d+\s*-\s*/, "")
            .trim();
          if (currentParagraph) {
            paragraphs.push(currentParagraph);
          }
          currentParagraph = cleanedLine;
        } else if (line.trim() && currentParagraph !== "") {
          currentParagraph += " " + line.trim();
        }
      }
      if (currentParagraph) {
        paragraphs.push(currentParagraph);
      }

      return (
        <div className="mx-auto w-full max-w-4xl">
          <div className="mt-4 flex flex-col gap-8">
            {paragraphs.map((para, index) => (
              <div key={index + 1} className="mb-8">
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{index + 1}.</span>
                    <Select
                      key={index}
                      value={processedData.correctAnswers?.[index].right || ""}
                      className="w-full"
                      placeholder="Select a heading"
                      size="large"
                      style={{ fontSize: "16px" }}
                    >
                      {processedData.rightItems.map((rightItem) => {
                        const displayText = rightItem.replace(/^[A-Z]\. /, "");
                        return (
                          <Option
                            key={rightItem}
                            value={rightItem}
                            className="py-2 !text-base"
                          >
                            {displayText}
                          </Option>
                        );
                      })}
                    </Select>
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-justify text-base text-gray-800">
                  <span className="mr-2 font-semibold">
                    Paragraph {index + 1} -
                  </span>
                  {para}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (currentPartIndex === 0 && processedData.type === "paragraph") {
      const cleanedQuestion = processedData.question.replace(
        /\s*\([^)]*\)/g,
        ""
      );

      const hasSlashFormat =
        currentQuestion.Content.includes("/") &&
        currentQuestion.Content.split("/").length >= 2;

      return (
        <div className="mx-auto w-full max-w-4xl">
          <div className="whitespace-pre-wrap text-base text-gray-800">
            {cleanedQuestion.split(/(\d+\.)/).map((part, index) => {
              if (part.match(/^\d+\.$/)) {
                const number = part.replace(".", "");

                return (
                  <React.Fragment key={index}>
                    {hasSlashFormat ? "" : part}
                    <Select
                      value={
                        number === "0"
                          ? processedData.answers[0]?.[0]
                          : processedData.correctAnswers?.[number].value
                      }
                      className="mx-2 my-2 inline-block"
                      size="large"
                      style={{ fontSize: "16px", minWidth: 100 }}
                      dropdownStyle={{ maxWidth: "max-content" }}
                      disabled={number === "0"}
                    >
                      {processedData.answers[number]?.map((option) => {
                        const displayText = option.replace(/^[A-Z]\. /, "");
                        return (
                          <Option
                            key={option}
                            value={option}
                            style={{
                              whiteSpace: "normal",
                            }}
                          >
                            <div
                              className={
                                number === "0" ? "!text-black" : "!text-base"
                              }
                            >
                              {displayText}
                            </div>
                          </Option>
                        );
                      })}
                    </Select>
                  </React.Fragment>
                );
              }
              return <span key={index}>{part}</span>;
            })}
          </div>
        </div>
      );
    }

    if (processedData.type === "right-left") {
      return (
        <div className="mx-auto w-full max-w-4xl">
          <div className="mt-4">
            {processedData.leftItems.map((leftItem, index) => (
              <div key={index}>
                <div className="grid w-full grid-cols-[1fr,400px] items-center py-6">
                  <div className="border-r-2 border-gray-300 pr-8">
                    <span className="block whitespace-pre-wrap text-base text-gray-800">
                      {leftItem}
                    </span>
                  </div>
                  <div className="pl-8">
                    <Select
                      value={processedData.correctAnswers?.[index].value || ""}
                      className="w-full"
                      size="large"
                      style={{ fontSize: "16px" }}
                    >
                      {processedData.rightItems.map((rightItem) => {
                        const displayText = rightItem.replace(/^[A-Z]\. /, "");
                        return (
                          <Option
                            key={rightItem}
                            value={rightItem}
                            className="py-2 !text-base"
                          >
                            {displayText}
                          </Option>
                        );
                      })}
                    </Select>
                  </div>
                </div>
                {index < processedData.leftItems.length - 1 && (
                  <div className="h-[1px] bg-[#f0f0f0]" />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (processedData.type === "paragraph") {
      const cleanedQuestion = processedData.question.replace(
        /\s*\([^)]*\)/g,
        ""
      );

      const hasSlashFormat =
        currentQuestion.Content.includes("/") &&
        currentQuestion.Content.split("/").length >= 2;
      return (
        <div className="mx-auto w-full max-w-4xl">
          <div className="whitespace-pre-wrap text-base text-gray-800">
            {cleanedQuestion.split(/(\d+\.)/).map((part, index) => {
              if (part.match(/^\d+\.$/)) {
                const number = part.replace(".", "");
                return (
                  <React.Fragment key={index}>
                    {hasSlashFormat ? "" : part}
                    <Select
                      value={processedData.correctAnswers?.[number].right || ""}
                      className="mx-2 inline-block w-32"
                      style={{ marginBottom: 10, fontSize: "16px" }}
                      size="large"
                    >
                      {processedData.answers[number]?.map((option) => {
                        const displayText = option.replace(/^[A-Z]\. /, "");
                        return (
                          <Option
                            key={option}
                            value={option}
                            className="py-2 !text-base"
                          >
                            {displayText}
                          </Option>
                        );
                      })}
                    </Select>
                  </React.Fragment>
                );
              }
              return <span key={index}>{part}</span>;
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center text-red-600">
        Unsupported dropdown format. Please check the question configuration.
      </div>
    );
  };

  const renderQuestion = (currentQuestion) => {
    if (!currentQuestion) {
      return null;
    }

    switch (currentQuestion.Type) {
      case "dropdown-list": {
        return renderDropdownQuestion(currentQuestion);
      }
      case "ordering": {
        const options = (() => {
          try {
            if (Array.isArray(currentQuestion.AnswerContent)) {
              return currentQuestion.AnswerContent;
            }
            if (typeof currentQuestion.AnswerContent === "string") {
              const parsed = JSON.parse(currentQuestion.AnswerContent);
              return Array.isArray(parsed) ? parsed : parsed.options || [];
            }
            return currentQuestion.AnswerContent.options || [];
          } catch (e) {
            console.error("Error parsing ordering question options:", e);
            return [];
          }
        })();

        return (
          <div className="mx-auto w-full max-w-4xl">
            <OrderingQuestion
              key={`ordering-${currentPartIndex}-${currentQuestion.ID}`}
              options={options}
              userAnswer={currentQuestion.AnswerContent.correctAnswer}
              setUserAnswer={null}
              subcontent={currentQuestion.SubContent}
            />
          </div>
        );
      }
      case "matching": {
        if (currentQuestion.Type === "matching") {
          return renderDropdownQuestion(currentQuestion);
        }
      }
      default:
        return <div>Unsupported question type: {currentQuestion.Type}</div>;
    }
  };

  const shouldShowContent = (currentQuestion) => {
    const hasSlashFormat =
      currentQuestion.Content.includes("/") &&
      currentQuestion.Content.split("/").length >= 2;

    if (hasSlashFormat) {
      return false;
    }

    if (currentQuestion.Type === "matching") {
      return false;
    }

    if (currentQuestion.Type === "ordering") {
      return false;
    }

    if (currentQuestion.Type === "dropdown-list") {
      const answerContent =
        typeof currentQuestion.AnswerContent === "string"
          ? JSON.parse(currentQuestion.AnswerContent)
          : currentQuestion.AnswerContent;

      if (answerContent.leftItems && answerContent.rightItems) {
        return true;
      }

      if (answerContent.options) {
        return false;
      }
    }

    return true;
  };

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-4xl p-5 pb-32">
      {testData?.Parts?.map((currentPart, index) => (
        <Card className="mb-32">
          <>
            <div key={index}>
              <Title level={2} className="mb-6 text-3xl font-bold">
                {`Question ${currentPart.Sequence} of 5`}
              </Title>
              <div className="prose prose-lg mb-8 max-w-none">
                <Text className="mb-2 block text-xl font-semibold text-gray-800">
                  {currentPart.Content.startsWith("Part")
                    ? (currentPart.Content.includes(":")
                        ? currentPart.Content.split(":")[1]
                        : currentPart.Content.split("-").slice(1).join(" ")
                      )
                        .trim()
                        .split("\n")
                        .map((line, idx) => (
                          <span key={idx}>
                            {line}
                            <br />
                          </span>
                        ))
                    : currentPart.Content.split("\n").map((line, idx) => (
                        <span key={idx}>
                          {line}
                          <br />
                        </span>
                      ))}
                </Text>
              </div>

              {currentPart.Questions?.map((q, indiex) => (
                <div key={indiex}>
                  {shouldShowContent(q) && (
                    <div className="prose prose-lg mb-8 whitespace-pre-wrap text-base text-gray-800">
                      {currentPartIndex === 3
                        ? q.Content.split("\n").map((paragraph, index) => {
                            if (!paragraph.trim()) {
                              return null;
                            }
                            const formattedParagraph = paragraph.replace(
                              /([A-Z][a-z]+):\s/g,
                              "<strong>$1:</strong> "
                            );
                            return (
                              <div key={index} className="mb-4">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: formattedParagraph,
                                  }}
                                />
                              </div>
                            );
                          })
                        : q.Content}
                    </div>
                  )}
                  <div
                    className="prose prose-lg flex max-w-none flex-col gap-4"
                    key={indiex}
                  >
                    {renderQuestion(q)}
                  </div>
                </div>
              ))}
            </div>
          </>
        </Card>
      ))}
    </div>
  );
};

export default ReadingTest;
