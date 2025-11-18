import React, { useState } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Typography,
  Space,
  Pagination,
  Card,
  Dropdown,
} from "antd";
import {
  FileExcelOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import HeaderInfo from "@app/components/HeaderInfo";
import useConfirm from "@shared/hook/useConfirm"; // 👈 Import hook useConfirm

const { Text } = Typography;
const { Option } = Select;

const QuestionBank = () => {
  const navigate = useNavigate();
  // 👈 Gọi hook useConfirm
  const { openConfirmModal, ModalComponent } = useConfirm(); 

  // 1. Mock Data
  const dataSource = [
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

  // State quản lý phân trang và tìm kiếm
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Hàm xử lý khi nhấn nút Xóa, hiển thị modal xác nhận
  const handleDeleteQuestion = (record) => {
    openConfirmModal({
      title: "Are you sure you want to delete this question?",
      message: "After deleting this question it will no longer appear.",
      okText: "Delete",
      okButtonColor: "#FF4D4F", // Màu đỏ cho nút Delete
      onConfirm: () => {
        // 🚨 THAY THẾ BẰNG LOGIC XÓA THỰC TẾ CỦA BẠN 
        console.log(`Deleting question with key: ${record.key}`);
        // Ví dụ: gọi API xóa ở đây
        // deleteQuestionMutation.mutate(record.key);
      },
    });
  };

  // 2. Định nghĩa Columns
  const columns = [
    {
      title: "Question Text",
      dataIndex: "questionText",
      key: "questionText",
      width: "30%",
      render: (text) => (
        <span className="font-semibold text-[#1F2937]">{text}</span>
      ),
    },
    {
      title: "Part",
      dataIndex: "part",
      key: "part",
      align: "center",
      render: (text) => <span className="text-gray-500">{text}</span>,
    },
    {
      title: "Skills",
      dataIndex: "skills",
      key: "skills",
      align: "center",
      // Đã cập nhật: Hiển thị text thường giống các cột khác
      render: (text) => <span className="text-gray-500">{text}</span>,
    },
    {
      title: "Creator",
      dataIndex: "creator",
      key: "creator",
      render: (text) => <span className="text-gray-500">{text}</span>,
    },
    {
      title: "Creation Day",
      dataIndex: "creationDay",
      key: "creationDay",
      render: (text) => <span className="text-gray-500">{text}</span>,
    },
    {
      title: "Update Date",
      dataIndex: "updateDate",
      key: "updateDate",
      render: (text) => <span className="text-gray-500">{text}</span>,
    },
    {
      title: "Updater",
      dataIndex: "updater",
      key: "updater",
      render: (text) => <span className="text-gray-500">{text}</span>,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            className="text-[#1890FF] hover:bg-blue-50 px-2"
            icon={<EditOutlined />}
            // Sự kiện chuyển hướng đến trang chi tiết
            onClick={() => navigate(`/question-bank/${record.key}`)}
          />
          <Button
            type="text"
            className="text-[#FF4D4F] hover:bg-red-50 px-2"
            icon={<DeleteOutlined />}
            // 👈 Sử dụng hàm xóa đã định nghĩa
            onClick={() => handleDeleteQuestion(record)}
          />
        </Space>
      ),
    },
  ];

  // Style tùy chỉnh cho Header Table
  const tableComponents = {
    header: {
      cell: (props) => (
        <th
          {...props}
          className="bg-white text-[#111827] font-bold border-b border-gray-200 py-4"
        />
      ),
    },
  };

  const items = [
    {
      label: "Speaking",
      key: "speaking",
    },
    {
      label: "Reading",
      key: "reading",
    },
    {
      label: "Writing",
      key: "writing",
    },
    { label: "Listening", key: "listening" },
    { label: "Grammar", key: "grammar" },
  ];

  return (
    <>
      {/* 👈 Component Modal được render ở đây */}
      <ModalComponent /> 
      <HeaderInfo
        title="Question List"
        subtitle="View Question Information"
        btnText="Add questions from Excel"
        btnIcon={<FileExcelOutlined />}
        SubAction={
          <Dropdown menu={{ items, onClick: (e) => navigate(`create/${e.key}`) }} >
              <Button className="w-full p-5" icon={<DownOutlined />} iconPosition="end" >
                Create Question
              </Button>
          </Dropdown>
        }
      />
      <div className="p-4 ">
        {/* --- Main Content Card --- */}
        <Card className="shadow-sm rounded-xl ">
          {/* Filter Bar */}
          <div className="p-4 flex flex-col lg:flex-row justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              <Select
                defaultValue="All Topics"
                size="large"
                className="w-[160px]"
                bordered={true}
              >
                <Option value="All Topics">All Topics</Option>
              </Select>

              <Select
                defaultValue="All Skills"
                size="large"
                className="w-[160px]"
              >
                <Option value="All Skills">All Skills</Option>
                <Option value="Listening">Listening</Option>
                <Option value="Reading">Reading</Option>
                <Option value="Writing">Writing</Option>
                <Option value="Speaking">Speaking</Option>
              </Select>

              <Select
                defaultValue="All Part"
                size="large"
                className="w-[160px]"
              >
                <Option value="All Part">All Part</Option>
                <Option value="Part 1">Part 1</Option>
                <Option value="Part 2">Part 2</Option>
                <Option value="Part 3">Part 3</Option>
              </Select>
            </div>

            <div className="w-full lg:w-[300px]">
              <Input
                size="large"
                placeholder="Search question..."
                prefix={<SearchOutlined className="text-gray-400" />}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={dataSource}
            components={tableComponents}
            pagination={false}
            rowClassName="hover:bg-gray-50"
          />

          {/* Custom Pagination Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center p-6 border-t border-gray-100">
            <Text className="text-gray-500">Showing 1–05 of 50</Text>

            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Pagination
                defaultCurrent={1}
                total={50}
                pageSize={5}
                showSizeChanger={false}
                itemRender={(page, type, originalElement) => {
                  if (type === "page") {
                    return (
                      <a
                        className={`flex items-center justify-center min-w-[32px] h-[32px] rounded border ${
                          currentPage === page
                            ? "bg-[#003087] text-white border-[#003087]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#003087] hover:text-[#003087]"
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </a>
                    );
                  }
                  return originalElement;
                }}
              />

              <Select
                defaultValue="10 / pages"
                className="w-[120px]"
                onChange={(val) => setPageSize(parseInt(val))}
              >
                <Option value="10">10 / pages</Option>
                <Option value="20">20 / pages</Option>
                <Option value="50">50 / pages</Option>
              </Select>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default QuestionBank;