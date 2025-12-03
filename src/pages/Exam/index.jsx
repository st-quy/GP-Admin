// ExamListPage.jsx
import React, { useMemo, useState } from "react";
import {
  Card,
  Table,
  Avatar,
  Input,
  Select,
  Tooltip,
  Pagination,
  Space,
  message,
  Button,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import HeaderInfo from "@app/components/HeaderInfo";
import { TopicApi } from "@features/topic/api";
import { useNavigate } from "react-router-dom";
import useGlobalData from "@shared/hook/useGlobalData";

const { Option } = Select;

const statusTagConfig = {
  "Pending Review": {
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: "Pending Review",
  },
  Approved: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    label: "Approved",
  },
  "Needs Revision": {
    bg: "bg-amber-100",
    text: "text-amber-700",
    label: "Needs Revision",
  },
  Closed: {
    bg: "bg-rose-100",
    text: "text-rose-700",
    label: "Closed",
  },
};

const ExamListPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const navigate = useNavigate();
  const { globalData, setGlobalData } = useGlobalData();

  const onStartHandler = (record) => {
    localStorage.setItem("listening_test_answers", []);
    localStorage.setItem("listening_formatted_answers", []);
    localStorage.setItem("listening_played_questions", []);
    localStorage.setItem("listening_test_submitted", false);
    localStorage.setItem("isSubmitted", false);
    localStorage.removeItem("grammarAnswers");
    localStorage.removeItem("readingAnswers");
    localStorage.removeItem("writingAnswers");
    localStorage.removeItem("timeRemainingData");
    localStorage.removeItem("readingSubmitted");
    navigate(`/${record.id}/waiting-for-approval`);
  };

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      try {
        const { data } = await TopicApi.getAllTopic();
        return data?.data ?? [];
      } catch (error) {
        message.error(
          error?.response?.data?.message || "Failed to load exams."
        );
        return [];
      }
    },
  });

  // Map backend topics -> exams used by the UI
  const exams = useMemo(() => {
    return topics.map((t) => ({
      id: t.id ?? t.ID,
      name: t.name ?? t.Name ?? "Untitled Exam",
      duration: t.duration
        ? `${t.duration} minutes`
        : t.Duration
          ? `${t.Duration} minutes`
          : "—",
      status: t.status ?? t.Status ?? "Pending Review",
      creator: t.creator ?? t.CreatedBy ?? "Unknown",
    }));
  }, [topics]);

  const filteredData = useMemo(() => {
    return exams.filter((item) => {
      const matchSearch = item.name
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" ? true : item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, exams]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const counts = useMemo(() => {
    const pending = exams.filter((x) => x.status === "Pending Review").length;
    const approved = exams.filter((x) => x.status === "Approved").length;
    const needs = exams.filter((x) => x.status === "Needs Revision").length;
    const closed = exams.filter((x) => x.status === "Closed").length;

    return { pending, approved, needs, closed };
  }, [exams]);

  const columns = [
    {
      title: "Exam Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (text) => <span className="text-gray-500 text-sm">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const cfg = statusTagConfig[status] || {
          bg: "bg-gray-100",
          text: "text-gray-700",
          label: status || "Unknown",
        };
        return (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
          >
            {cfg.label}
          </span>
        );
      },
    },
    {
      title: "Created By",
      dataIndex: "creator",
      key: "creator",
      render: (creator) => (
        <div className="flex items-center gap-2">
          <Avatar size="small">{creator?.charAt(0) || "?"}</Avatar>
          <span className="text-gray-700 text-sm">{creator}</span>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View">
            <EyeOutlined className="cursor-pointer text-gray-400 hover:text-gray-600" />
          </Tooltip>
          <Tooltip title="Do Mock Test">
            <Button
              type="link"
              className="p-0 flex items-center"
              onClick={() => onStartHandler(record)}
            >
              Mock Test
            </Button>
          </Tooltip>
          <Tooltip title="Edit">
            <EditOutlined className="cursor-pointer text-gray-400 hover:text-gray-600" />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteOutlined className="cursor-pointer text-rose-400 hover:text-rose-600" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <HeaderInfo
        title="Exam List"
        subtitle="Manage and track all your English exams"
      />
<<<<<<< Updated upstream
      <div className='bg-gray-50 p-6'>
        <div className='mx-auto space-y-6'>
=======
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto space-y-6">
>>>>>>> Stashed changes
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-none">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-500 text-sm">Pending Review</div>
                  <div className="text-2xl font-semibold mt-1">
                    {counts.pending}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <ClockCircleOutlined className="text-gray-500" />
                </div>
              </div>
            </Card>

            <Card className="shadow-sm border-none">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-emerald-500 text-sm">Approved</div>
                  <div className="text-2xl font-semibold mt-1">
                    {counts.approved}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircleOutlined className="text-emerald-500" />
                </div>
              </div>
            </Card>

            <Card className="shadow-sm border-none">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-amber-500 text-sm">Needs Revision</div>
                  <div className="text-2xl font-semibold mt-1">
                    {counts.needs}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <ExclamationCircleOutlined className="text-amber-500" />
                </div>
              </div>
            </Card>

            <Card className="shadow-sm border-none">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-rose-500 text-sm">Closed</div>
                  <div className="text-2xl font-semibold mt-1">
                    {counts.closed}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                  <CloseCircleOutlined className="text-rose-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Table + Filters */}
          <Card className="shadow-sm border-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <Input
                allowClear
                className="sm:max-w-xs"
                placeholder="Search by exam name..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
              <Select
                className="w-40"
                value={statusFilter}
                onChange={(val) => {
                  setPage(1);
                  setStatusFilter(val);
                }}
              >
                <Option value="all">All Statuses</Option>
                <Option value="Pending Review">Pending Review</Option>
                <Option value="Approved">Approved</Option>
                <Option value="Needs Revision">Needs Revision</Option>
                <Option value="Closed">Closed</Option>
              </Select>
            </div>

            <Table
              rowKey="id"
              columns={columns}
              dataSource={paginatedData}
              pagination={false}
              loading={isLoading}
            />

            {/* Footer text + Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <span className="text-sm text-gray-500">
                {filteredData.length > 0
                  ? `Showing ${(page - 1) * pageSize + 1}-${Math.min(
                      page * pageSize,
                      filteredData.length
                    )} of ${filteredData.length}`
                  : "No exams found"}
              </span>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={filteredData.length}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
              />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ExamListPage;
