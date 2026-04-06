import React from "react";
import { Spin, Tag, Typography } from "antd";
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
      <Text type="danger" className="text-center block">
        No data available.
      </Text>
    );
  }

  const formatDateTime = (dateTime) => {
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
    { label: "Number of participants", value: data.SessionParticipants?.length || "0", bold: true },
    { label: "Start time", value: formatDateTime(data.startTime), bold: true },
  ];

  const col2 = [
    { label: "Session key", value: data.sessionKey, bold: true },
    { label: "Status", value: statusTag(data.status), isTag: true },
    { label: "End time", value: formatDateTime(data.endTime), bold: true },
  ];

  const studentCol1 = [
    { label: "Student name", value: `${data.firstName} ${data.lastName}` },
    { label: "Student ID", value: data.studentCode },
    { label: "Class name", value: data.class },
  ];

  const studentCol2 = [
    { label: "Email", value: data.email },
    { label: "Phone", value: data.phone },
  ];

  return (
    <div>
      <p className="text-[30px] text-black font-bold">
        {type == TableType.SESSION
          ? "Session information"
          : "Student information"}
      </p>
      <p className="text-[18px] text-primaryTextColor font-medium mt-[10px]">
        {type == TableType.SESSION
          ? "Track student request and participation."
          : "View student details."}
      </p>
      
      <div className="mt-8 w-full rounded-lg bg-white p-10 shadow-[0px_4px_4px_rgba(0,0,0,0.1)]">
        {type === TableType.SESSION ? (
          <div className="flex flex-col md:flex-row justify-between lg:gap-x-40">
            {/* Column 1 */}
            <div className="flex flex-col gap-y-6 flex-1">
              {col1.map((item, index) => (
                <div key={index} className="flex items-center">
                  <span className="w-[200px] text-center text-[16px] text-[#374151] font-normal">
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
                  <span className="w-[200px] text-center text-[16px] text-[#374151] font-normal">
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
          <div className="flex flex-col md:flex-row justify-between lg:gap-x-40">
            <div className="flex flex-col gap-y-6 flex-1">
              {studentCol1.map((item, index) => (
                <div key={index} className="flex items-center">
                  <span className="w-[150px] text-[16px] text-[#374151] font-normal">
                    {item.label}
                  </span>
                  <div className="text-[16px] text-[#1F2A37] font-semibold">
                    {item.value || "Not Available"}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-y-6 flex-1 mt-6 md:mt-0">
              {studentCol2.map((item, index) => (
                <div key={index} className="flex items-center">
                  <span className="w-[150px] text-[16px] text-[#374151] font-normal">
                    {item.label}
                  </span>
                  <div className="text-[16px] text-[#1F2A37] font-semibold">
                    {item.value || "Not Available"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Details;
