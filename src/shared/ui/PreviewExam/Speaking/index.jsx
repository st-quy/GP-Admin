import React, { useState } from "react";
import PartIntro from "./part-intro";
import { Button } from "antd";
// @ts-ignore
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

const SpeakingPreview = ({ dataExam }) => {
   if (!dataExam || !dataExam.Skills || !dataExam.Skills[4]) {
    return <div>Loading...</div>; 
  }
  const parts = dataExam.Skills[4].Parts;

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < parts.length - 1 ? prev + 1 : prev));
  };

  return (
    <div className="flex flex-col w-full">
      <div className="mt-4 flex gap-2 items-center justify-between w-full">
        <Button
          className="text-[1.5rem]"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          type="text"
          icon={<ArrowLeftOutlined />}
        ></Button>
        <PartIntro data={parts} partNumber={currentIndex} />
        <Button
          className="text-[1.5rem]"
          onClick={handleNext}
          disabled={currentIndex === parts.length - 1}
          type="text"
          icon={<ArrowRightOutlined />}
        ></Button>
      </div>
    </div>
  );
};

export default SpeakingPreview;
