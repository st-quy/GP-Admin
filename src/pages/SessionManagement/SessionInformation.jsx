import React, { useState, useMemo } from "react";
import { Button, Tabs, message } from "antd";
import StudentMonitoring from "@features/session/ui/StudentModering";
import StudentSessionTable from "@/features/session/ui/StudentSessionTable.jsx";
import SearchInput from "@/app/components/SearchInput.jsx";
import Details from "@features/session/ui/Details.jsx";
import ConfirmationModal from "@shared/Modal/ConfirmationModal";
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
  const [publishModalOpen, setPublishModalOpen] = useState(false);

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
    setPublishModalOpen(true);
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
                  className={`!h-[50px] !w-[250px] !rounded-[50px] font-bold transition-all
                    ${data?.isPublished
                      ? "!bg-white !text-[#6B7280] !border-[#D1D5DB] !border-solid !border"
                      : isAllGraded
                        ? "!bg-[#13C296] !text-white !border-none"
                        : "!bg-[#003087] !text-white !border-none"
                    }
                    ${isLoadingPublishScores ? "cursor-not-allowed opacity-60" : !data?.isPublished ? "hover:scale-105" : ""}
                  `}
                  onClick={handlePublishScore}
                  disabled={data?.isPublished}
                  loading={isLoadingPublishScores}
                >
                  {data?.isPublished
                    ? "Published Score"
                    : isAllGraded
                      ? "Ready to Publish Score"
                      : "Publish Score"}
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
      </div>

      <ConfirmationModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        title="Are you sure to want publish the score?"
        message="Once published, the score will be visible to all relevant students and cannot be edited."
        okText="Publish"
        okButtonColor="#003087"
        onConfirm={() => {
          publishScores();
          setPublishModalOpen(false);
        }}
      />
    </div>
  );
};

export default SessionInformation;
