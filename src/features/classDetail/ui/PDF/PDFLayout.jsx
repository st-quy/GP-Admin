import React from "react";
import Greenwich from "@assets/icons/pdf-icons/logo.png";
import Lion from "@assets/icons/pdf-icons/lion.png";

const PDFLayout = ({ children }) => {
  return (
    <div className="w-[210mm] min-h-[297mm] p-10 bg-white text-black font-sans text-[14px]">
      <div className="flex justify-between items-center">
        <img
          src={Greenwich}
          alt="University logo"
          className="w-[196px] h-[98px] mb-8"
        />
        <img src={Lion} alt="Green Prep" className="w-[220px] h-[170px]" />
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
};

export default PDFLayout;
