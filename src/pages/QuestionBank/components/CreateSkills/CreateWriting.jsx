import React from 'react';
import { Input, Button } from 'antd';

const { TextArea } = Input;

const CreateWriting = () => {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-blue-900">🧩</span> Part Information
        </h3>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
            <Input placeholder="e.g., Part 1: Short Conversations" size="large" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Instruction</label>
            <TextArea rows={3} placeholder="e.g., Questions 1-5" />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-blue-900">❓</span> Question Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
           <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Question Title <span className="text-red-500">*</span></label>
            <TextArea rows={4} placeholder="Enter question title....." />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Words limit <span className="text-red-500">*</span></label>
            <Input placeholder="Enter words limit......" size="large" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Text Box <span className="text-red-500">*</span></label>
            <TextArea rows={6} placeholder="Writing area" />
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

export default CreateWriting;