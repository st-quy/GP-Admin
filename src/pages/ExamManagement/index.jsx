import React, { useState } from "react";
import {
  Table,
  Button,
  Typography,
  Input,
  Select,
  Tag,
  Space,
  ConfigProvider,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

// Sample Data giống layout trong hình
const initialExamData = [
  {
    key: "1",
    examName: "Academic Listening Test Section 1...",
    status: "Pending approval",
    creator: "John Smith",
    creationDay: "2024-01-15",
    updateDate: "2024-01-20",
    updater: "Jane Doe",
  },
  {
    key: "2",
    examName: "Reading Comprehension Exercise...",
    status: "Approved",
    creator: "Sarah Wilson",
    creationDay: "2024-01-14",
    updateDate: "2024-01-19",
    updater: "Mike Johnson",
  },
  {
    key: "3",
    examName: "Grammar Focus: Present Perfect...",
    status: "Approved",
    creator: "Emily Davis",
    creationDay: "2024-01-13",
    updateDate: "2024-01-18",
    updater: "Tom Brown",
  },
  {
    key: "4",
    examName: "Speaking Task: Describe a Picture...",
    status: "Pending approval",
    creator: "Alex Chen",
    creationDay: "2024-01-12",
    updateDate: "2024-01-17",
    updater: "Lisa Wang",
  },
  {
    key: "5",
    examName: "Writing Exercise: Essay Structure...",
    status: "Approved",
    creator: "David Miller",
    creationDay: "2024-01-11",
    updateDate: "2024-01-16",
    updater: "Anna Taylor",
  },
];

const getStatusTag = (status) => {
  let color = "default";
  if (status === "Approved") color = "green";
  if (status === "Pending approval") color = "orange";

  return (
    <Tag color={color} className="rounded-full px-3 py-1 font-medium">
      {status}
    </Tag>
  );
};

const ExamManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = 50; // để giống text "Showing 1–05 of 50"

  const columns = [
    {
      title: "Exam Name",
      dataIndex: "examName",
      key: "examName",
      sorter: (a, b) => a.examName.localeCompare(b.examName),
      render: (text) => <span className="text-gray-900">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: getStatusTag,
    },
    {
      title: "Creator",
      dataIndex: "creator",
      key: "creator",
      align: "center",
      sorter: (a, b) => a.creator.localeCompare(b.creator),
    },
    {
      title: "Creation Day",
      dataIndex: "creationDay",
      key: "creationDay",
      align: "center",
      sorter: (a, b) => new Date(a.creationDay) - new Date(b.creationDay),
    },
    {
      title: "Update Date",
      dataIndex: "updateDate",
      key: "updateDate",
      align: "center",
      sorter: (a, b) => new Date(a.updateDate) - new Date(b.updateDate),
    },
    {
      title: "Updater",
      dataIndex: "updater",
      key: "updater",
      align: "center",
      sorter: (a, b) => a.updater.localeCompare(b.updater),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            type="text"
            className="text-blue-600 hover:!text-blue-800"
            onClick={() => console.log("Edit exam:", record.key)}
          />
          <Button
            icon={<DeleteOutlined />}
            type="text"
            className="text-red-600 hover:!text-red-800"
            onClick={() => console.log("Delete exam:", record.key)}
          />
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "#F4F6F8",
            headerColor: "#637381",
            headerBorderRadius: 0,
            fontSize: 14,
            cellPaddingBlock: 12,
          },
          Button: {
            borderRadius: 999,
            controlHeight: 40,
          },
        },
      }}
    >
      <div className="min-h-screen pb-20 p-8 bg-[#F4F6F8]">
        {/* Page Header */}
        <div className="mb-6">
          <Text className="text-gray-500 text-sm block mb-1">Exam</Text>
          <div className="flex justify-between items-center">
            <div>
              <Title level={3} className="!mb-1 font-bold text-gray-900">
                Exam List
              </Title>
              <Text className="text-gray-500 text-base">
                View Exam Information
              </Text>
            </div>

            <Button
              type="default"
              className="!bg-white text-gray-800 font-medium px-6 rounded-full h-10 !border border-gray-300 shadow-sm"
              onClick={() => console.log("Create New Exam")}
            >
              Create Exam
            </Button>
          </div>
        </div>

        {/* Card: Filter + Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Filter row giống hình (All Name, All Status, Search) */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b border-gray-100">
            <Space size="middle" wrap>
              <Select
                defaultValue="All Name"
                className="min-w-[160px] h-9"
                size="middle"
              >
                <Option value="All Name">All Name</Option>
                <Option value="Academic">Academic</Option>
                <Option value="Practice">Practice</Option>
              </Select>

              <Select
                defaultValue="All Status"
                className="min-w-[160px] h-9"
                size="middle"
              >
                <Option value="All Status">All Status</Option>
                <Option value="Approved">Approved</Option>
                <Option value="Pending approval">Pending approval</Option>
              </Select>
            </Space>

            <Input
              placeholder="Search exam..."
              prefix={<SearchOutlined className="text-gray-400 mr-2" />}
              className="w-full sm:w-64 h-9 rounded-full"
            />
          </div>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={initialExamData.slice(
              (currentPage - 1) * pageSize,
              currentPage * pageSize
            )}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalItems,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              showTotal: (total, range) =>
                `Showing ${String(range[0]).padStart(2, "0")}-${String(
                  range[1]
                ).padStart(2, "0")} of ${total}`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            size="middle"
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default ExamManagement;
