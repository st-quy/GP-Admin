import React, { useState } from "react";
import { Button, Tabs, message, Modal } from "antd";
import "@features/session/css/index.scss";
import StudentMonitoring from "@features/session/ui/StudentModering";
import StudentSessionTable from "@/features/session/ui/StudentSessionTable.jsx";
import SearchInput from "@/app/components/SearchInput.jsx";
import Details from "@features/session/ui/Details.jsx";
import { useParams } from "react-router-dom";
import { TableType } from "@features/session/constant/TableEnum";
import {
  usePublishScores,
  useSessionDetails,
  useStudentDetails,
} from "@features/session/hooks/useSession";

const SessionInformation = ({ type }) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { sessionId, studentId } = useParams();
  const [pendingCount, setPendingCount] = useState(0);

  const { mutate: publishScores, isPending: isLoadingPublishScores } =
    usePublishScores(sessionId);

  const { data, isLoading: isLoading } =
    type === TableType.SESSION
      ? useSessionDetails(sessionId)
      : useStudentDetails(studentId);

  const handlePendingCountChange = (count) => {
    setPendingCount(count);
  };

  const onSearchChange = (event) => {
    const rawValue = event.target.value;
    let cleanValue = rawValue;

    // 1. Proactively handle special characters/emojis
    if (/[^a-zA-Z0-9\s]/.test(cleanValue)) {
      message.warning('Special characters and emojis are not allowed in search.');
      cleanValue = cleanValue.replace(/[^a-zA-Z0-9\s]/g, '');
    }

    // 2. Proactively handle multiple spaces
    if (/\s{2,}/.test(cleanValue)) {
      message.info('Multiple spaces are not allowed; collapsed to a single space.');
      cleanValue = cleanValue.replace(/\s{2,}/g, ' ');
    }

    // 3. Proactively handle length overflow
    if (cleanValue.length > 50) {
      message.error('Search limit reached (max 50 characters).');
      cleanValue = cleanValue.slice(0, 50);
    }

    // 4. Block leading spaces
    cleanValue = cleanValue.replace(/^\s+/, '');

    setSearchKeyword(cleanValue);
  };

  const handlePublishScore = () => {
  Modal.confirm({
    title: "Are you sure you want to publish the score?",
    content:
      "Once published, the score will be visible to all relevant students and cannot be edited.",
    okText: "Publish",
    cancelText: "Cancel",
    okButtonProps: {
      className: "bg-primary text-white font-semibold rounded-full",
    },
    cancelButtonProps: {
      className: "rounded-full",
    },
    onOk() {
      publishScores();
    },
  });
};

  const items = [
    {
      label: "Participant List",
      key: "item-1",
      children: (
        <StudentSessionTable
          id={sessionId}
          studentId={studentId}
          type={type}
          searchKeyword={searchKeyword}
          isPublished={data?.isPublished}
        />
      ),
    },
    {
      label: (
        <span className="relavtive">
          Pending Request
          {pendingCount > 0 && (
            <div className="bg-redDark w-[13px] h-[13px] absolute md:top-4 top-1 md:right-6 right-1 rounded-full"></div>
          )}
        </span>
      ),
      key: "item-2",
      children: (
        <StudentMonitoring
          sessionId={sessionId}
          searchKeyword={searchKeyword}
          onPendingCountChange={handlePendingCountChange}
        />
      ),
      forceRender: true,
    },
  ];

  const isAllGraded = data?.isAllGraded || false;

  return (
    <div className="session-container flex flex-col p-2 md:p-8">
      <Details type={type} isLoading={isLoading} data={data} />

      <div className="w-full">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h4 className="figma-title">
              {type == TableType.SESSION
                ? "Student Monitoring"
                : "Assessment History"}
            </h4>
            <p className="figma-subtitle">
              {type == TableType.SESSION
                ? "Track student request and participation."
                : "Overview of Past Performance."}
            </p>
          </div>
          {type === TableType.SESSION && (
            <Button
              className={`!h-[50px] !w-[236px] !rounded-[50px] !border-none font-bold text-white transition-all
                ${data?.isPublished 
                  ? "!bg-[#E5E7EB] !text-[#6B7280]" 
                  : isAllGraded 
                    ? "!bg-[#13C296]" 
                    : "!bg-[#003087]"
                }
                ${isLoadingPublishScores ? "cursor-not-allowed opacity-60" : "hover:scale-105"}
              `}
              onClick={handlePublishScore}
              disabled={data?.isPublished}
              loading={isLoadingPublishScores}
            >
              {data?.isPublished ? "Published" : "Publish Score"}
            </Button>
          )}
        </div>

        <div>
          {type === TableType.SESSION ? (
            <Tabs 
              defaultActiveKey="item-1" 
              items={items}
              className="figma-custom-tabs"
              tabBarExtraContent={{
                left: (
                  <div className="pr-10">
                    <SearchInput
                      placeholder="Search by name, level"
                      value={searchKeyword}
                      onSearchChange={onSearchChange}
                      isFigmaRedesign={true}
                    />
                  </div>
                )
              }}
            />
          ) : (
            <div className="mt-8">
              <SearchInput
                placeholder="Search by session name"
                value={searchKeyword}
                onSearchChange={onSearchChange}
                isFigmaRedesign={true}
                className="mb-8"
              />
              <StudentSessionTable
                id={sessionId}
                studentId={studentId}
                type={type}
                searchKeyword={searchKeyword}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionInformation;
