import React from "react";
import Group from "@assets/icons/class-detail/group.png";

const ClassInfo = ({ data }) => {
  return (
    <div className="flex w-full items-center justify-between">
      <div>
        <h4 className="font-[700] lg:text-[30px] md:text-[28px]">
          Class Information
        </h4>
        <p className="font-[500] text-primaryTextColor lg:text-[18px] md:text-[16px]">
          View class details
        </p>
      </div>
      <div className="flex !items-center justify-center gap-4 rounded-[10px] border border-[#3758F9] bg-tableHeadColor p-4 xl:h-[60px] xl:w-[200px]">
        <img src={Group} width={36} height={31} alt="Group Icon" />
        <div className="font-[500] uppercase lg:text-[24px] md:text-[22px]">
          {data.className}
        </div>
      </div>
    </div>
  );
};

export default ClassInfo;
