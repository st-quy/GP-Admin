import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
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
  PlusCircleOutlined,
} from "@ant-design/icons";
import HeaderInfo from "@app/components/HeaderInfo";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

// Sample Data (will be replaced by hooks later)
const initialExamData = [
  {
    key: "1",
    examName: "Academic Test A",
    status: "Grading",
    creator: "Anna",
    creationDay: "11/11/2025",
    updateDate: "15/11/2025",
    updater: "Jonh",
    selected: true,
  },
  {
    key: "2",
    examName: "Academic Test B",
    status: "Grading",
    creator: "Kyle",
    creationDay: "11/11/2025",
    updateDate: "15/11/2025",
    updater: "David",
    selected: true,
  },
  {
    key: "3",
    examName: "Academic Test C",
    status: "Complete",
    creator: "David",
    creationDay: "11/11/2025",
    updateDate: "15/11/2025",
    updater: "Kyle",
    selected: false,
  },
  {
    key: "4",
    examName: "Academic Test D",
    status: "Grading",
    creator: "Tim",
    creationDay: "11/11/2025",
    updateDate: "15/11/2025",
    updater: "Anna",
    selected: true,
  },
  {
    key: "5",
    examName: "Practice Test E",
    status: "Complete",
    creator: "Sarah",
    creationDay: "10/11/2025",
    updateDate: "10/11/2025",
    updater: "Sarah",
    selected: false,
  },
];

const getStatusTag = (status) => {
  let color = "blue";
  switch (status) {
    case "Complete":
      color = "green";
      break;
    case "Grading":
      color = "orange";
      break;
    case "Draft":
      color = "default";
      break;
    default:
      color = "default";
  }
  return (
    <Tag color={color} className="rounded-full px-3 py-1 font-medium">
      {status}
    </Tag>
  );
};

const ExamManagement = () => {
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState(
    initialExamData.filter((d) => d.selected).map((d) => d.key)
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Total hardcoded to 50 for visualization consistency with the image
  const totalItems = 50;

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const columns = [
    {
      title: "EXAM NAME",
      dataIndex: "examName",
      key: "examName",
      sorter: (a, b) => a.examName.localeCompare(b.examName),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: getStatusTag,
    },
    {
      title: "CREATOR",
      dataIndex: "creator",
      key: "creator",
      align: "center",
      sorter: (a, b) => a.creator.localeCompare(b.creator),
    },
    {
      title: "CREATION DAY",
      dataIndex: "creationDay",
      key: "creationDay",
      align: "center",
      sorter: (a, b) => new Date(a.creationDay) - new Date(b.creationDay),
    },
    {
      title: "UPDATE DATE",
      dataIndex: "updateDate",
      key: "updateDate",
      align: "center",
      sorter: (a, b) => new Date(a.updateDate) - new Date(b.updateDate),
    },
    {
      title: "UPDATER",
      dataIndex: "updater",
      key: "updater",
      align: "center",
      sorter: (a, b) => a.updater.localeCompare(b.updater),
    },
    {
      title: "ACTION",
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
            headerBg: "#E8F1FF",
            headerColor: "#637381",
            headerBorderRadius: 8,
            fontSize: 14,
            cellPaddingBlock: 12,
          },
          Button: {
            borderRadius: 50,
            controlHeight: 50,
          },
        },
      }}
    >

      <div className="p-6">
        <div>
          <HeaderInfo
            title="Exam List"
            subtitle="Manage and track all your English exams"
            btnText="Create New Exam"
            btnIcon={<></>}
            SubAction={
              ""
            }
            onClick={() => navigate("/exam/create")}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <div>
              <Text className="text-xs text-gray-500 block mb-2">Skill</Text>
              <Select defaultValue="All Skills" className="w-full h-10">
                <Option value="All Skills">All Skills</Option>
                <Option value="Listening">Listening</Option>
                <Option value="Reading">Reading</Option>
                <Option value="Speaking">Speaking</Option>
                <Option value="Writing">Writing</Option>
              </Select>
            </div>

            <div>
              <Text className="text-xs text-gray-500 block mb-2">Level</Text>
              <Select defaultValue="All Level" className="w-full h-10">
                <Option value="All Level">All Level</Option>
                <Option value="A1">A1</Option>
                <Option value="B1">B1</Option>
                <Option value="C1">C1</Option>
              </Select>
            </div>

            <div className="lg:col-span-1">
              <Text className="text-xs text-gray-500 block mb-2">Search</Text>
              <Input
                placeholder="Search question..."
                prefix={<SearchOutlined className="text-gray-400 mr-2" />}
                className="w-full h-10 rounded-lg"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="default"
                className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 w-full h-10 hover:border-gray-500"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-200 rounded-xl mt-8 shadow-sm overflow-hidden">
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={initialExamData.slice(
              (currentPage - 1) * pageSize,
              currentPage * pageSize
            )} // Slice data for current page
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalItems, // Use hardcoded total for visual effect
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              showTotal: (total, range) => `Showing ${String(range[0]).padStart(2, '0')}-${String(range[1]).padStart(2, '0')} of ${total}`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            scroll={{ x: 800 }}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default ExamManagement;