import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Table, Select, Pagination, Spin } from "antd";
import { TableType, StatusType, LevelEnum } from "../constant/TableEnum";
import {
  useSessionParticipants,
  useStudentParticipants,
  useUpdateLevel,
} from "../hooks/useSession";
import "../css/index.scss";
import { useNavigate } from "react-router-dom";

const StudentSessionTable = ({
  id,
  studentId,
  searchKeyword,
  type,
  status = "draft",
  isPublished = false,
}) => {
  const { mutate: updateLevel } = useUpdateLevel();

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [levels, setLevels] = useState({});

  const { data, isLoading } =
    type === TableType.SESSION
      ? useSessionParticipants(id, { page: currentPage, limit: pageSize })
      : useStudentParticipants(studentId, {
          page: currentPage,
          limit: pageSize,
        });

  const processedData = data?.data || [];

  useEffect(() => {
    if (processedData.length) {
      setLevels(
        processedData.reduce(
          (acc, cur) => ({ ...acc, [cur.ID]: cur.Level }),
          {}
        )
      );
    }
  }, [processedData]);

  const filteredData = useMemo(() => {
    const keyword = searchKeyword?.toLowerCase().trim() || "";
    if (!keyword) return processedData;
    return processedData.filter((item) => {
      const fullName = String(item.User?.fullName || "").toLowerCase();
      const sessionName = String(item.Session?.sessionName || "").toLowerCase();
      const level = String(item.Level || "").toLowerCase();

      return (
        sessionName.includes(keyword) ||
        fullName.includes(keyword) ||
        level.includes(keyword)
      );
    });
  }, [processedData, searchKeyword]);

  const checkIsAllQuestionGraded = useCallback(() => {
    if (!processedData.length) return;
    // Add logic here if needed
  }, [processedData]); // Removed `levels` from dependencies to stabilize the function

  useEffect(() => {
    if (type === TableType.SESSION && status !== StatusType.PUBLISHED) {
      checkIsAllQuestionGraded();
    }
  }, [type, status, checkIsAllQuestionGraded]); // Updated dependency array to include stable dependencies
  const isAllScoresPresent = (result) => {
    const requiredScores = [
      "GrammarVocab",
      "Reading",
      "Speaking",
      "Writing",
      "Listening",
    ];
    return requiredScores.every(
      (key) => result[key] !== null && result[key] !== undefined
    );
  };
  const onLevelChange = (key, value) => {
    setLevels((prev) => ({ ...prev, [key]: value }));
    updateLevel(
      // @ts-ignore
      {
        id: key,
        value,
      }
    );
  };

  const commonColumns = [
    {
      title: "GRAMMAR & VOCABULARY",
      dataIndex: "GrammarVocab",
      key: "GrammarVocab",
      width: "240px",
      render: (text, record) => (
        <span>{text || text === 0 ? text : "No Data"}</span>
      ),
    },
    {
      title: "LISTENING",
      dataIndex: "Listening",
      key: "Listening",
      width: "120px",
      render: (text, record) => (
        <span>
          {text || text === 0
            ? text + " | " + record.ListeningLevel
            : "No Data"}
        </span>
      ),
    },
    {
      title: "READING",
      dataIndex: "Reading",
      key: "Reading",
      width: "120px",
      render: (text, record) => (
        <span>
          {text || text === 0 ? text + " | " + record.ReadingLevel : "No Data"}
        </span>
      ),
    },
    {
      title: "SPEAKING",
      dataIndex: "Speaking",
      key: "Speaking",
      width: "120px",
      render: (text, record) =>
        type === TableType.SESSION && status !== StatusType.PUBLISHED ? (
          <a
            onClick={() =>
              navigate(`participant/${record.ID}?skill=speaking`, {
                state: { isPublished },
              })
            }
            className="cursor-pointer underline underline-offset-4 hover:opacity-80"
          >
            {text || text === 0
              ? text + " | " + record.SpeakingLevel
              : "Ungraded"}
          </a>
        ) : (
          <span>
            {text || text === 0
              ? text + " | " + record.SpeakingLevel
              : "Ungraded"}
          </span>
        ),
    },
    {
      title: "WRITING",
      dataIndex: "Writing",
      key: "Writing",
      width: "120px",
      render: (text, record) =>
        type === TableType.SESSION && status !== StatusType.PUBLISHED ? (
          <a
            onClick={() =>
              navigate(`participant/${record.ID}?skill=writing`, {
                state: { isPublished },
              })
            }
            className="cursor-pointer underline underline-offset-4 hover:opacity-80"
          >
            {text ? text + " | " + record.WritingLevel : "Ungraded"}
          </a>
        ) : (
          <span>{text ? text + " | " + record.WritingLevel : "Ungraded"}</span>
        ),
    },
    {
      title: "TOTAL",
      width: "90px",
      dataIndex: "Total",
      key: "Total",
      render: (text) => <span>{text ? text : "No Data"}</span>,
    },
    {
      title: "LEVEL",
      dataIndex: "Level",
      key: "Level",
      fixed: "right",
      width: "90px",
      render: (level, record) =>
        type === TableType.SESSION && status !== StatusType.PUBLISHED ? (
          <Select
            value={levels[record.ID]}
            placeholder="Level"
            disabled={!isAllScoresPresent(record) || record.IsPublished}
            onChange={(value) => onLevelChange(record.ID, value)}
            className="p-0"
          >
            {LevelEnum.map((lvl) => (
              <Select.Option key={lvl} value={lvl}>
                {lvl}
              </Select.Option>
            ))}
          </Select>
        ) : (
          <span>{level || "No Data"}</span>
        ),
      onHeaderCell: () => {
        return {
          style: {
            textAlign: "center",
            backgroundColor: "#E6F0FA",
          },
        };
      },
      className: "shadow-[-4px_0px_0_rgba(0,0,0,0.1)] md:shadow-none",
    },
  ];

  const columns = useMemo(() => {
    if (type === TableType.SESSION) {
      return [
        {
          title: "STUDENT NAME",
          dataIndex: ["User", "fullName"],
          key: "fullName",
          width: "260px",
          render: (text, record) =>
            text ? (
              <a
                onClick={() => navigate(`student/${record.User.ID}`)}
                className="cursor-pointer underline underline-offset-4 hover:opacity-80"
              >
                {text}
              </a>
            ) : (
              "Unknown"
            ),
        },
        ...commonColumns,
      ];
    } else {
      return [
        {
          title: "SESSION NAME",
          dataIndex: ["Session", "sessionName"],
          key: "SessionID",
          width: "260px",
          render: (text) => (
            <span className="cursor-pointer hover:opacity-80">
              {text || "Unknown"}
            </span>
          ),
        },
        ...commonColumns,
      ];
    }
  }, [type, status, levels]);

  return (
    <div>
      <Table
        // @ts-ignore
        columns={columns}
        dataSource={filteredData.map((item) => ({ ...item, key: item.ID }))}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "15", "20"],
          showTotal: (total, range) =>
            `Showing ${range[0]}-${range[1]} of ${total}`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
        bordered
        className="border border-gray-200 pagination w-full p-0 m-0 overflow-x-auto bg-none"
        rowClassName="text-center"
        scroll={{ x: 768 }}
        components={{
          header: {
            wrapper: (props) => (
              <thead
                {...props}
                className={`bg-tableHeadColor text-primaryTextColor`}
              />
            ),
            cell: (props) => (
              <th
                {...props}
                className={` bg-[#E6F0FA] text-[10px] font-[700] md:text-[16px] text-[#637381] tracking-wider text-center !py-4 px-0 whitespace-nowrap `}
              />
            ),
          },
          body: {
            cell: (props) => (
              <td
                {...props}
                className={`font-[500] tracking-wider text-center py-4 px-0 whitespace-nowrap text-[10px] md:text-[14px] text-[#637381] ${props.className || ""}`}
              />
            ),
          },
        }}
      />
    </div>
  );
};

export default StudentSessionTable;
