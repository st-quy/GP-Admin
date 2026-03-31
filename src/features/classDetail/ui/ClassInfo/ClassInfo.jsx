import React from "react";
import Group from "@assets/icons/class-detail/group.png";

const ClassInfo = ({ data }) => {
  return (
    <div className="flex w-full items-center justify-between">
      <div>
        <h4 className="figma-title">
          Class Information
        </h4>
        <p className="figma-subtitle">
          View class details
        </p>
      </div>
      <div className="flex !items-center justify-center gap-4 rounded-[10px] bg-[#E6F0FA] p-4 xl:h-[60px] xl:w-[204px]">
        <img src={Group} width={38} height={38} alt="Group Icon" className="grayscale brightness-0" />
        <div className="text-[24px] font-[600] uppercase leading-[30px] text-[#1F2A37]">
          {data?.className || "CLASS01"}
        </div>
      </div>
    </div>
  );
};

export default ClassInfo;
