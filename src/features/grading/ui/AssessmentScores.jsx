import "./index.scss";
import { useState, useEffect, useRef } from "react";
import { Tabs, Button, Form, InputNumber, message } from "antd";
import { EditOutlined, AudioOutlined } from "@ant-design/icons";
import { usePostGrade, useGetGrade } from "../hooks";
import { useLocation } from "react-router-dom";

const AssessmentScores = ({
  onTabChange,
  isUserChange,
  currentUser,
  speakingComments = [],
  writingComments = [],
  isSpeaking,
  audioFileName,
}) => {
  const [scores, setScores] = useState(0);
  const [activeTab, setActiveTab] = useState(
    isSpeaking ? "speaking" : "writing"
  );
  const { mutateAsync: postGrade } = usePostGrade();

  const {
    data: fetchedScore,
    isLoading,
    isError,
  } = useGetGrade(currentUser, activeTab);
  useEffect(() => {
    if (fetchedScore !== null && fetchedScore !== undefined) {
      setScores(fetchedScore);
    } else setScores(null);
  }, [fetchedScore, currentUser, activeTab]);

  const handleTabClick = (key) => {
    setActiveTab(key);
    if (key === "writing") {
      onTabChange(false);
    } else onTabChange(true);
  };

  useEffect(() => {
    if (isUserChange) setActiveTab("writing");
  }, [currentUser]);

  useEffect(() => {
    setActiveTab(isSpeaking ? "speaking" : "writing");
  }, [isSpeaking]);

  const handleSubmit = async () => {
    if (scores === null) {
      message.error("Please enter a score");
      return;
    }

    try {
      // @ts-ignore
      await postGrade({
        sessionParticipantID: currentUser,
        teacherGradedScore: scores,
        skillName: activeTab === "writing" ? "WRITING" : "SPEAKING",
        studentAnswers:
          activeTab === "writing" ? writingComments : speakingComments,
      });
      message.success(
        `${activeTab === "writing" ? "Writing" : "Speaking"} assessment submitted successfully`
      );
    } catch (error) {
      message.error("Failed to submit assessment");
      console.error("Error submitting assessment:", error);
    }
  };

  return (
    <>
      {/* Navigate */}
      <div className="relative">
        <Tabs
          activeKey={activeTab}
          className="custom-tabs-2 mb-[57px]"
          onChange={handleTabClick}
          items={[
            {
              key: "writing",
              label: (
                <>
                  <EditOutlined /> &nbsp; Writing
                </>
              ),
            },
            {
              key: "speaking",
              label: (
                <>
                  <AudioOutlined /> &nbsp; Speaking
                </>
              ),
            },
          ]}
        />
      </div>

      <div className="flex justify-between">
        {/* Title */}
        <div>
          <h2 className="font-bold text-[30px] leading-[38px] text-black mb-[11px]">
            {activeTab === "writing" ? "Writing" : "Speaking"} Assessment Parts
          </h2>
          <p className="font-medium text-[18px] leading-[26px] text-[#637381]">
            Detailed breakdown of each part in the
            {activeTab === "writing" ? "writing" : "speaking"} assessment.
          </p>
        </div>
        {/* Score Input */}
        <div className="flex items-center leading-6">
          <div className="flex text-base items-center mr-[18px]">
            <Form layout="vertical">
              <Form.Item label="Total Score">
                <InputNumber
                  min={0}
                  max={50}
                  value={scores}
                  changeOnWheel={true}
                  onChange={(value) => {
                    if (value > 50) {
                      message.warning("Score cannot exceed 50");
                      setScores(50);
                    } else if (value === null || isNaN(value)) {
                      message.warning("Please enter a valid number");
                      setScores(null);
                    } else {
                      setScores(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      !/[\d\b]/.test(e.key) &&
                      ![
                        "Backspace",
                        "Delete",
                        "ArrowLeft",
                        "ArrowRight",
                      ].includes(e.key)
                    ) {
                      e.preventDefault();
                    }
                  }}
                  className="w-[170px] h-auto border border-[#637381] rounded-[10px]"
                  disabled={audioFileName?.session?.isPublished}
                />
              </Form.Item>
            </Form>
          </div>
          <div className="flex">
            {!audioFileName?.session?.isPublished && (
              <Button
                onClick={handleSubmit}
                type="primary"
                className="h-auto px-[41.5px] py-[13px] text-base bg-primaryColor rounded-[50px]"
                disabled={audioFileName?.session?.isPublished}
              >
                Submit
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AssessmentScores;
