import React, { useState } from 'react';
import { Input, Select, Button, Upload, message, Radio } from 'antd';
import { 
  DeleteOutlined, 
  PlusOutlined, 
  AudioOutlined,
  FileImageOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Dragger } = Upload;

const CreateGrammarVocab = () => {
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [mcOptions, setMcOptions] = useState([
    { id: 1, label: 'A', value: '' },
    { id: 2, label: 'B', value: '' },
    { id: 3, label: 'C', value: '' },
    { id: 4, label: 'D', value: '' },
  ]);

  const [fillBlankSentences, setFillBlankSentences] = useState([
    {
      id: 1,
      text: 'She has been working here [...] 2010.',
      options: [{ id: 1, label: 'A', value: 'since' }, { id: 2, label: 'B', value: 'for' }],
      correctOptionId: 1
    }
  ]);

  const getNextId = (arr) => arr.length > 0 ? arr[arr.length - 1].id + 1 : 1;
  const getLabel = (index) => String.fromCharCode(65 + index);
  const handleAddMcOption = () => setMcOptions([...mcOptions, { id: getNextId(mcOptions), label: getLabel(mcOptions.length), value: '' }]);
  const handleRemoveMcOption = (id) => setMcOptions(mcOptions.filter(o => o.id !== id).map((o, i) => ({...o, label: getLabel(i)})));

  const uploadProps = {
    name: 'file', multiple: false, showUploadList: false,
    action: 'https://run.mocky.io/v3/435ba68c-13a3-4aec-a98f-5369e871a63d',
    onChange(info) { if (info.file.status === 'done') message.success(`${info.file.name} uploaded.`); }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="text-blue-900">🧩</span> Part Information</h3>
        <div className="flex flex-col gap-4">
          <div><label className="font-medium text-gray-700">Name <span className="text-red-500">*</span></label><Input placeholder="e.g., Part 1: Grammar Usage" size="large" /></div>
          <div><label className="font-medium text-gray-700">Instruction</label><TextArea rows={3} placeholder="e.g., Choose the best answer to complete the sentence." /></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="text-blue-900">❓</span> Question Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div><label className="font-medium text-gray-700">Question Name <span className="text-red-500">*</span></label><Input placeholder="e.g., Q1-Grammar" size="large" /></div>
          <div>
            <label className="font-medium text-gray-700">Question Type <span className="text-red-500">*</span></label>
            <Select value={questionType} onChange={setQuestionType} size="large" className="w-full"
              options={[
                { value: 'multiple-choice', label: 'Multiple Choice' },
                { value: 'fill-in-blank', label: 'Fill in the blank' },
              ]}
            />
          </div>
        </div>
        
        <div className="mb-6">
             <label className="font-medium text-gray-700">Question Text <span className="text-red-500">*</span></label>
             <TextArea rows={4} placeholder="Enter the grammar question or sentence stem..." />
        </div>

        {questionType === 'multiple-choice' && (
          <div className="flex flex-col gap-4">
            <label className="font-medium text-gray-700">Answer Options <span className="text-red-500">*</span></label>
            {mcOptions.map((opt) => (
              <div key={opt.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-blue-50 text-blue-900 font-bold flex items-center justify-center border border-blue-100 flex-shrink-0">{opt.label}</div>
                <Input placeholder={`Enter option ${opt.label}`} size="large" />
                <Button type="text" icon={<DeleteOutlined />} className="text-gray-400 hover:text-red-500" onClick={() => handleRemoveMcOption(opt.id)} />
              </div>
            ))}
            <Button type="text" icon={<PlusOutlined />} onClick={handleAddMcOption} className="w-40 text-blue-900 font-medium justify-start pl-0">Add more option</Button>
            <div className="mt-2"><label className="font-medium text-gray-700">Correct Answer <span className="text-red-500">*</span></label>
            <Select className="w-full mt-1" size="large" placeholder="Select correct answer" options={mcOptions.map(o => ({value: o.id, label: `Option ${o.label}`}))} /></div>
          </div>
        )}

        {questionType === 'fill-in-blank' && (
          <div className="flex flex-col gap-6">
            <Button icon={<PlusOutlined />} size="large" className="w-40 border-blue-900 text-blue-900 font-medium" onClick={() => setFillBlankSentences([...fillBlankSentences, {id: Date.now(), text: '', options: [], correctOptionId: null}])}>Add Sentence</Button>
            {fillBlankSentences.map((sentence, idx) => (
              <div key={sentence.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold">{idx + 1}</div><span className="font-semibold">Sentence Text</span></div>
                <Input className="mb-4" size="large" defaultValue={sentence.text} placeholder="e.g., He is interested [...] learning English." />
                <div className="bg-white p-4 rounded border border-gray-100">
                  <div className="flex justify-between mb-2"><span className="font-semibold text-gray-700">Correct answer:</span><span className="text-blue-600 cursor-pointer">+ Add Option</span></div>
                  {sentence.options.map(opt => (
                    <div key={opt.id} className="flex items-center gap-3 mb-2"><Radio checked={sentence.correctOptionId === opt.id} /><span className="font-medium w-4">{opt.label}.</span><Input size="middle" defaultValue={opt.value} /><CloseOutlined className="text-gray-400 hover:text-red-500" /></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
         <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="text-blue-900">📎</span> Media Attachments</h3>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Dragger {...uploadProps} className="bg-blue-50/50 border-blue-200"><p className="text-center py-6"><AudioOutlined style={{fontSize: 24, color:'#1e3a8a'}} /><br/><span className="font-medium text-gray-700">Upload listening audio file</span></p></Dragger>
             <Dragger {...uploadProps} className="bg-gray-50 border-gray-300"><p className="text-center py-6"><FileImageOutlined style={{fontSize: 24, color:'#1e3a8a'}} /><br/><span className="font-medium text-gray-700">Upload supporting image</span></p></Dragger>
         </div>
      </div>

      <div className="flex justify-end gap-4 mt-4">
        <Button size="large">Cancel</Button>
        <Button className="border-blue-900 text-blue-900" size="large">Preview Question</Button>
        <Button type="primary" size="large" className="bg-blue-900">Save Question</Button>
      </div>
    </div>
  );
}

export default CreateGrammarVocab;