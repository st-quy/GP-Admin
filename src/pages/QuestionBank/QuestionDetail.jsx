import React from "react";
import {
  Card,
  Tag,
  Button,
  Typography,
  Breadcrumb,
  Avatar,
  Divider,
  Space
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  InfoCircleFilled,
  FileTextFilled,
  AudioOutlined,
  CheckCircleFilled,
  CalendarOutlined,
  UserOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const QuestionDetail = () => {
  const navigate = useNavigate();

  // Mock Data giống trong hình
  const questionData = {
    id: "QST-2025-0847",
    name: "Academic Listening Test – Lectures and Discussions",
    type: "Multiple Choice",
    skill: "Listening",
    part: "Part 1",
    creator: { name: "Anna", avatar: "https://i.pravatar.cc/150?u=anna" },
    updater: { name: "John", avatar: "https://i.pravatar.cc/150?u=john" },
    createdDate: "11/12/2025 09:00",
    updatedDate: "15/11/2025 11:00",
    content: "What is the main topic of the lecture?",
    options: [
      { key: "A", text: "The history of ancient Greece", isCorrect: false },
      { key: "B", text: "The development of modern architecture", isCorrect: true },
      { key: "C", text: "The role of art in politics", isCorrect: false },
      { key: "D", text: "The evolution of language", isCorrect: false },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-6 font-['Inter']">
      {/* --- Breadcrumb --- */}
      <div className="mb-2">
        <Breadcrumb
          items={[
            { title: "Question Bank", className: "cursor-pointer", onClick: () => navigate("/question-bank") },
            { title: "Question Detail" },
          ]}
          className="text-gray-500"
        />
      </div>

      {/* --- Header --- */}
      <div className="mb-6">
        <Title level={2} className="!m-0 text-[#111827] font-bold">
          Question Information
        </Title>
        <Text className="text-gray-500">
          View detailed information about this question.
        </Text>
      </div>

      {/* --- General Information Card --- */}
      <Card className="mb-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <InfoCircleFilled className="text-[#003087] text-xl" />
          <Title level={4} className="!m-0 text-[#111827]">
            General Information
          </Title>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <Text className="block text-gray-500 text-sm mb-1">Question ID</Text>
              <Text className="font-bold text-[#111827]">{questionData.id}</Text>
            </div>
            <div>
              <Text className="block text-gray-500 text-sm mb-1">Question Name</Text>
              <Text className="font-bold text-[#111827]">{questionData.name}</Text>
            </div>
            <div>
              <Text className="block text-gray-500 text-sm mb-1">Question Type</Text>
              <Text className="font-bold text-[#111827]">{questionData.type}</Text>
            </div>
            <div>
              <Text className="block text-gray-500 text-sm mb-1">Updater</Text>
              <div className="flex items-center gap-2">
                <Avatar src={questionData.updater.avatar} size="small" icon={<UserOutlined />} />
                <Text className="font-bold text-[#111827]">{questionData.updater.name}</Text>
              </div>
            </div>
            <div>
              <Text className="block text-gray-500 text-sm mb-1">Updated Date</Text>
              <div className="flex items-center gap-2 text-[#111827] font-bold">
                 <CalendarOutlined className="text-gray-400" />
                 {questionData.updatedDate}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <Text className="block text-gray-500 text-sm mb-1">Skill</Text>
              <Tag color="blue" className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 border-none font-medium flex w-fit items-center gap-2">
                 <AudioOutlined /> {questionData.skill}
              </Tag>
            </div>
            <div>
              <Text className="block text-gray-500 text-sm mb-1">Part</Text>
              <Text className="text-gray-500">{questionData.part}</Text>
            </div>
            <div>
              <Text className="block text-gray-500 text-sm mb-1">Creator</Text>
              <div className="flex items-center gap-2">
                <Avatar src={questionData.creator.avatar} size="small" icon={<UserOutlined />} />
                <Text className="font-bold text-[#111827]">{questionData.creator.name}</Text>
              </div>
            </div>
            <div>
              <Text className="block text-gray-500 text-sm mb-1">Created Date</Text>
              <div className="flex items-center gap-2 text-[#111827] font-bold">
                 <CalendarOutlined className="text-gray-400" />
                 {questionData.createdDate}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* --- Question Content Card --- */}
      <Card className="rounded-xl shadow-sm border border-gray-100 mb-10">
        <div className="flex items-center gap-2 mb-6">
          <FileTextFilled className="text-[#003087] text-xl" />
          <Title level={4} className="!m-0 text-[#111827]">
            Question Content
          </Title>
        </div>

        {/* Content Box */}
        <div className="bg-[#FAFAFA] border border-gray-200 rounded-lg p-6 mb-6">
          <Text className="text-[#111827] text-base font-medium">
            {questionData.content}
          </Text>
        </div>

        {/* Answer Options */}
        <div className="mb-4">
             <Text className="text-[#111827] font-bold mb-4 block">Answer Options</Text>
             <div className="space-y-3">
                {questionData.options.map((option) => (
                    <div 
                        key={option.key}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                            option.isCorrect 
                            ? "bg-[#F0FDF4] border-[#22AD5C]" // Correct style
                            : "bg-[#FAFAFA] border-transparent" // Normal style
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                option.isCorrect ? "bg-[#22AD5C] text-white" : "bg-[#E5E7EB] text-gray-500"
                            }`}>
                                {option.key}
                            </div>
                            <span className={`font-medium ${option.isCorrect ? "text-[#111827]" : "text-gray-600"}`}>
                                {option.text}
                            </span>
                        </div>
                        {option.isCorrect && (
                            <CheckCircleFilled className="text-[#22AD5C] text-xl" />
                        )}
                    </div>
                ))}
             </div>
        </div>
      </Card>

      {/* --- Footer Buttons --- */}
      <div className="flex justify-center gap-4 pb-10">
        <Button 
            size="large"
            icon={<ArrowLeftOutlined />}
            className="bg-gray-100 border-none text-gray-700 hover:bg-gray-200 rounded-lg px-6 h-[48px] font-medium"
            onClick={() => navigate("/question-bank")}
        >
            Back to Question List
        </Button>
        <Button 
            type="primary"
            size="large"
            icon={<EditOutlined />}
            className="bg-[#003087] hover:bg-[#002566] rounded-lg px-6 h-[48px] font-medium"
        >
            Edit Question
        </Button>
      </div>
    </div>
  );
};

export default QuestionDetail;