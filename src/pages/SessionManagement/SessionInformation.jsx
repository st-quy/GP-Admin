import React, { useState, useMemo } from "react";
import { Button, Tabs, message, Modal } from "antd";
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

  const isAllGraded = useMemo(() => {
    if (!data?.SessionParticipants || data.SessionParticipants.length === 0) return false;
    return data.SessionParticipants.every(p => p.Level && p.Level !== "Ungraded");
  }, [data]);

  const handlePendingCountChange = (count) => {
    setPendingCount(count);
  };

  const onSearchChange = (event) => {
    const rawValue = event.target.value;
    let cleanValue = rawValue;

    if (/[^a-zA-Z0-9\s]/.test(cleanValue)) {
      message.warning('Special characters and emojis are not allowed in search.');
      cleanValue = cleanValue.replace(/[^a-zA-Z0-9\s]/g, '');
    }

    if (/\s{2,}/.test(cleanValue)) {
      message.info('Multiple spaces are not allowed; collapsed to a single space.');
      cleanValue = cleanValue.replace(/\s{2,}/g, ' ');
    }

    if (cleanValue.length > 50) {
      message.error('Search limit reached (max 50 characters).');
      cleanValue = cleanValue.slice(0, 50);
    }

    cleanValue = cleanValue.replace(/^\s+/, '');
    setSearchKeyword(cleanValue);
  };

  const handlePublishScore = () => {
    Modal.confirm({
      title: "Are you sure you want to publish the score?",
      content: "Once published, the score will be visible to all relevant students and cannot be edited.",
      okText: "Publish",
      cancelText: "Cancel",
      centered: true,
      width: 713,
      okButtonProps: {
        className: "!h-[50px] !rounded-full !bg-primaryColor !px-8 !text-white font-bold",
      },
      cancelButtonProps: {
        className: "!h-[50px] !rounded-full !px-8 font-bold",
      },
      onOk() {
        publishScores();
      },
    });
  };

  const items = [
    {
      label: (
        <div className="flex items-center justify-center">
          <span>Participant List</span>
        </div>
      ),
      key: "item-1",
      children: (
        <div className="mt-8">
          <StudentSessionTable
            id={sessionId}
            studentId={studentId}
            type={type}
            searchKeyword={searchKeyword}
            isPublished={data?.isPublished}
          />
        </div>
      ),
    },
    {
      label: (
        <div className="relative flex items-center justify-center">
          <span>Pending Request</span>
          {pendingCount > 0 && (
            <div className="absolute -right-4 top-0 h-[13px] w-[13px] rounded-full bg-[#E10E0E]"></div>
          )}
        </div>
      ),
      key: "item-2",
      children: (
        <div className="mt-8">
          <StudentMonitoring
            sessionId={sessionId}
            searchKeyword={searchKeyword}
            onPendingCountChange={handlePendingCountChange}
          />
        </div>
      ),
      forceRender: true,
    },
  ];

  return (
    <div className="figma-page-container">
      <div className="figma-content-wrapper pb-10">
        <div className="py-8">
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
                    placeholder="Search by name, level"
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
      </div>
    </div>
  );
};

export default SessionInformation;
