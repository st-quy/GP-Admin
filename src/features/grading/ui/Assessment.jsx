import "antd/dist/reset.css";
import "./index.scss";
import { QuestionAnswer } from "./QuestionAnswer";
import CommentForm from "./CommentForm";
import { Card, Tabs } from "antd";
import { useState, useEffect } from "react";

const Assessment = ({
  isSpeaking,
  currentUser,
  data,
  onCommentChange,
  speakingComments,
  writingComments,
  fileNameInfo = "",
}) => {
  const [activeTab, setActiveTab] = useState("1");
  // Track part totals for each skill
  const [partData, setPartData] = useState({});

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Reset to part 1 when isSpeaking changes or currentUser changes
  useEffect(() => {
    setActiveTab("1");
  }, [isSpeaking, currentUser]);

  useEffect(() => {
    handleDataChange();
  }, [activeTab, isSpeaking, data]);

  const handleDataChange = () => {
    try {
      const parts = data?.data?.data?.topic?.Parts;
      if (parts && parts.length > 0) {
        const currentPart = `PART ${activeTab}`;
        const currentPartIndex = parts.findIndex((p) =>
          p.Content?.toLowerCase().includes(currentPart.toLowerCase())
        );
        if (currentPartIndex >= 0) {
          setPartData(parts[currentPartIndex]);
        } else {
          setPartData({});
        }
      } else {
        setPartData({});
      }
    } catch (error) {
      console.error("Error parsing data:", error);
      setPartData({});
    }
  };

  const handleCommentChange = (commentData) => {
    if (onCommentChange) {
      // Special handling for speaking part 4
      if (isSpeaking && activeTab === "4") {
        // Get all student answer IDs from part 4
        const allStudentAnswerIds = [];
        try {
          if (partData && partData.Questions) {
            partData.Questions.forEach((question) => {
              if (question.studentAnswer && question.studentAnswer.ID) {
                allStudentAnswerIds.push(question.studentAnswer.ID);
              }
            });
          }
        } catch (error) {
          console.error("Error getting student answer IDs:", error);
        }

        // Pass all student answer IDs for part 4
        onCommentChange({
          ...commentData,
          isSpeaking,
          part: activeTab,
          isPartFour: true,
          allStudentAnswerIds,
        });
      } else {
        // Normal handling for other parts
        onCommentChange({
          ...commentData,
          isSpeaking,
          part: activeTab,
        });
      }
    }
  };

  // Find existing comment for a question
  const findExistingComment = (questionData) => {
    const comments = isSpeaking ? speakingComments : writingComments;
    const studentAnswerId = questionData?.studentAnswer?.ID;

    if (!comments || !studentAnswerId) return "";

    // Find comment that matches both studentAnswerId and current part
    const comment = comments.find(
      (c) => c.studentAnswerId === studentAnswerId && c.part === activeTab
    );

    return comment ? comment.messageContent : "";
  };

  const handleDisplayPart = () => {
    if (!partData || !partData.Questions) return "";

    if (isSpeaking && activeTab === "4") {
      const partFourQuestions = [...(partData.Questions || [])].sort(
        (a, b) => a.Sequence - b.Sequence
      );
      if (partFourQuestions.length === 0) return "";

      return (
        <div className="flex gap-10 relative">
          <div className="w-[80%] h-fit shadow-md rounded-lg">
            <QuestionAnswer
              isSpeaking={isSpeaking}
              fileName={fileNameInfo + `-part${activeTab}`}
              speakingPartFour={partFourQuestions}
            />
          </div>
          {partFourQuestions[0].studentAnswer?.ID && (
            <div className="w-[20%] h-fit shadow-md sticky top-0 rounded-lg">
              <CommentForm
                key={`speaking-part4-${partFourQuestions[0]?.studentAnswer?.ID}-${currentUser}`}
                data={partFourQuestions[0]}
                onCommentChange={handleCommentChange}
                isSpeaking={isSpeaking}
                activeTab={activeTab}
                existingComment={findExistingComment(partFourQuestions[0])}
              />
            </div>
          )}
        </div>
      );
    }

    const sortedQuestions = [...(partData.Questions || [])].sort(
      (a, b) => a.Sequence - b.Sequence
    );
    return sortedQuestions.map((question, index) => (
      <div className="flex relative justify-between" key={index}>
        <div className="w-[78%] h-fit shadow-md rounded-lg">
          <QuestionAnswer
            isSpeaking={isSpeaking}
            fileName={fileNameInfo + `-part${activeTab}-question${index + 1}`}
            quesntionsAnswerData={question}
          />
        </div>
        {question.studentAnswer?.ID && (
          <div className="w-[20%] h-fit shadow-md sticky top-0 rounded-lg">
            <CommentForm
              key={`${isSpeaking ? "speaking" : "writing"}-part${activeTab}-${question?.studentAnswer?.ID}-${currentUser}`}
              data={question}
              onCommentChange={handleCommentChange}
              isSpeaking={isSpeaking}
              activeTab={activeTab}
              existingComment={findExistingComment(question)}
            />
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="w-full min-h-screen">
      <div className="py-[2.3125rem]">
        <div className="w-full">
          <div className="flex flex-col">
            <div className="border-b border-gray-200">
              <div className="flex justify-between items-center">
                <Tabs
                  activeKey={activeTab}
                  onChange={handleTabChange}
                  className="w-auto custom-tabs"
                  items={[
                    {
                      key: "1",
                      label: "Part 1",
                    },
                    {
                      key: "2",
                      label: "Part 2",
                    },
                    {
                      key: "3",
                      label: "Part 3",
                    },
                    {
                      key: "4",
                      label: "Part 4",
                    },
                  ]}
                  style={{
                    background: "white",
                    borderRadius: "8px",
                    borderBottom: "1px solid #DFE4EA",
                    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6 w-full">
        {!isSpeaking && partData && (
          <Card
            variant="borderless"
            className="rounded-lg overflow-hidden w-[78%] px-[43px] py-[41px]"
            styles={{ body: { padding: 0 } }}
          >
            <div>{partData.Content || ""}</div>
            <div className="text-gray-500 font-bold">
              {partData.SubContent || ""}
            </div>
          </Card>
        )}
        {handleDisplayPart()}
      </div>
    </div>
  );
};

export default Assessment;
