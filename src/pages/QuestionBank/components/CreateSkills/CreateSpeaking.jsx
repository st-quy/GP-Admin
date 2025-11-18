// @ts-nocheck
import React, { useState } from 'react';
import { Input, Select, Button, Upload, message, Form } from 'antd';
import { DeleteOutlined, PlusOutlined, CloudUploadOutlined } from '@ant-design/icons';

import { yupSync } from '@shared/lib/utils';
import { createSpeakingSchema } from '@pages/QuestionBank/schemas/createSpeakingSchema';

const { TextArea } = Input;
const { Dragger } = Upload;

const CreateSpeaking = () => {
  const [form] = Form.useForm();

  const [questions, setQuestions] = useState([
    { id: 1, value: '' },
    { id: 2, value: '' },
    { id: 3, value: '' }
  ]);

  const addQuestion = () => {
    const newId = questions.length > 0 ? questions[questions.length - 1].id + 1 : 1;
    const newList = [...questions, { id: newId, value: '' }];
    setQuestions(newList);
    form.setFieldsValue({ questions: newList });
  };

  const removeQuestion = (id) => {
    const newList = questions.filter(q => q.id !== id);
    setQuestions(newList);
    form.setFieldsValue({ questions: newList });
  };

  const updateQuestionValue = (id, newValue) => {
    const updated = questions.map(q => (q.id === id ? { ...q, value: newValue } : q));
    setQuestions(updated);
    form.setFieldsValue({ questions: updated });
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    action: 'https://run.mocky.io/v3/435ba68c-13a3-4aec-a98f-5369e871a63d',
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload failed`);
      }
    },
  };

  const handleSubmit = () => {
    form.validateFields()
      .then((values) => {
        console.log("🔥 Submit values:", values);
        message.success("Saved successfully!");
      })
      .catch((err) => console.log("❌ Validation error:", err));
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Form form={form} initialValues={{ questions }} layout='vertical'>

        {/* PART INFO */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-blue-900">🧩</span> Part Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="partName"
              label="Name"
              rules={[yupSync(createSpeakingSchema)]}
              required
            >
              <Input placeholder="e.g., Part 1: Short Conversations" size="large" />
            </Form.Item>

            <Form.Item
              name="partType"
              label="Type"
              rules={[yupSync(createSpeakingSchema)]}
              required
            >
              <Select
                placeholder="Choose part type"
                size="large"
                options={[
                  { value: 'part1', label: 'Part 1' },
                  { value: 'part2', label: 'Part 2' },
                  { value: 'part3', label: 'Part 3' },
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Intrucstion"
            rules={[yupSync(createSpeakingSchema)]}
            required
          >
            <TextArea rows={4} placeholder="e.g., Questions 1-5" />
          </Form.Item>
        </div>

        {/* QUESTIONS LIST */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-blue-900">📃</span> Question List
          </h3>

          <div className="flex flex-col gap-4">
            {questions.map((q, index) => (
              <div key={q.id} className="flex items-center gap-3">

                <Form.Item
                  name={['questions', index, 'value']}
                  rules={[yupSync(createSpeakingSchema)]}
                  className="flex-1"
                >
                  <Input
                    value={q.value}
                    onChange={(e) => updateQuestionValue(q.id, e.target.value)}
                    placeholder="Enter question name"
                    size="large"
                  />
                </Form.Item>

                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => removeQuestion(q.id)}
                />
              </div>
            ))}

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addQuestion}
              className="w-48 mt-2 border-blue-900 text-blue-900 font-medium"
              size="large"
            >
              Add More Question
            </Button>
          </div>
        </div>

        {/* MEDIA */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-blue-900">📎</span> Media Attachments
          </h3>

          <Form.Item
            name="image"
            rules={[yupSync(createSpeakingSchema)]}
          >
            <Dragger {...uploadProps} style={{ background: "transparent", border: "none" }}>
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined style={{ color: "#9CA3AF", fontSize: "48px" }} />
              </p>
              <p className="text-gray-600 font-medium text-lg">Upload image file</p>
              <p className="text-gray-400 mb-4">Supports JPG, PNG (max 10 MB)</p>

              <Button
                size="large"
                className="bg-white border-blue-900 text-blue-900 font-medium"
              >
                Choose File
              </Button>
            </Dragger>
          </Form.Item>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-4 mt-4">
          <Button size="large" className="min-w-[100px]">Cancel</Button>
          <Button size="large" className="min-w-[140px] border-blue-900 text-blue-900">Preview</Button>
          <Button
            type="primary"
            size="large"
            className="min-w-[140px] bg-blue-900 hover:bg-blue-800"
            onClick={handleSubmit}
          >
            Save Question
          </Button>
        </div>

      </Form>
    </div>
  );
};

export default CreateSpeaking;
