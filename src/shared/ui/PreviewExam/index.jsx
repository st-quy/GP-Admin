import React, { useState } from "react";
import { Button, message, Drawer, Steps, theme } from "antd";
import SpeakingPreview from "./Speaking";
import ListeningTest from "./Listening/listening-test";
import GrammarVocabPreview from "./GrammarVocab";
import ReadingTest from "./Reading/reading-test";
import WritingTest from "./Writing/writing-test";
import { handleFileChange } from "@features/classManagement/hooks";

const PreviewExam = ({
  isModalOpen,
  setIsModalOpen,
  dataExam,
  fileData,
  setDataExam,
}) => {
  const [current, setCurrent] = useState(0);
  const next = () => {
    setCurrent(current + 1);
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const steps = [
    {
      title: "Speaking",
      content: <SpeakingPreview dataExam={dataExam} />,
    },
    {
      title: "Listening",
      content: <ListeningTest dataExam={dataExam} />,
    },
    {
      title: "Grammar & Vocabulary",
      content: <GrammarVocabPreview dataExam={dataExam} />,
    },
    {
      title: "Reading",
      content: <ReadingTest dataExam={dataExam} />,
    },
    {
      title: "Writing",
      content: <WritingTest dataExam={dataExam} />,
    },
  ];

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  return (
    <Drawer
      title={<Steps current={current} items={items} className="my-4" />}
      //   closable={false}
      onClose={() => {
        setDataExam(null);
        setIsModalOpen(false);
      }}
      open={isModalOpen}
      placement="bottom"
      height={"100vh"}
      footer={
        <div className="flex justify-end">
          {current > 0 && (
            <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
              Previous
            </Button>
          )}
          {current < steps.length - 1 && (
            <Button type="primary" onClick={() => next()}>
              Next
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button
              type="primary"
              onClick={() => {
                setDataExam(null);
                setIsModalOpen(false);
                handleFileChange(fileData);
              }}
            >
              Import
            </Button>
          )}
        </div>
      }
    >
      <div className="mb-4">
        <div className="!h-[600px]">{steps[current].content}</div>
      </div>
    </Drawer>
  );
};
export default PreviewExam;
