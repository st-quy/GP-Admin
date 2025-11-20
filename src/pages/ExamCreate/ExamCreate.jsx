import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Form, Input, Tabs, Space } from "antd";
import HeaderInfo from "@app/components/HeaderInfo";
import TableQuestion from "@features/examCreate/ui/TableQuestion";
import "./ExamCreate.css";

const skillTabs = ["Speaking", "Listening", "Reading", "Writing", "Grammar"];

export default function ExamCreate() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("introduce");
  const [currentSkill, setCurrentSkill] = useState("Speaking");
  const [currentPart, setCurrentPart] = useState(1);
  const [showQuestionBank, setShowQuestionBank] = useState(false);

  const [introduceBySkillPart, setIntroduceBySkillPart] = useState(
    skillTabs.reduce((acc, skill) => {
      acc[skill] = {};
      return acc;
    }, {})
  );

  const [selectedQuestionsBySkill, setSelectedQuestionsBySkill] = useState(
    skillTabs.reduce((acc, skill) => {
      acc[skill] = {};
      return acc;
    }, {})
  );

  useEffect(() => {
    const intro = introduceBySkillPart[currentSkill]?.[currentPart] || {
      structure: "",
      description: "",
    };

    const content =
      selectedQuestionsBySkill[currentSkill]?.[currentPart]?.map((q) => q.question) || [];

    form.setFieldsValue({
      parts: {
        [currentPart]: {
          structure: intro.structure,
          description: intro.description,
          content,
        },
      },
    });
  }, [currentSkill, currentPart]);

  const handleChangeSkill = (skill) => {
    setCurrentSkill(skill);
    setCurrentPart(1);
    setActiveTab("introduce");
  };

  const handleChangePart = (newPart) => {
    setCurrentPart(newPart);
    setActiveTab("introduce");
  };


  const selectedQuestions = selectedQuestionsBySkill[currentSkill]?.[currentPart] || [];
  const currentIntroduce = introduceBySkillPart[currentSkill]?.[currentPart] || {
    structure: "",
    description: "",
  };

  const items = [
    {
      key: "introduce",
      label: "Introduce",
      children: (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Form.Item label="Test Structure">
            <Input.TextArea
              rows={12}
              value={currentIntroduce.structure}
              placeholder="Enter test structure"
              onChange={(e) => {
                const value = e.target.value;
                setIntroduceBySkillPart((prev) => ({
                  ...prev,
                  [currentSkill]: {
                    ...prev[currentSkill],
                    [currentPart]: {
                      ...prev[currentSkill]?.[currentPart],
                      structure: value,
                    },
                  },
                }));
              }}
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input.TextArea
              rows={12}
              value={currentIntroduce.description}
              placeholder="Enter description"
              onChange={(e) => {
                const value = e.target.value;
                setIntroduceBySkillPart((prev) => ({
                  ...prev,
                  [currentSkill]: {
                    ...prev[currentSkill],
                    [currentPart]: {
                      ...prev[currentSkill]?.[currentPart],
                      description: value,
                    },
                  },
                }));
              }}
            />
          </Form.Item>
        </Space>
      ),
    },

    {
      key: "content",
      label: "Content",
      children: (
        <>
          <Form.Item label="Questions">
            {selectedQuestions.length > 0 && (
              <ul className="mb-2 border p-2 rounded bg-gray-50 max-h-40 overflow-y-auto">
                {selectedQuestions.map((q) => (
                  <li key={q.id} className="mb-1">
                    {q.question}
                  </li>
                ))}
              </ul>
            )}

            <Button type="primary" onClick={() => setShowQuestionBank(true)}>
              Add question from question bank
            </Button>
          </Form.Item>

          {showQuestionBank && (
            <Card className="mt-4 p-4">
              <h3 className="font-semibold mb-4">Question Bank</h3>

              <TableQuestion
                onSelect={(questions) => {
                  // Lưu vào state chính
                  setSelectedQuestionsBySkill((prev) => ({
                    ...prev,
                    [currentSkill]: {
                      ...prev[currentSkill],
                      [currentPart]: questions,
                    },
                  }));

                  setShowQuestionBank(false);
                }}
              />
            </Card>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="p-6">
      <HeaderInfo
        title="Create New Exam"
        subtitle="Create and customize your exam details"
        btnText="Save Exam"
        btnIcon={<></>}
        SubAction={""}
        onClick={() => navigate("/exam")}
      />

      <div className="pt-4">
        <Card className="mb-2">
          <Form layout="vertical" form={form}>
            <Form.Item label="Name" name="name" rules={[{ required: true }]}>
              <Input placeholder="Enter name of Exam" />
            </Form.Item>
          </Form>
        </Card>
      </div>
      <Card>
        <div className="flex gap-3 mb-6 px-5 justify-between">
          {skillTabs.map((skill) => (
            <button
              key={skill}
              onClick={() => handleChangeSkill(skill)}
              className={`px-5 py-2 rounded border font-bold transition
                ${currentSkill === skill
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
            >
              {skill}
            </button>
          ))}
        </div>

        <h3 className="text-center font-semibold text-lg mb-4">
          Part {currentPart} :
        </h3>

        <div className="flex items-center justify-between mb-4">
          <Button onClick={() => handleChangePart(Math.max(1, currentPart - 1))}>
            {"<"}
          </Button>
          <Button onClick={() => handleChangePart(currentPart + 1)}>
            {">"}
          </Button>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            padding: "20px 24px",
            marginLeft: 20,
            height: "800px",
          }}
        >
          <Tabs activeKey={activeTab}
            onChange={(key) => setActiveTab(key)} items={items} className="custom-inner-tabs" />
        </div>
      </Card>
    </div>
  );
}
