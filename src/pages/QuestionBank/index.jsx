import React, { useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Dropdown,
  Space,
  Typography,
} from "antd";
import {
  SearchOutlined,
  DownOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const mockData = [
  {
    key: "1",
    questionText: "Academic Listening Test Section 1...",
    part: "Part 1",
    skills: "Listening",
    creator: "John Smith",
    creationDay: "2024-01-15",
    updateDate: "2024-01-20",
    updater: "Jane Doe",
  },
  {
    key: "2",
    questionText: "Reading Comprehension Exercise...",
    part: "Part 2",
    skills: "Reading",
    creator: "Sarah Wilson",
    creationDay: "2024-01-14",
    updateDate: "2024-01-19",
    updater: "Mike Johnson",
  },
  {
    key: "3",
    questionText: "Grammar Focus: Present Perfect...",
    part: "Part 1",
    skills: "Grammar",
    creator: "Emily Davis",
    creationDay: "2024-01-13",
    updateDate: "2024-01-18",
    updater: "Tom Brown",
  },
  {
    key: "4",
    questionText: "Speaking Task: Describe a Picture...",
    part: "Part 3",
    skills: "Speaking",
    creator: "Alex Chen",
    creationDay: "2024-01-12",
    updateDate: "2024-01-17",
    updater: "Lisa Wang",
  },
  {
    key: "5",
    questionText: "Writing Exercise: Essay Structure...",
    part: "Part 2",
    skills: "Writing",
    creator: "David Miller",
    creationDay: "2024-01-11",
    updateDate: "2024-01-16",
    updater: "Anna Taylor",
  },
];

const QuestionBank = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  /** @type {import('antd').TableColumnsType<any>} */
  const columns = [
    {
      title: "Question Text",
      dataIndex: "questionText",
      key: "questionText",
      width: "30%",
      render: (text) => <span className="font-medium text-gray-700">{text}</span>,
    },
    {
      title: "Part",
      dataIndex: "part",
      key: "part",
      align: "center",
    },
    {
      title: "Skills",
      dataIndex: "skills",
      key: "skills",
      align: "center",
    },
    {
      title: "Creator",
      dataIndex: "creator",
      key: "creator",
    },
    {
      title: "Creation Day",
      dataIndex: "creationDay",
      key: "creationDay",
    },
    {
      title: "Update Date",
      dataIndex: "updateDate",
      key: "updateDate",
    },
    {
      title: "Updater",
      dataIndex: "updater",
      key: "updater",
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-600" />}
            className="flex items-center justify-center"
          />
          <Button
            type="text"
            icon={<DeleteOutlined className="text-red-500" />}
            className="flex items-center justify-center"
            danger
          />
        </Space>
      ),
    },
  ];

  const createItems = [
    { key: "1", label: "Speaking" },
    { key: "2", label: "Listening" },
    { key: "3", label: "Reading" },
    { key: "4", label: "Writing" },
    { key: "5", label: "Grammar" },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
  };

  const tableComponents = {
    header: {
      cell: (props) => (
        <th
          {...props}
          className="bg-[#F9FAFB] text-gray-600 font-semibold py-3 px-4 border-b border-gray-200 text-xs uppercase tracking-wider"
          style={{ ...props.style, backgroundColor: "#F9FAFB" }}
        />
      ),
    },
  };

  return (
    <div className="p-8 min-h-screen bg-[#f9fafb]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Text className="text-gray-500 block text-xs mb-1 uppercase tracking-wide">
            Question Bank
          </Text>
          <Title level={2} className="!m-0 !font-bold text-gray-900">
            Question List
          </Title>
          <Text className="text-gray-500">View Question Information</Text>
        </div>

        <Space size="middle">
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            className="bg-[#10B981] hover:!bg-[#059669] border-[#10B981] h-[40px] px-4 rounded-md font-medium shadow-sm flex items-center"
          >
            Add questions from Excel
          </Button>

          <Dropdown menu={{ items: createItems }} trigger={["click"]}>
            <Button className="h-[40px] px-4 rounded-md font-medium border-gray-300 bg-white text-gray-700 hover:text-blue-600 hover:border-blue-600 flex items-center shadow-sm">
              Create Question <DownOutlined className="text-xs ml-2" />
            </Button>
          </Dropdown>
        </Space>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <Select
              defaultValue="All Topics"
              className="w-full sm:w-[160px] h-[38px]"
              options={[{ value: "All Topics", label: "All Topics" }]}
              bordered={true}
            />
            <Select
              defaultValue="All Skills"
              className="w-full sm:w-[160px] h-[38px]"
              options={[{ value: "All Skills", label: "All Skills" }]}
              bordered={true}
            />
            <Select
              defaultValue="All Part"
              className="w-full sm:w-[160px] h-[38px]"
              options={[{ value: "All Part", label: "All Part" }]}
              bordered={true}
            />
          </div>

          <div className="w-full lg:w-[320px]">
            <Input
              placeholder="Search question..."
              prefix={<SearchOutlined className="text-gray-400 mr-1" />}
              className="h-[38px] rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={mockData}
          components={tableComponents}
          pagination={{
            total: 50,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: false,
            showTotal: (total, range) => (
              <span className="text-gray-500">
                Showing {range[0]}-{range[1]} of {total}
              </span>
            ),
            className: "px-6 py-4 flex justify-between items-center",
          }}
        />
      </div>
    </div>
  );
};

export default QuestionBank;