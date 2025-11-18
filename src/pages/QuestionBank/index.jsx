import React, { useState } from "react";
import {
  Typography,
  Button,
  Dropdown,
  Menu,
  Select,
  Input,
  Table,
  Space,
  Tag,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useDebouncedValue } from "@shared/hook/useDebounceValue"; // Reusing the debounce hook

const { Title, Text } = Typography;
const { Option } = Select;

// Mock data based on the Figma design
const mockData = [
  {
    key: "1",
    questionText: "Academic Listening Test........",
    part: "Part 1",
    skills: "Listening",
    creator: "Anna",
    creationDay: "11/11/2025",
    updateDate: "15/11/2025",
    updater: "Jonh",
  },
  {
    key: "2",
    questionText: "Academic Listening Test........",
    part: "Part 1",
    skills: "Reading",
    creator: "Kyle",
    creationDay: "11/11/2025",
    updateDate: "15/11/2025",
    updater: "David",
  },
  {
    key: "3",
    questionText: "Academic Listening Test........",
    part: "Part 2",
    skills: "Speaking",
    creator: "David",
    creationDay: "11/11/2025",
    updateDate: "15/11/2025",
    updater: "Kyle",
  },
  {
    key: "4",
    questionText: "Academic Listening Test........",
    part: "Part 3",
    skills: "Writing",
    creator: "Tim",
    creationDay: "11/11/2025",
    updateDate: "15/11/2025",
    updater: "Anna",
  },
  // Add more mock data as needed
];

// Mock options for filters
const topicOptions = ["All Topics", "Academic", "General"];
const skillOptions = ["All Skills", "Listening", "Reading", "Speaking", "Writing", "Grammar"];
const partOptions = ["All Part", "Part 1", "Part 2", "Part 3", "Part 4"];

const QuestionBank = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    topic: "All Topics",
    skill: "All Skills",
    part: "All Part",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: mockData.length,
  });

  // Debounce search term
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 500);

  // Handle filter changes
  const handleFilterChange = (key) => (value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // TODO: Add logic to filter data based on `filters` and `debouncedSearchTerm`
  const filteredData = mockData;

  // Handle pagination change
  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  // Define table columns
  const columns = [
    {
      title: "Question Text",
      dataIndex: "questionText",
      key: "questionText",
    },
    {
      title: "Part",
      dataIndex: "part",
      key: "part",
    },
    {
      title: "Skills",
      dataIndex: "skills",
      key: "skills",
      render: (skill) => {
        let color = "blue";
        if (skill === "Reading") color = "green";
        if (skill === "Speaking") color = "purple";
        if (skill === "Writing") color = "orange";
        if (skill === "Grammar") color = "geekblue";
        return <Tag color={color}>{skill}</Tag>;
      },
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
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" icon={<DeleteOutlined />} danger />
        </Space>
      ),
    },
  ];

  // Menu for Create Question dropdown
  const createQuestionMenu = (
    <Menu>
      <Menu.Item key="speaking">Speaking</Menu.Item>
      <Menu.Item key="listening">Listening</Menu.Item>
      <Menu.Item key="reading">Reading</Menu.Item>
      <Menu.Item key="writing">Writing</Menu.Item>
      <Menu.Item key="grammar">Grammar</Menu.Item>
    </Menu>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="!mb-1">
            Question List
          </Title>
          <Text className="text-gray-500">View Question Information</Text>
        </div>
        <Space>
          <Button
            type="primary"
            className="bg-green-600 hover:bg-green-700 border-green-600"
          >
            Add questions from Excel
          </Button>
          <Dropdown overlay={createQuestionMenu}>
            <Button type="primary" className="bg-primaryColor">
              Create Question <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      </div>

      {/* Filter Bar */}
      <div className="p-6 bg-white rounded-lg shadow-sm mb-6">
        <Space wrap size="large" className="w-full">
          <div>
            <Text className="block mb-2">Topic</Text>
            <Select
              value={filters.topic}
              onChange={handleFilterChange("topic")}
              style={{ width: 200 }}
            >
              {topicOptions.map((topic) => (
                <Option key={topic} value={topic}>
                  {topic}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Text className="block mb-2">Skill</Text>
            <Select
              value={filters.skill}
              onChange={handleFilterChange("skill")}
              style={{ width: 200 }}
            >
              {skillOptions.map((skill) => (
                <Option key={skill} value={skill}>
                  {skill}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Text className="block mb-2">Part</Text>
            <Select
              value={filters.part}
              onChange={handleFilterChange("part")}
              style={{ width: 200 }}
            >
              {partOptions.map((part) => (
                <Option key={part} value={part}>
                  {part}
                </Option>
              ))}
            </Select>
          </div>
          <div className="flex-grow">
            <Text className="block mb-2">Search</Text>
            <Input
              placeholder="Search question..."
              value={searchTerm}
              onChange={handleSearchChange}
              suffix={<SearchOutlined className="text-gray-400" />}
              style={{ width: "100%", minWidth: 250 }}
            />
          </div>
        </Space>
      </div>

      {/* Question Table */}
      <Table
        columns={columns}
        dataSource={filteredData} // Use filteredData here
        pagination={{
          ...pagination,
          showTotal: (total, range) =>
            `Showing ${range[0]}-${range[1]} of ${total}`,
        }}
        onChange={handleTableChange}
        // loading={isLoading} // Add loading state
        rowClassName="bg-white"
        className="shadow-sm"
      />
    </div>
  );
};

export default QuestionBank;