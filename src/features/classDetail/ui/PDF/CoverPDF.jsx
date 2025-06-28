import React from "react";
import Greenwich from "@assets/icons/pdf-icons/logo.png";
import Lion from "@assets/icons/pdf-icons/lion.png";
import PDFLayout from "./PDFLayout";

const CoverPDF = ({ student }) => {
  return (
    <PDFLayout>
      {/* Student Name */}
      <div className="text-center mb-6">
        <h1 className="text-[20px] font-bold uppercase text-black">
          {student.name}
        </h1>
        <p className="uppercase text-[15px] font-semibold text-gray-600">
          Student
        </p>
      </div>

      {/* Student Info */}
      <div>
        <h1 className="font-bold text-[20px] mb-4 text-center">
          Student Information
        </h1>
        <div className="border-[2px] border-solid border-[#B9B9B9] rounded-[5px] mb-6">
          <h2 className="text-[18px] mb-2 p-4 bg-[#B9B9B9]">
            Student Information
          </h2>
          <div className="grid grid-cols-2 gap-4 p-4 text-[16px]">
            <div className="flex justify-between gap-4">
              <span>Student ID:</span>
              <span className="font-bold">{student.id}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Email:</span>
              <span className="font-bold">{student.email}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Phone:</span>
              <span className="font-bold">{student.phone}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Class:</span>
              <span className="font-bold">{student.className}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div>
        <h1 className="font-bold text-[20px] mb-4 text-center">
          Session Details
        </h1>
        <div className="border-[2px] border-solid border-[#B9B9B9] rounded-[5px] mb-6">
          <h2 className="text-[18px] mb-2 p-4 bg-[#B9B9B9]">Session Details</h2>
          <div className="grid grid-cols-2 gap-4 p-4 text-[16px]">
            <div className="flex justify-between gap-4">
              <span>Session Name:</span>
              <span className="font-bold">{student.session?.name}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Start Date:</span>
              <span className="font-bold">{student.session?.start}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Session Key:</span>
              <span className="font-bold">{student.session?.key}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>End Date:</span>
              <span className="font-bold">{student.session?.end}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scores */}
      <div>
        <h1 className="font-bold text-[20px] mb-4 text-center">All Scores</h1>
        <div className="border-[2px] border-solid border-[#B9B9B9] rounded-[5px] mb-6">
          <div className="flex justify-between items-center mb-2 p-4 bg-[#B9B9B9]">
            <h2 className="text-[18px] my-0">All Scores</h2>
            <div className="text-[20px]">
              <span className="font-bold">Band Level:</span>
              <span className="text-red-500 font-bold ms-2">
                {student.band}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4 text-[16px]">
            <div className="flex justify-between gap-4">
              <span>Speaking:</span>
              <span className="font-bold">
                {student.scores?.speaking} | {student.level}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Reading:</span>
              <span className="font-bold">
                {student.scores?.reading} | {student.level}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span>Listening:</span>
              <span className="font-bold">
                {student.scores?.listening} | {student.level}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Writing:</span>
              <span className="font-bold">
                {student.scores?.writing} | {student.level}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Grammar & Vocabulary:</span>
              <span className="font-bold">{student.scores?.grammar}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Total:</span>
              <span className="font-bold">
                {student.scores?.total} | {student.level}
              </span>
            </div>
          </div>
        </div>
      </div>
    </PDFLayout>
  );
};

export default CoverPDF;
