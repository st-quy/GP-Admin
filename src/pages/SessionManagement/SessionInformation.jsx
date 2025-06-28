import React, { useState } from "react";
import { Button, Tabs, message } from "antd";
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
    setSearchKeyword(event.target.value);
  };

  const handlePublishScore = () => {
    publishScores();
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

  return (
    <div className="session-container flex flex-col p-2 md:p-8">
      <Details type={type} isLoading={isLoading} data={data} />

      <div className="w-full">
        <div className="flex justify-between">
          <div>
            <p className="text-[30px] text-black font-bold">
              {type == TableType.SESSION
                ? "Student Monitoring"
                : "Assessment History"}
            </p>
            <p className="text-[18px] text-primaryTextColor font-medium mt-[10px]">
              {type == TableType.SESSION
                ? "Track student request and participation."
                : "Overview of Past Performance."}
            </p>
          </div>
          {type === TableType.SESSION && (
            <div>
              <Button
                className={`font-bold rounded-full transition-all duration-150 ease-in-out
    md:px-[28px] px-[18px] md:py-[13px] py-[7px] 
    md:text-base text-xs border-none transform 

    ${isLoadingPublishScores ? "cursor-not-allowed opacity-60" : "hover:scale-105"}
  `}
                onClick={handlePublishScore}
                disabled={data?.isPublished}
                loading={isLoadingPublishScores}
              >
                {data?.isPublished ? "Published" : "Publish Score"}
              </Button>
            </div>
          )}
        </div>
        <div className="md:mt-[34px] mt-[20px]">
          <SearchInput
            placeholder="Search by name, level"
            onSearchChange={onSearchChange}
            className={` ${type == TableType.SESSION ? "absolute z-10" : "mb-8"}`}
          />
        </div>
        <div className={`${type == TableType.SESSION && "h-[500px]"}`}>
          {type == TableType.SESSION ? (
            <Tabs defaultActiveKey="item-1" items={items} />
          ) : (
            <StudentSessionTable
              id={sessionId}
              studentId={studentId}
              type={type}
              searchKeyword={searchKeyword}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionInformation;
