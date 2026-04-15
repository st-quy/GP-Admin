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
  const [pageSize, setPageSize] = useState(10);
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
          {},
        ),
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
      (key) => result[key] !== null && result[key] !== undefined,
    );
  };
  const onLevelChange = (key, value) => {
    setLevels((prev) => ({ ...prev, [key]: value }));
    updateLevel(
      // @ts-ignore
      {
        id: key,
        value,
      },
    );
  };

  const commonColumns = [
    {
      title: "GRAMMAR & VOCABULARY",
      dataIndex: "GrammarVocab",
      key: "GrammarVocab",
      width: "240px",
      align: "center",
      render: (text, record) => (
        <span>
          {text || text === 0
            ? text + " | " + (record.GrammarVocabLevel || "-")
            : "-"}
        </span>
      ),
    },
    {
      title: "LISTENING",
      dataIndex: "Listening",
      key: "Listening",
      width: "120px",
      align: "center",
      render: (text, record) => (
        <span>
          {text || text === 0
            ? text + " | " + (record.ListeningLevel || "-")
            : "-"}
        </span>
      ),
    },
    {
      title: "READING",
      dataIndex: "Reading",
      key: "Reading",
      width: "120px",
      align: "center",
      render: (text, record) => (
        <span>
          {text || text === 0
            ? text + " | " + (record.ReadingLevel || "-")
            : "-"}
        </span>
      ),
    },
    {
      title: "SPEAKING",
      dataIndex: "Speaking",
      key: "Speaking",
      width: "120px",
      align: "center",
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
              ? text + " | " + (record.SpeakingLevel || "Ungraded")
              : "Ungraded"}
          </a>
        ) : (
          <span>
            {text || text === 0
              ? text + " | " + (record.SpeakingLevel || "Ungraded")
              : "Ungraded"}
          </span>
        ),
    },
    {
      title: "WRITING",
      dataIndex: "Writing",
      key: "Writing",
      width: "120px",
      align: "center",
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
            {text || text === 0
              ? text + " | " + (record.WritingLevel || "Ungraded")
              : "Ungraded"}
          </a>
        ) : (
          <span>
            {text || text === 0
              ? text + " | " + (record.WritingLevel || "Ungraded")
              : "Ungraded"}
          </span>
        ),
    },
    {
      title: "TOTAL",
      width: "90px",
      dataIndex: "Total",
      key: "Total",
      align: "center",
      render: (text) => <span>{text || text === 0 ? text : "-"}</span>,
    },
    {
      title: "LEVEL",
      dataIndex: "Level",
      key: "Level",
      fixed: "right",
      width: "90px",
      align: "center",
      render: (level, record) =>
        type === TableType.SESSION && !isPublished ? (
          <Select
            value={levels[record.ID]}
            placeholder="Level"
            disabled={
              !isAllScoresPresent(record) || record.IsPublished || isPublished
            }
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
          <span>{level || "-"}</span>
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
          align: "center",
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
          align: "center",
          render: (text, record) => (
            <a
              onClick={() => {
                navigate(`result/${record.ID}`);
              }}
              className="cursor-pointer underline underline-offset-4 hover:opacity-80 text-[#003087] font-medium"
            >
              {text || "Unknown"}
            </a>
          ),
        },
        ...commonColumns,
      ];
    }
  }, [type, status, levels]);

  const total = data?.pagination?.totalItems || 0;
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  return (
    <div>
      <div className="figma-table-card figma-table-overrides w-full">
        <Table
          // @ts-ignore
          columns={columns}
          dataSource={filteredData.map((item) => ({ ...item, key: item.ID }))}
          pagination={false}
          bordered
          className="w-full"
          rowClassName="text-center"
          scroll={{ x: "max-content" }}
          loading={isLoading}
        />
      </div>

      <div className="figma-pagination-wrapper">
        <div className="figma-pagination-box">
          <div className="figma-pagination-text whitespace-nowrap">
            {total === 0
              ? "No entries found"
              : `Showing ${String(start).padStart(2, "0")}-${String(end).padStart(2, "0")} of ${total}`}
          </div>

          <div className="figma-pagination-nav-group">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              itemRender={(page, type, original) => {
                if (type === "page") {
                  const isActive = currentPage === page;
                  return (
                    <button
                      className={`figma-page-btn ${isActive ? "active" : ""}`}
                    >
                      {page}
                    </button>
                  );
                }
                if (type === "prev") {
                  return (
                    <button className="figma-symbol-btn" type="button">
                      {"\u2039"}
                    </button>
                  );
                }
                if (type === "next") {
                  return (
                    <button className="figma-symbol-btn" type="button">
                      {"\u203A"}
                    </button>
                  );
                }
                if (type === "jump-prev" || type === "jump-next") {
                  return (
                    <span
                      className="text-[#637381] px-1"
                      style={{ fontSize: "16px", lineHeight: "25px" }}
                    >
                      ...
                    </span>
                  );
                }
                return original;
              }}
            />
          </div>

          <div className="figma-page-size-container">
            <Select
              value={pageSize}
              onChange={(val) => {
                setPageSize(val);
                setCurrentPage(1);
              }}
              bordered={false}
              className="figma-page-size-select"
              options={[
                { value: 5, label: "05 / pages" },
                { value: 10, label: "10 / pages" },
                { value: 20, label: "20 / pages" },
                { value: 50, label: "50 / pages" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSessionTable;
