import React, { useState } from 'react';
import { Input, Select, Button, Upload, message, Radio } from 'antd';
import { 
  DeleteOutlined, 
  PlusOutlined, 
  AudioOutlined,
  FileImageOutlined,
  CloseOutlined,
  ArrowRightOutlined,
  HolderOutlined 
} from '@ant-design/icons';

const { TextArea } = Input;
const { Dragger } = Upload;

const CreateListening = () => {
  const [questionType, setQuestionType] = useState('multiple-choice');

  const [mcOptions, setMcOptions] = useState([
    { id: 1, label: 'A', value: '' },
    { id: 2, label: 'B', value: '' },
    { id: 3, label: 'C', value: '' },
    { id: 4, label: 'D', value: '' },
  ]);

  const [groupQuestions, setGroupQuestions] = useState([
    {
      id: 1,
      text: '',
      options: [
        { id: 1, label: 'A', value: '' },
        { id: 2, label: 'B', value: '' },
        { id: 3, label: 'C', value: '' },
        { id: 4, label: 'D', value: '' },
      ],
      correctAnswer: null
    }
  ]);


  const [fillBlankSentences, setFillBlankSentences] = useState([
    {
      id: 1,
      text: 'The weather today is [...] than yesterday.',
      options: [{ id: 1, label: 'A', value: 'hotter' }, { id: 2, label: 'B', value: 'colder' }],
      correctOptionId: 1
    }
  ]);

  const [dropdownSentences, setDropdownSentences] = useState([
    {
      id: 1,
      text: 'The weather today is [Dropdown A] than yesterday.',
      label: 'A',
      options: [{ id: 1, label: 'A', value: 'hotter' }, { id: 2, label: 'B', value: 'colder' }],
      correctOptionId: null
    }
  ]);

  const [matchingData, setMatchingData] = useState({
    contents: [{ id: 1, label: '1', value: '' }, { id: 2, label: '2', value: '' }, { id: 3, label: '3', value: '' }, { id: 4, label: '4', value: '' }],
    options: [{ id: 1, label: 'A', value: '' }, { id: 2, label: 'B', value: '' }, { id: 3, label: 'C', value: '' }, { id: 4, label: 'D', value: '' }],
    matches: {}
  });

  const [orderingSentences, setOrderingSentences] = useState([
    { id: 1, label: 'A', text: '' },
    { id: 2, label: 'B', text: '' },
    { id: 3, label: 'C', text: '' },
    { id: 4, label: 'D', text: '' },
    { id: 5, label: 'E', text: '' },
  ]);
  const [orderingCorrectOrder, setOrderingCorrectOrder] = useState({});

  const getNextId = (arr) => arr.length > 0 ? arr[arr.length - 1].id + 1 : 1;
  const getLabel = (index) => String.fromCharCode(65 + index); 
  const getOrdinalLabel = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]) + " Position";
  }

  const handleAddMcOption = () => setMcOptions([...mcOptions, { id: getNextId(mcOptions), label: getLabel(mcOptions.length), value: '' }]);
  const handleRemoveMcOption = (id) => setMcOptions(mcOptions.filter(o => o.id !== id).map((o, i) => ({...o, label: getLabel(i)})));

  const addGroupSubQuestion = () => setGroupQuestions([...groupQuestions, { id: getNextId(groupQuestions), text: '', options: [{ id: 1, label: 'A', value: '' }, { id: 2, label: 'B', value: '' }, { id: 3, label: 'C', value: '' }, { id: 4, label: 'D', value: '' }], correctAnswer: null }]);
  const removeGroupSubQuestion = (id) => setGroupQuestions(groupQuestions.filter(g => g.id !== id));

  const addMatchingContent = () => setMatchingData({ ...matchingData, contents: [...matchingData.contents, { id: getNextId(matchingData.contents), label: (matchingData.contents.length + 1).toString(), value: '' }] });
  const addMatchingOption = () => setMatchingData({ ...matchingData, options: [...matchingData.options, { id: getNextId(matchingData.options), label: getLabel(matchingData.options.length), value: '' }] });

  const addOrderingSentence = () => {
    setOrderingSentences([...orderingSentences, { 
        id: getNextId(orderingSentences), 
        label: getLabel(orderingSentences.length), 
        text: '' 
    }]);
  };

  const removeOrderingSentence = (id) => {
      const newSentences = orderingSentences.filter(item => item.id !== id);
      const reindexed = newSentences.map((item, index) => ({
          ...item,
          label: getLabel(index)
      }));
      setOrderingSentences(reindexed);
  };

  const handleOrderingCorrectChange = (positionIndex, value) => {
      setOrderingCorrectOrder({...orderingCorrectOrder, [positionIndex]: value});
  }
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
          <div><label className="font-medium text-gray-700">Name <span className="text-red-500">*</span></label><Input placeholder="e.g., Part 1: Short Conversations" size="large" /></div>
          <div><label className="font-medium text-gray-700">Subject Content</label><TextArea rows={3} placeholder="Enter content or passage description" /></div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="text-blue-900">❓</span> Question Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div><label className="font-medium text-gray-700">Question Name <span className="text-red-500">*</span></label><Input placeholder="e.g., Q1-Listening" size="large" /></div>
          <div>
            <label className="font-medium text-gray-700">Question Type <span className="text-red-500">*</span></label>
            <Select value={questionType} onChange={setQuestionType} size="large" className="w-full"
              options={[
                { value: 'multiple-choice', label: 'Multiple Choice' },
                { value: 'group-multiple-choice', label: 'Group Multiple Choice' },
                { value: 'matching', label: 'Matching' },
                { value: 'fill-in-blank', label: 'Fill in the blank' },
                { value: 'dropdown', label: 'Dropdown' },
                { value: 'ordering', label: 'Ordering' },
              ]}
            />
          </div>
        </div>
        
        <div className="mb-6">
             <label className="font-medium text-gray-700">Question Text <span className="text-red-500">*</span></label>
             <TextArea rows={3} placeholder="Enter the question text that students will see..." />
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
        {questionType === 'group-multiple-choice' && (
          <div className="flex flex-col gap-6">
            <Button icon={<PlusOutlined />} size="large" className="w-48 border-blue-900 text-blue-900 font-medium" onClick={addGroupSubQuestion}>Add Sub-question</Button>
            {groupQuestions.map((q, idx) => (
              <div key={q.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50 relative">
                <Button type="text" danger icon={<DeleteOutlined />} className="absolute top-4 right-4 flex items-center gap-1" onClick={() => removeGroupSubQuestion(q.id)}>Remove</Button>
                <h4 className="font-bold text-gray-700 mb-3">Sub-question {idx + 1}</h4>
                <div className="mb-4"><label className="text-sm font-medium text-gray-600">Sub-question Text <span className="text-red-500">*</span></label><Input size="large" className="mt-1" placeholder="Enter text..." /></div>
                <div className="flex flex-col gap-3 mb-4">
                  {q.options.map(opt => (
                    <div key={opt.id} className="flex items-center gap-2"><span className="w-6 font-bold text-blue-900">{opt.label}</span><Input size="middle" placeholder={`Option ${opt.label}`} /><DeleteOutlined className="text-gray-400 hover:text-red-500 cursor-pointer" /></div>
                  ))}
                </div>
                <div><label className="text-sm font-medium text-gray-600">Correct Answer <span className="text-red-500">*</span></label><Select className="w-full mt-1" placeholder="Select answer" options={q.options.map(o => ({value: o.id, label: `Option ${o.label}`}))} /></div>
              </div>
            ))}
          </div>
        )}
        {questionType === 'fill-in-blank' && (
          <div className="flex flex-col gap-6">
            <Button icon={<PlusOutlined />} size="large" className="w-40 border-blue-900 text-blue-900 font-medium" onClick={() => setFillBlankSentences([...fillBlankSentences, {id: Date.now(), text: '', options: [], correctOptionId: null}])}>Add Sentence</Button>
            {fillBlankSentences.map((sentence, idx) => (
              <div key={sentence.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold">{idx + 1}</div><span className="font-semibold">Sentence Text</span></div>
                <Input className="mb-4" size="large" defaultValue={sentence.text} placeholder="Sentence with [...]" />
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
        {questionType === 'dropdown' && (
           <div className="flex flex-col gap-6">
             <div className="flex justify-between items-center"><h4 className="font-bold text-gray-800">Sentences with Blanks</h4><Button type="primary" icon={<PlusOutlined />} className="bg-blue-600">Add Sentence</Button></div>
             {dropdownSentences.map((sentence, idx) => (
               <div key={sentence.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                 <DeleteOutlined className="absolute top-4 right-4 text-red-500 cursor-pointer" />
                 <p className="font-medium text-gray-700 mb-2">Sentence {idx + 1}</p>
                 <Input className="mb-4" size="large" defaultValue={sentence.text} />
                 <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                   <div className="flex justify-between items-center mb-3"><span className="font-semibold text-gray-800">Dropdown {sentence.label}</span><span className="text-blue-600 cursor-pointer text-sm font-medium">+ Add Option</span></div>
                   <div className="flex flex-col gap-3 mb-4">{sentence.options.map(opt => (<div key={opt.id} className="flex items-center gap-3"><span className="text-gray-400 font-medium w-4 text-sm">{opt.label}.</span><Input size="middle" defaultValue={opt.value} /><CloseOutlined className="text-red-400 cursor-pointer text-sm" /></div>))}</div>
                   <div><label className="text-xs font-semibold text-gray-600 block mb-1">Correct Answer:</label><Select className="w-40" placeholder="Select" options={sentence.options.map(o => ({value: o.id, label: `Option ${o.label}`}))} /></div>
                 </div>
               </div>
             ))}
           </div>
        )}
        {questionType === 'matching' && (
          <div>
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <h4 className="font-bold text-blue-900 mb-2">Contents</h4>
                <div className="flex flex-col gap-3">{matchingData.contents.map((item) => (<div key={item.id} className="flex items-center gap-2"><div className="text-blue-900 font-bold w-4">{item.label}</div><Input placeholder="Content item..." /></div>))}<Button type="dashed" block icon={<PlusOutlined />} onClick={addMatchingContent} className="mt-2">Add more content</Button></div>
              </div>
              <div>
                <h4 className="font-bold text-green-600 mb-2">Options</h4>
                <div className="flex flex-col gap-3">{matchingData.options.map((item) => (<div key={item.id} className="flex items-center gap-2"><div className="text-green-600 font-bold w-4 rounded-full border border-green-600 flex items-center justify-center h-6 text-xs">{item.label}</div><Input placeholder="Option item..." /></div>))}<Button type="dashed" block icon={<PlusOutlined />} onClick={addMatchingOption} className="mt-2">Add more option</Button></div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
               <h4 className="font-bold text-gray-700 mb-3">Correct Answer Mapping</h4>
               <div className="flex flex-wrap gap-4">{matchingData.contents.map(c => (<div key={c.id} className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-gray-200"><span className="font-bold text-blue-900">{c.label}</span><ArrowRightOutlined className="text-gray-400" /><Select className="w-24" placeholder="Select" options={matchingData.options.map(o => ({value: o.id, label: o.label}))} /></div>))}</div>
            </div>
          </div>
        )}
        {questionType === 'ordering' && (
          <div className="flex flex-col gap-6">
             <Button 
                size="large" 
                icon={<PlusOutlined />} 
                className="w-40 border-blue-900 text-blue-900 font-medium"
                onClick={addOrderingSentence}
             >
                Add Sentence
             </Button>
             <div className="flex flex-col gap-3">
                 {orderingSentences.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                        <HolderOutlined className="text-gray-400 text-lg cursor-grab" /> {/* Icon Drag 6 chấm */}
                        <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold flex-shrink-0">
                            {item.label}
                        </div>
                        <Input 
                            placeholder={`Enter sentence ${item.label}`} 
                            size="large" 
                            className="flex-1"
                            value={item.text}
                            onChange={(e) => {
                                const updated = orderingSentences.map(s => s.id === item.id ? {...s, text: e.target.value} : s);
                                setOrderingSentences(updated);
                            }}
                        />
                        <DeleteOutlined 
                            className="text-red-500 text-lg cursor-pointer hover:bg-red-50 p-2 rounded"
                            onClick={() => removeOrderingSentence(item.id)}
                        />
                    </div>
                 ))}
             </div>
             <div className="mt-2">
                 <h4 className="font-bold text-gray-800 mb-3">Correct Answer Order</h4>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                     {orderingSentences.map((_, index) => (
                         <div key={index} className="flex flex-col gap-1">
                             <label className="text-xs font-semibold text-gray-600">{getOrdinalLabel(index + 1)}</label>
                             <Select 
                                placeholder="Select" 
                                size="large"
                                className="w-full"
                                options={orderingSentences.map(s => ({ value: s.label, label: s.label }))}
                                value={orderingCorrectOrder[index]}
                                onChange={(val) => handleOrderingCorrectChange(index, val)}
                             />
                         </div>
                     ))}
                 </div>
             </div>
          </div>
        )}

      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
         <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="text-blue-900">📎</span> Media Attachments</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Dragger {...uploadProps} className="bg-blue-50/50 border-blue-200"><p className="text-center py-6"><AudioOutlined style={{fontSize: 24, color:'#1e3a8a'}} /><br/><span className="font-medium text-gray-700">Upload Audio</span></p></Dragger>
             <Dragger {...uploadProps} className="bg-gray-50 border-gray-300"><p className="text-center py-6"><FileImageOutlined style={{fontSize: 24, color:'#1e3a8a'}} /><br/><span className="font-medium text-gray-700">Upload Image</span></p></Dragger>
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

export default CreateListening;