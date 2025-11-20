import React, { useState } from 'react';
import { Input, Select, Button, Upload, message, Radio } from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  AudioOutlined,
  FileImageOutlined,
  CloseOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Dragger } = Upload;

const CreateReading = () => {
  const [questionType, setQuestionType] = useState('multiple-choice');

  const [mcOptions, setMcOptions] = useState([
    { id: 1, label: 'A', value: '' },
    { id: 2, label: 'B', value: '' },
    { id: 3, label: 'C', value: '' },
    { id: 4, label: 'D', value: '' },
  ]);

  const [tfngSentences, setTfngSentences] = useState([
    { id: 1, text: '', correctAnswer: null },
  ]);

  const [fillBlankSentences, setFillBlankSentences] = useState([
    {
      id: 1,
      text: 'The study showed that [...] participants were involved.',
      options: [
        { id: 1, label: 'A', value: 'fifty' },
        { id: 2, label: 'B', value: 'sixty' },
      ],
      correctOptionId: 1,
    },
  ]);

  const [matchingData, setMatchingData] = useState({
    contents: [
      { id: 1, label: '1', value: '' },
      { id: 2, label: '2', value: '' },
      { id: 3, label: '3', value: '' },
      { id: 4, label: '4', value: '' },
    ],
    options: [
      { id: 1, label: 'A', value: '' },
      { id: 2, label: 'B', value: '' },
      { id: 3, label: 'C', value: '' },
      { id: 4, label: 'D', value: '' },
    ],
    matches: {},
  });

  const getNextId = (arr) => (arr.length > 0 ? arr[arr.length - 1].id + 1 : 1);
  const getLabel = (index) => String.fromCharCode(65 + index);

  const handleAddMcOption = () =>
    setMcOptions([
      ...mcOptions,
      {
        id: getNextId(mcOptions),
        label: getLabel(mcOptions.length),
        value: '',
      },
    ]);
  const handleRemoveMcOption = (id) =>
    setMcOptions(
      mcOptions
        .filter((o) => o.id !== id)
        .map((o, i) => ({ ...o, label: getLabel(i) }))
    );

  const addTfngSentence = () =>
    setTfngSentences([
      ...tfngSentences,
      { id: getNextId(tfngSentences), text: '', correctAnswer: null },
    ]);
  const removeTfngSentence = (id) =>
    setTfngSentences(tfngSentences.filter((s) => s.id !== id));
  const setTfngAnswer = (id, value) => {
    const updated = tfngSentences.map((s) =>
      s.id === id ? { ...s, correctAnswer: value } : s
    );
    setTfngSentences(updated);
  };

  const addMatchingContent = () =>
    setMatchingData({
      ...matchingData,
      contents: [
        ...matchingData.contents,
        {
          id: getNextId(matchingData.contents),
          label: (matchingData.contents.length + 1).toString(),
          value: '',
        },
      ],
    });
  const addMatchingOption = () =>
    setMatchingData({
      ...matchingData,
      options: [
        ...matchingData.options,
        {
          id: getNextId(matchingData.options),
          label: getLabel(matchingData.options.length),
          value: '',
        },
      ],
    });

  const uploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    action: 'https://run.mocky.io/v3/435ba68c-13a3-4aec-a98f-5369e871a63d',
    onChange(info) {
      if (info.file.status === 'done')
        message.success(`${info.file.name} uploaded.`);
    },
  };

  return (
    <div className='flex flex-col gap-6 pb-10'>
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
          <span className='text-blue-900'>🧩</span> Part Information
        </h3>
        <div className='flex flex-col gap-4'>
          <div>
            <label className='font-medium text-gray-700'>
              Name <span className='text-red-500'>*</span>
            </label>
            <Input placeholder='e.g., Part 1: Reading Passage 1' size='large' />
          </div>
          <div>
            <label className='font-medium text-gray-700'>Subpart Content</label>
            <TextArea rows={3} placeholder='e.g., Questions 1-5' />
          </div>
        </div>
      </div>

      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
          <span className='text-blue-900'>❓</span> Question Details
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-4'>
          <div>
            <label className='font-medium text-gray-700'>
              Question Name <span className='text-red-500'>*</span>
            </label>
            <Input placeholder='e.g., Q1-Reading' size='large' />
          </div>
          <div>
            <label className='font-medium text-gray-700'>
              Question Type <span className='text-red-500'>*</span>
            </label>
            <Select
              value={questionType}
              onChange={setQuestionType}
              size='large'
              className='w-full'
              options={[
                { value: 'multiple-choice', label: 'Multiple Choice' },
                { value: 'true-false', label: 'True / False / Not Given' },
                { value: 'matching', label: 'Matching Headings/Info' },
                { value: 'fill-in-blank', label: 'Fill in the blank' },
              ]}
            />
          </div>
        </div>

        <div className='mb-6'>
          <label className='font-medium text-gray-700'>
            Instruction Text <span className='text-red-500'>*</span>
          </label>
          <TextArea
            rows={4}
            placeholder='Enter the question text or the reading passage segment students will see...'
          />
        </div>
        {questionType === 'multiple-choice' && (
          <div className='flex flex-col gap-4'>
            <label className='font-medium text-gray-700'>
              Answer Options <span className='text-red-500'>*</span>
            </label>
            {mcOptions.map((opt) => (
              <div key={opt.id} className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded bg-blue-50 text-blue-900 font-bold flex items-center justify-center border border-blue-100 flex-shrink-0'>
                  {opt.label}
                </div>
                <Input placeholder={`Enter option ${opt.label}`} size='large' />
                <Button
                  type='text'
                  icon={<DeleteOutlined />}
                  className='text-gray-400 hover:text-red-500'
                  onClick={() => handleRemoveMcOption(opt.id)}
                />
              </div>
            ))}
            <Button
              type='text'
              icon={<PlusOutlined />}
              onClick={handleAddMcOption}
              className='w-40 text-blue-900 font-medium justify-start pl-0'
            >
              Add more option
            </Button>
            <div className='mt-2'>
              <label className='font-medium text-gray-700'>
                Correct Answer <span className='text-red-500'>*</span>
              </label>
              <Select
                className='w-full mt-1'
                size='large'
                placeholder='Select correct answer'
                options={mcOptions.map((o) => ({
                  value: o.id,
                  label: `Option ${o.label}`,
                }))}
              />
            </div>
          </div>
        )}
        {questionType === 'true-false' && (
          <div className='flex flex-col gap-6'>
            <Button
              icon={<PlusOutlined />}
              size='large'
              className='w-40 border-blue-900 text-blue-900 font-medium'
              onClick={addTfngSentence}
            >
              Add Statement
            </Button>
            {tfngSentences.map((item, idx) => (
              <div
                key={item.id}
                className='border border-gray-200 rounded-lg p-4 bg-gray-50'
              >
                <div className='flex justify-between items-start mb-2'>
                  <span className='font-bold text-gray-700'>
                    Statement {idx + 1}
                  </span>
                  <DeleteOutlined
                    className='text-red-500 cursor-pointer'
                    onClick={() => removeTfngSentence(item.id)}
                  />
                </div>
                <Input
                  className='mb-4'
                  size='large'
                  placeholder='e.g., The population increased significantly.'
                  value={item.text}
                  onChange={(e) => {
                    const updated = tfngSentences.map((s) =>
                      s.id === item.id ? { ...s, text: e.target.value } : s
                    );
                    setTfngSentences(updated);
                  }}
                />
                <div className='flex items-center gap-4'>
                  <span className='text-sm font-semibold text-gray-600'>
                    Correct Answer:
                  </span>
                  <Radio.Group
                    value={item.correctAnswer}
                    onChange={(e) => setTfngAnswer(item.id, e.target.value)}
                  >
                    <Radio value='TRUE'>TRUE</Radio>
                    <Radio value='FALSE'>FALSE</Radio>
                    <Radio value='NOT_GIVEN'>NOT GIVEN</Radio>
                  </Radio.Group>
                </div>
              </div>
            ))}
          </div>
        )}
        {questionType === 'matching' && (
          <div>
            <div className='grid grid-cols-2 gap-8 mb-6'>
              <div>
                <h4 className='font-bold text-blue-900 mb-2'>
                  Questions / Headings
                </h4>
                <div className='flex flex-col gap-3'>
                  {matchingData.contents.map((item) => (
                    <div key={item.id} className='flex items-center gap-2'>
                      <div className='text-blue-900 font-bold w-4'>
                        {item.label}
                      </div>
                      <Input placeholder='Question text...' />
                    </div>
                  ))}
                  <Button
                    type='dashed'
                    block
                    icon={<PlusOutlined />}
                    onClick={addMatchingContent}
                    className='mt-2'
                  >
                    Add more
                  </Button>
                </div>
              </div>
              <div>
                <h4 className='font-bold text-green-600 mb-2'>
                  Paragraphs / Options
                </h4>
                <div className='flex flex-col gap-3'>
                  {matchingData.options.map((item) => (
                    <div key={item.id} className='flex items-center gap-2'>
                      <div className='text-green-600 font-bold w-4 rounded-full border border-green-600 flex items-center justify-center h-6 text-xs'>
                        {item.label}
                      </div>
                      <Input placeholder='Paragraph A...' />
                    </div>
                  ))}
                  <Button
                    type='dashed'
                    block
                    icon={<PlusOutlined />}
                    onClick={addMatchingOption}
                    className='mt-2'
                  >
                    Add more option
                  </Button>
                </div>
              </div>
            </div>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h4 className='font-bold text-gray-700 mb-3'>
                Correct Answer Mapping
              </h4>
              <div className='flex flex-wrap gap-4'>
                {matchingData.contents.map((c) => (
                  <div
                    key={c.id}
                    className='flex items-center gap-2 bg-white px-3 py-2 rounded border border-gray-200'
                  >
                    <span className='font-bold text-blue-900'>{c.label}</span>
                    <ArrowRightOutlined className='text-gray-400' />
                    <Select
                      className='w-24'
                      placeholder='Select'
                      options={matchingData.options.map((o) => ({
                        value: o.id,
                        label: o.label,
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {questionType === 'fill-in-blank' && (
          <div className='flex flex-col gap-6'>
            <Button
              icon={<PlusOutlined />}
              size='large'
              className='w-40 border-blue-900 text-blue-900 font-medium'
              onClick={() =>
                setFillBlankSentences([
                  ...fillBlankSentences,
                  {
                    id: Date.now(),
                    text: '',
                    options: [],
                    correctOptionId: null,
                  },
                ])
              }
            >
              Add Sentence
            </Button>
            {fillBlankSentences.map((sentence, idx) => (
              <div
                key={sentence.id}
                className='border border-gray-200 rounded-lg p-4 bg-gray-50'
              >
                <div className='flex items-center gap-3 mb-3'>
                  <div className='w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold'>
                    {idx + 1}
                  </div>
                  <span className='font-semibold'>Sentence Text</span>
                </div>
                <Input
                  className='mb-4'
                  size='large'
                  defaultValue={sentence.text}
                  placeholder='Sentence with [...]'
                />
                <div className='bg-white p-4 rounded border border-gray-100'>
                  <div className='flex justify-between mb-2'>
                    <span className='font-semibold text-gray-700'>
                      Correct answer:
                    </span>
                    <span className='text-blue-600 cursor-pointer'>
                      + Add Option
                    </span>
                  </div>
                  {sentence.options.map((opt) => (
                    <div key={opt.id} className='flex items-center gap-3 mb-2'>
                      <Radio checked={sentence.correctOptionId === opt.id} />
                      <span className='font-medium w-4'>{opt.label}.</span>
                      <Input size='middle' defaultValue={opt.value} />
                      <CloseOutlined className='text-gray-400 hover:text-red-500' />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
          <span className='text-blue-900'>📎</span> Media Attachments
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Dragger {...uploadProps} className='bg-blue-50/50 border-blue-200'>
            <p className='text-center py-6'>
              <AudioOutlined style={{ fontSize: 24, color: '#1e3a8a' }} />
              <br />
              <span className='font-medium text-gray-700'>
                Upload listening audio file
              </span>
            </p>
          </Dragger>
          <Dragger {...uploadProps} className='bg-gray-50 border-gray-300'>
            <p className='text-center py-6'>
              <FileImageOutlined style={{ fontSize: 24, color: '#1e3a8a' }} />
              <br />
              <span className='font-medium text-gray-700'>
                Upload supporting image
              </span>
            </p>
          </Dragger>
        </div>
      </div>
      <div className='flex justify-end gap-4 mt-4'>
        <Button size='large'>Cancel</Button>
        <Button className='border-blue-900 text-blue-900' size='large'>
          Preview Question
        </Button>
        <Button type='primary' size='large' className='bg-blue-900'>
          Save Question
        </Button>
      </div>
    </div>
  );
};

export default CreateReading;
