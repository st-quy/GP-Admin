import React, { useState } from 'react';
import { Input, Select, Button, Upload, message } from 'antd';
import { 
  DeleteOutlined, 
  PlusOutlined, 
  CloudUploadOutlined 
} from '@ant-design/icons';

const { TextArea } = Input;
const { Dragger } = Upload;

const CreateSpeaking = () => {
  const [questions, setQuestions] = useState([
    { id: 1, value: '' },
    { id: 2, value: '' },
    { id: 3, value: '' }
  ]);
  const addQuestion = () => {
    const newId = questions.length > 0 ? questions[questions.length - 1].id + 1 : 1;
    setQuestions([...questions, { id: newId, value: '' }]);
  };

  const removeQuestion = (id) => {
    const newQuestions = questions.filter(q => q.id !== id);
    setQuestions(newQuestions);
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    action: 'https://run.mocky.io/v3/435ba68c-13a3-4aec-a98f-5369e871a63d', // API upload giả lập
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-blue-900">🧩</span> Part Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
            <Input placeholder="e.g., Part 1: Short Conversations" size="large" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Type <span className="text-red-500">*</span></label>
            <Select 
              placeholder="Choose part type" 
              size="large"
              options={[
                { value: 'part1', label: 'Part 1' },
                { value: 'part2', label: 'Part 2' },
                { value: 'part3', label: 'Part 3' },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">Instruction</label>
          <TextArea rows={4} placeholder="e.g., Questions 1-5" />
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-blue-900">list</span> Question List
        </h3>

        <div className="flex flex-col gap-4">
          {questions.map((q, index) => (
            <div key={q.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold flex-shrink-0">
                {index + 1}
              </div>
              <Input placeholder="Enter question name" size="large" />
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                className="text-gray-400 hover:text-red-500"
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
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-blue-900">📎</span> Media Attachments
        </h3>
        
        <p className="font-medium text-gray-700 mb-2">Image File</p>
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
            <Dragger {...uploadProps} style={{ background: 'transparent', border: 'none' }}>
                <p className="ant-upload-drag-icon">
                <CloudUploadOutlined style={{ color: '#9CA3AF', fontSize: '48px' }} />
                </p>
                <p className="text-gray-600 font-medium text-lg">Upload image file</p>
                <p className="text-gray-400 mb-4">Drag and drop your image here or click to browse</p>
                <Button size="large" className="bg-white border-blue-900 text-blue-900 font-medium">
                    Choose File
                </Button>
            </Dragger>
            <p className="text-gray-400 text-xs mt-4 text-center">Supported formats: .jpg, .png, .jpeg (Max size: 10MB)</p>
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-4">
        <Button size="large" className="min-w-[100px]">Cancel</Button>
        <Button size="large" className="min-w-[140px] border-blue-900 text-blue-900">Preview Question</Button>
        <Button type="primary" size="large" className="min-w-[140px] bg-blue-900 hover:bg-blue-800">Save Question</Button>
      </div>
    </div>
  );
}

export default CreateSpeaking;