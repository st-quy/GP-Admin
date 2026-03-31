import { useClassDetailQuery } from "@features/classDetail/hooks/useClassDetail";
import ClassInfo from "@features/classDetail/ui/ClassInfo/ClassInfo";
import SessionManager from "@features/classDetail/ui/SessionManager/SessionManager";
import { Spin } from "antd";
import React from "react";
import { useParams } from "react-router-dom";

const ClassDetail = () => {
  const { classId } = useParams();
  const {
    data: classDetail,
    isLoading,
    isError,
  } = useClassDetailQuery(classId);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <h1 className="text-center text-red-500">Error loading class detail</h1>
      </div>
    );
  }

  // Render class details and session table
  return (
    <div className="figma-page-container">
      <div className="figma-content-wrapper">
        <div className="py-8">
          <ClassInfo data={classDetail} />
          <div className="my-10 h-[0px] w-full border-[0.3px] border-[rgba(0,0,0,0.5)]"></div>
          <SessionManager data={classDetail} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ClassDetail;
