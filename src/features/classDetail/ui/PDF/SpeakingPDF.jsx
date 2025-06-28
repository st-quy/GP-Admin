import React from "react";
import PDFLayout from "./PDFLayout";

const SpeakingPDF = () => {
  return (
    <PDFLayout>
      <div className="px-4 py-6 border-2 border-solid border-[#C0C0C0] rounded-[5px]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[20px] font-bold">Speaking Assessment Part</h1>
          <p className="text-[15px] font-semibold">
            Total Score:
            <span className="border-2 border-solid border-[#C0C0C0] w-[70px] p-2 ms-2 rounded-[2px]">
              Score
            </span>
          </p>
        </div>
        <p className="text-[15px]">
          Detailed breakdown in the Speaking assessment
        </p>
      </div>
      <div className="mt-2">
        <h1 className="text-[20px] font-bold text-center py-4">Part 2</h1>
        <div className="px-4 py-6 border-2 border-solid border-[#C0C0C0] rounded-[5px]">
          <SpeakingCard question={"Question 1"} comment={"Good job"} />
          <SpeakingCard question={"Question 2"} comment={"Good job"} />
          <SpeakingCard question={"Question 3"} comment={"Good job"} />
        </div>
      </div>
    </PDFLayout>
  );
};

const SpeakingCard = ({ question, comment }) => {
  return (
    <div className="mb-6 border-2 border-solid border-[#C0C0C0] bg-[#C0C0C0] rounded-tr-[10px] rounded-tl-[10px]">
      <div className="h-[20px] mb-4 px-4 py-2">
        <h1 className="text-[20px] font-bold">{question}</h1>
      </div>
      <div className="bg-white h-[100px] flex items-center">
        <div className="px-4">
          <h1 className="text-[20px] font-bold">Comments</h1>
          <p className="text-[15px]">{comment}</p>
        </div>
      </div>
    </div>
  );
};

export default SpeakingPDF;
