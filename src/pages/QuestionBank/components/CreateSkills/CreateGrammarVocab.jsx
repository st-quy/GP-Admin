import React, { useState } from 'react';
import { Input, Select, Button, Upload, message, Radio, Form } from 'antd';
import { DeleteOutlined, PlusOutlined, AudioOutlined, FileImageOutlined, CloseOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Dragger } = Upload;

const CreateGrammarVocab = () => {
  const [form] = Form.useForm();

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
      text: '',
      options: [
        { id: 1, label: 'A', value: '' },
        { id: 2, label: 'B', value: '' }
      ],
      correctOptionId: null
    }
  ]);

  const getNextId = (arr) => (arr.length > 0 ? arr[arr.length - 1].id + 1 : 1);
  const getLabel = (index) => String.fromCharCode(65 + index);

  /** MULTIPLE CHOICE HANDLERS **/
  const handleAddMcOption = () =>
    setMcOptions([...mcOptions, { id: getNextId(mcOptions), label: getLabel(mcOptions.length), value: '' }]);

  const handleRemoveMcOption = (id) => {
    setMcOptions(
      mcOptions.filter((o) => o.id !== id).map((o, i) => ({ ...o, label: getLabel(i) }))
    );
  };

  const handleMcChange = (id, value) => {
    setMcOptions(mcOptions.map((o) => (o.id === id ? { ...o, value } : o)));
  };

  /** FILL IN BLANK HANDLERS **/
  const handleAddSentence = () => {
    setFillBlankSentences([
      ...fillBlankSentences,
      { id: Date.now(), text: '', options: [{ id: 1, label: 'A', value: '' }, { id: 2, label: 'B', value: '' }], correctOptionId: null }
    ]);
  };

  const handleSentenceChange = (id, value) => {
    setFillBlankSentences(fillBlankSentences.map((s) => (s.id === id ? { ...s, text: value } : s)));
  };

  const handleSentenceOptionChange = (sentenceId, optionId, value) => {
    setFillBlankSentences(
      fillBlankSentences.map((s) =>
        s.id === sentenceId
          ? {
              ...s,
              options: s.options.map((o) => (o.id === optionId ? { ...o, value } : o))
            }
          : s
      )
    );
  };

  /** UPLOAD PROPS **/
  const uploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    action: 'https://run.mocky.io/v3/435ba68c-13a3-4aec-a98f-5369e871a63d',
    onChange(info) {
      if (info.file.status === 'done') message.success(`${info.file.name} uploaded.`);
    }
  };

  /** SUBMIT **/
  const handleSubmit = () => {
    form.validateFields()
      .then((values) => {
        console.log('🔥 Form values:', values);
        message.success('Saved successfully!');
      })
      .catch((err) => console.log('❌ Validation error:', err));
  };

  return (
    <Form form={form} layout="vertical">
      {/* PART INFO */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-blue-900">🧩</span> Part Information
        </h3>
        <Form.Item name="partName" label="Part Name" rules={[{ required: true, message: 'Part name is required' }]}>
          <Input placeholder="e.g., Part 1: Grammar Usage" size="large" />
        </Form.Item>
        <Form.Item name="instruction" label="Instruction" rules={[{ required: true, message: 'Instruction is required' }]}>
          <TextArea rows={3} placeholder="e.g., Choose the best answer to complete the sentence." />
        </Form.Item>
      </div>

      {/* QUESTION DETAILS */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-blue-900">❓</span> Question Details
        </h3>

        <Form.Item name="questionName" label="Question Name" rules={[{ required: true, message: 'Question name is required' }]}>
          <Input placeholder="e.g., Q1-Grammar" size="large" />
        </Form.Item>

        <Form.Item name="questionText" label="Question Text" rules={[{ required: true, message: 'Question text is required' }]}>
          <TextArea rows={4} placeholder="Enter the grammar question or sentence stem..." />
        </Form.Item>

        <Form.Item label="Question Type" rules={[{ required: true, message: 'Question type is required' }]}>
          <Select value={questionType} onChange={setQuestionType} size="large" className="w-full">
            <Select.Option value="multiple-choice">Multiple Choice</Select.Option>
            <Select.Option value="fill-in-blank">Fill in the blank</Select.Option>
          </Select>
        </Form.Item>

        {/* MULTIPLE CHOICE */}
        {questionType === 'multiple-choice' && (
          <div className="flex flex-col gap-4">
            <label className="font-medium text-gray-700">Answer Options</label>
            {mcOptions.map((opt, index) => (
              <Form.Item
                key={opt.id}
                name={['mcOptions', index, 'value']}
                rules={[{ required: true, message: `Option ${opt.label} is required` }]}
                initialValue={opt.value}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-blue-50 text-blue-900 font-bold flex items-center justify-center border border-blue-100">
                    {opt.label}
                  </div>
                  <Input
                    value={opt.value}
                    onChange={(e) => handleMcChange(opt.id, e.target.value)}
                    placeholder={`Enter option ${opt.label}`}
                    size="large"
                  />
                  <Button type="text" icon={<DeleteOutlined />} className="text-gray-400 hover:text-red-500" onClick={() => handleRemoveMcOption(opt.id)} />
                </div>
              </Form.Item>
            ))}
            <Button type="text" icon={<PlusOutlined />} className="w-40 text-blue-900 font-medium justify-start pl-0" onClick={handleAddMcOption}>
              Add more option
            </Button>
          </div>
        )}

        {/* FILL IN THE BLANK */}
        {questionType === 'fill-in-blank' && (
          <div className="flex flex-col gap-6">
            <Button icon={<PlusOutlined />} size="large" className="w-40 border-blue-900 text-blue-900 font-medium" onClick={handleAddSentence}>
              Add Sentence
            </Button>

            {fillBlankSentences.map((s, idx) => (
              <div key={s.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <Form.Item
                  name={['fillBlankSentences', idx, 'text']}
                  rules={[{ required: true, message: 'Sentence text is required' }]}
                  initialValue={s.text}
                >
                  <Input placeholder="Enter sentence text" value={s.text} onChange={(e) => handleSentenceChange(s.id, e.target.value)} className="mb-4" />
                </Form.Item>

                <div className="bg-white p-4 rounded border border-gray-100">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-gray-700">Correct answer:</span>
                    <span className="text-blue-600 cursor-pointer">+ Add Option</span>
                  </div>
                  {s.options.map((o, i) => (
                    <Form.Item
                      key={o.id}
                      name={['fillBlankSentences', idx, 'options', i, 'value']}
                      rules={[{ required: true, message: `Option ${o.label} is required` }]}
                      initialValue={o.value}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Radio checked={s.correctOptionId === o.id} />
                        <span className="font-medium w-4">{o.label}.</span>
                        <Input value={o.value} onChange={(e) => handleSentenceOptionChange(s.id, o.id, e.target.value)} />
                        <CloseOutlined className="text-gray-400 hover:text-red-500" />
                      </div>
                    </Form.Item>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MEDIA UPLOAD */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-blue-900">📎</span> Media Attachments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Dragger {...uploadProps} className="bg-blue-50/50 border-blue-200">
            <p className="text-center py-6">
              <AudioOutlined style={{ fontSize: 24, color: '#1e3a8a' }} />
              <br />
              <span className="font-medium text-gray-700">Upload listening audio file</span>
            </p>
          </Dragger>
          <Dragger {...uploadProps} className="bg-gray-50 border-gray-300">
            <p className="text-center py-6">
              <FileImageOutlined style={{ fontSize: 24, color: '#1e3a8a' }} />
              <br />
              <span className="font-medium text-gray-700">Upload supporting image</span>
            </p>
          </Dragger>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-4 mt-4">
        <Button size="large">Cancel</Button>
        <Button className="border-blue-900 text-blue-900" size="large">Preview Question</Button>
        <Button type="primary" size="large" className="bg-blue-900" onClick={handleSubmit}>Save Question</Button>
      </div>
    </Form>
  );
};

export default CreateGrammarVocab;
