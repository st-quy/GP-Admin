import React from "react";
import { Card, Spin, Tag, Typography, Descriptions, Divider } from "antd";
import { TableType } from "@features/session/constant/TableEnum";

const { Text } = Typography;

const statusTag = (status) => {
  const statusMap = {
    COMPLETE: { color: "green", text: "Completed" },
    ON_GOING: { color: "blue", text: "On Going" },
    NOT_STARTED: { color: "gray", text: "Not Started" },
  };
  return (
    <Tag color={statusMap[status]?.color} className="rounded-3xl border-none">
      {statusMap[status]?.text || "Unknown"}
    </Tag>
  );
};

const Details = ({ type, isLoading, data }) => {
  if (isLoading) {
    return <Spin className="flex justify-center mt-4" />;
  }

  if (!data) {
    return (
      <Text type="danger" className="text-center block text-lg font-medium">
        No data available.
      </Text>
    );
  }

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "---";
    const date = new Date(dateTime);
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const col1 = [
    { label: "Session name", value: data.sessionName, bold: true },
    { label: "Number of participants", value: data.participantCount || "0", bold: true },
    { label: "Start time", value: formatDateTime(data.startTime), bold: true },
  ];

  const col2 = [
    { label: "Session key", value: data.sessionKey, bold: true },
    { label: "Status", value: statusTag(data.status), isTag: true },
    { label: "End time", value: formatDateTime(data.endTime), bold: true },
  ];

  const studentItems = [
    { label: "Student Name", value: `${data.firstName} ${data.lastName}` },
    { label: "Student ID", value: data.studentCode },
    { label: "Class", value: data.class },
    { label: "Email", value: data.email },
    { label: "Phone", value: data.phone },
  ];

  return (
    <div>
      <h4 className="figma-title">
        {type === TableType.SESSION ? "Session information" : "Student information"}
      </h4>
      <p className="figma-subtitle">
        {type === TableType.SESSION
          ? "View session details."
          : "View student details."}
      </p>
      
      <div className="mt-8 w-full rounded-lg bg-white p-10 shadow-[0px_4px_4px_rgba(0,0,0,0.1)]">
        {type === TableType.SESSION ? (
          <div className="flex flex-col md:flex-row justify-between lg:gap-x-40">
            {/* Column 1 */}
            <div className="flex flex-col gap-y-6 flex-1">
              {col1.map((item, index) => (
                <div key={index} className="flex items-center">
                  <span className="w-[200px] text-[16px] text-[#374151] font-normal">
                    {item.label}
                  </span>
                  <div className={`text-[16px] text-[#1F2A37] ${item.bold ? 'font-semibold' : 'font-medium'}`}>
                    {item.value || "Not Available"}
                  </div>
                </div>
              ))}
            </div>
            {/* Column 2 */}
            <div className="flex flex-col gap-y-6 flex-1">
              {col2.map((item, index) => (
                <div key={index} className="flex items-center">
                  <span className="w-[200px] text-[16px] text-[#374151] font-normal">
                    {item.label}
                  </span>
                  <div className={`text-[16px] text-[#1F2A37] ${item.bold ? 'font-semibold' : 'font-medium'}`}>
                    {item.value || "Not Available"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-6 md:grid-cols-2 lg:gap-x-40">
            {studentItems.map((item, index) => (
              <div key={index} className="flex items-center">
                <span className="w-[200px] text-[16px] text-[#374151] font-normal">
                  {item.label}
                </span>
                <div className={`text-[16px] text-[#1F2A37] font-medium`}>
                  {item.value || "Not Available"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="my-10 h-[0px] w-full border-[0.3px] border-[rgba(0,0,0,0.5)]"></div>
    </div>
  );
};

export default Details;
