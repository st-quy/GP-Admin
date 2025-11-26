// CreateListening.jsx
import React, { useState } from 'react';
import {
  Input,
  Select,
  Button,
  Upload,
  message,
  Form,
  Card,
  Space,
} from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  AudioOutlined,
  FileImageOutlined,
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';
import { useGetPartsBySkillName } from '@features/parts/hooks';
import { useCreateQuestion } from '@features/questions/hooks';

// Reuse MatchingEditor + MatchingPreview của Reading
import MatchingEditor from './Reading/matching/MatchingEditor';
import MatchingPreview from './Reading/matching/MatchingPreview';
import { readingMatchingSchema } from '@pages/QuestionBank/schemas/createQuestionSchema';
import axiosInstance from '@shared/config/axios';

const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const CreateListening = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { data: listeningParts = [], isLoading: loadingParts } =
    useGetPartsBySkillName('LISTENING');

  const { mutate: createQuestion, isPending: isCreating } = useCreateQuestion();

  const [partId, setPartId] = useState(null);
  const [questionType, setQuestionType] = useState('multiple-choice');

  // Watch instruction text for previews
  const instructionText = Form.useWatch('instruction', form);

  // Audio/Image URL
  const [audioUrl, setAudioUrl] = useState(null);
  const [imageUrl] = useState(null);

  /** ================= MULTIPLE-CHOICE STATE ================= */
  const [mcOptions, setMcOptions] = useState([
    { id: 1, label: 'A', value: '' },
    { id: 2, label: 'B', value: '' },
    { id: 3, label: 'C', value: '' },
    { id: 4, label: 'D', value: '' },
  ]);
  const [mcCorrectOptionId, setMcCorrectOptionId] = useState(null);

  /** ================= DROPDOWN-LIST (MATCHING STYLE) ================= */
  const [matchingLeftItems, setMatchingLeftItems] = useState([]);
  const [matchingRightItems, setMatchingRightItems] = useState([]);
  // [{ leftIndex, rightId }]
  const [matchingMapping, setMatchingMapping] = useState([]);

  /** ================= LISTENING-QUESTIONS-GROUP ================= */
  const [groupQuestions, setGroupQuestions] = useState([
    {
      id: 1,
      content: '',
      options: [
        { id: 1, label: 'A', value: '' },
        { id: 2, label: 'B', value: '' },
        { id: 3, label: 'C', value: '' },
      ],
      correctOptionId: null,
    },
  ]);

  /** ================= HELPERS ================= */
  const getNextId = (arr) => (arr.length > 0 ? arr[arr.length - 1].id + 1 : 1);
  const getLetter = (index) => LETTERS[index] || `Opt${index + 1}`;

  /** ---- MC handlers ---- */
  const handleAddMcOption = () => {
    setMcOptions((prev) => [
      ...prev,
      {
        id: getNextId(prev),
        label: getLetter(prev.length),
        value: '',
      },
    ]);
  };

  const handleRemoveMcOption = (id) => {
    setMcOptions((prev) => {
      if (prev.length <= 2) return prev; // giữ tối thiểu 2 đáp án
      const filtered = prev.filter((o) => o.id !== id);
      const relabeled = filtered.map((o, i) => ({
        ...o,
        label: getLetter(i),
      }));
      if (mcCorrectOptionId === id) {
        setMcCorrectOptionId(null);
      }
      return relabeled;
    });
  };

  const handleMcChange = (id, value) => {
    setMcOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, value } : o))
    );
  };

  /** ---- GROUP-QUESTIONS handlers ---- */
  const addGroupQuestion = () => {
    setGroupQuestions((prev) => [
      ...prev,
      {
        id: getNextId(prev),
        content: '',
        options: [
          { id: 1, label: 'A', value: '' },
          { id: 2, label: 'B', value: '' },
          { id: 3, label: 'C', value: '' },
        ],
        correctOptionId: null,
      },
    ]);
  };

  const removeGroupQuestion = (id) => {
    setGroupQuestions((prev) =>
      prev.length === 1 ? prev : prev.filter((q) => q.id !== id)
    );
  };

  const updateGroupQuestionContent = (id, value) => {
    setGroupQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, content: value } : q))
    );
  };

  const addGroupOption = (questionId) => {
    setGroupQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const nextId = getNextId(q.options);
        return {
          ...q,
          options: [
            ...q.options,
            {
              id: nextId,
              label: getLetter(q.options.length),
              value: '',
            },
          ],
        };
      })
    );
  };

  const removeGroupOption = (questionId, optionId) => {
    setGroupQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        if (q.options.length <= 2) return q; // giữ ít nhất 2 đáp án
        const filtered = q.options.filter((o) => o.id !== optionId);
        const relabeled = filtered.map((o, idx) => ({
          ...o,
          label: getLetter(idx),
        }));
        return {
          ...q,
          options: relabeled,
          correctOptionId:
            q.correctOptionId === optionId ? null : q.correctOptionId,
        };
      })
    );
  };

  const updateGroupOptionValue = (questionId, optionId, value) => {
    setGroupQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: q.options.map((o) =>
            o.id === optionId ? { ...o, value } : o
          ),
        };
      })
    );
  };

  const setGroupCorrectOption = (questionId, optionId) => {
    setGroupQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, correctOptionId: optionId } : q
      )
    );
  };

  /** ================= SAVE / SUBMIT ================= */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (!partId) {
        message.error('Part is required');
        return;
      }

      const instruction = (values.instruction || '').trim();
      const subContent = values.subContent || null;

      if (!instruction) {
        message.error('Instruction text is required');
        return;
      }

      let answerContent = null;
      let groupContent = null;

      /** ---------- TYPE: multiple-choice ---------- */
      if (questionType === 'multiple-choice') {
        const normalizedOptions = mcOptions
          .map((o) => ({
            key: o.label,
            value: (o.value || '').trim(),
            id: o.id,
          }))
          .filter((o) => o.value.length > 0);

        if (!normalizedOptions.length) {
          message.error('Please enter at least 1 option');
          return;
        }

        if (!mcCorrectOptionId) {
          message.error('Please select correct answer');
          return;
        }

        const correct = normalizedOptions.find(
          (o) => o.id === mcCorrectOptionId
        );
        if (!correct) {
          message.error('Correct answer must be one of the options');
          return;
        }

        const optionsText = normalizedOptions.map((o) => o.value);

        groupContent = {
          title: instruction,
          audioKey: audioUrl || '',
        };

        // AnswerContent theo mẫu JSON multiple-choice listening
        answerContent = {
          content: instruction,
          groupContent,
          options: optionsText,
          correctAnswer: correct.value,
          partID: partId,
          type: 'multiple-choice',
          audioKeys: audioUrl || null,
        };
      }

      /** ---------- TYPE: dropdown-list (matching style) ---------- */
      if (questionType === 'dropdown-list') {
        const validatePayload = {
          PartID: partId,
          Content: instruction,
          leftItems: matchingLeftItems.map((i) => i.text),
          rightItems: matchingRightItems.map((i) => i.text),
          mapping: matchingMapping,
        };

        await readingMatchingSchema.validate(validatePayload, {
          abortEarly: false,
        });

        const leftItems = matchingLeftItems
          .map((i) => (i.text || '').trim())
          .filter(Boolean);
        const rightItems = matchingRightItems
          .map((i) => (i.text || '').trim())
          .filter(Boolean);

        const correctAnswer = matchingMapping
          .map((m) => {
            const left = matchingLeftItems[m.leftIndex];
            const right = matchingRightItems.find((r) => r.id === m.rightId);
            if (!left || !right || !left.text || !right.text) return null;
            return {
              key: left.text,
              value: right.text,
            };
          })
          .filter(Boolean);

        groupContent = {
          title: instruction,
          audioKey: audioUrl || '',
        };

        // AnswerContent theo mẫu JSON dropdown-list listening
        answerContent = {
          content: instruction,
          groupContent,
          leftItems,
          rightItems,
          correctAnswer,
          partID: partId,
          type: 'dropdown-list',
          audioKeys: audioUrl || null,
        };
      }

      /** ---------- TYPE: listening-questions-group ---------- */
      if (questionType === 'listening-questions-group') {
        if (!groupQuestions.length) {
          message.error('Please add at least one sub-question');
          return;
        }

        const listContent = [];

        for (let i = 0; i < groupQuestions.length; i++) {
          const q = groupQuestions[i];
          const qContent = (q.content || '').trim();

          if (!qContent) {
            message.error(`Sub-question ${i + 1}: content is required`);
            return;
          }

          const normalizedOptions = q.options
            .map((o) => ({
              id: o.id,
              label: o.label,
              value: (o.value || '').trim(),
            }))
            .filter((o) => o.value.length > 0);

          if (!normalizedOptions.length) {
            message.error(
              `Sub-question ${i + 1}: please enter at least 1 option`
            );
            return;
          }

          if (!q.correctOptionId) {
            message.error(
              `Sub-question ${i + 1}: please select correct answer`
            );
            return;
          }

          const correctOpt = normalizedOptions.find(
            (o) => o.id === q.correctOptionId
          );
          if (!correctOpt) {
            message.error(
              `Sub-question ${i + 1}: correct answer must be one of the options`
            );
            return;
          }

          listContent.push({
            ID: i + 1,
            content: qContent,
            options: normalizedOptions.map((o) => o.value),
            type: 'multiple-choice',
            correctAnswer: correctOpt.value,
            partID: partId,
          });
        }

        groupContent = {
          title: instruction,
          audioKey: audioUrl || '',
          listContent,
        };

        // AnswerContent theo mẫu JSON listening-questions-group
        answerContent = {
          content: instruction,
          groupContent,
          partID: partId,
          type: 'listening-questions-group',
          audioKeys: audioUrl || null,
        };
      }

      const questionRow = {
        Type: questionType,
        AudioKeys: audioUrl || null,
        ImageKeys: imageUrl || null,
        SkillID: null,
        PartID: partId,
        Sequence: 1,
        Content: instruction,
        SubContent: subContent,
        GroupContent: groupContent,
        AnswerContent: answerContent,
      };

      const payload = {
        PartID: partId,
        SkillName: 'LISTENING',
        PartType: questionType,
        Description: instruction,
        questions: [questionRow],
      };

      createQuestion(payload, {
        onSuccess: () => {
          message.success('Created successfully!');
          navigate(-1);
        },
        onError: (err) => {
          message.error(err?.response?.data?.message || 'Failed to create');
        },
      });
    } catch (err) {
      if (err?.name === 'ValidationError') {
        message.error(err.errors?.[0] || 'Invalid data');
      } else {
        console.error('❌ Validation error Listening:', err);
      }
    }
  };

  /** ================= UPLOAD PROPS (audio with presigned URL) ================= */
  const uploadProps = {
    multiple: false,
    maxCount: 1,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        // 1) Gọi BE xin presigned URL
        const { data } = await axiosInstance.post('/presigned-url/upload-url', {
          fileName: file.name,
          type: 'audios',
        });

        const { uploadUrl, fileUrl } = data;

        if (!uploadUrl || !fileUrl) {
          throw new Error('Invalid upload URL response');
        }

        // 2) Upload trực tiếp lên MinIO
        const res = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
        });

        if (!res.ok) {
          console.error('MinIO upload failed', await res.text());
          throw new Error(`Upload failed with status ${res.status}`);
        }

        // 3) Lưu lại URL audio để preview + gửi BE
        setAudioUrl(fileUrl);

        // 4) Báo cho AntD Upload là xong
        onSuccess({ fileUrl });
        message.success('Audio uploaded successfully');
      } catch (err) {
        console.error('Upload audio error:', err);
        onError(err);
        message.error('Upload failed!');
      }
    },
  };

  const customizeRequiredMark = (label, { required }) => (
    <>
      {label}
      {required && <span style={{ color: 'red', marginLeft: 4 }}>*</span>}
    </>
  );

  /** ================= RENDER ================= */
  return (
    <Form form={form} layout='vertical' requiredMark={customizeRequiredMark}>
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        {/* PART INFO */}
        <Card title='Part Information'>
          <Form.Item label='Name' required>
            <Select
              placeholder='Choose part'
              loading={loadingParts}
              value={partId}
              onChange={setPartId}
              options={listeningParts.map((p) => ({
                value: p.ID,
                label: p.Content,
              }))}
            />
          </Form.Item>
          <Form.Item name='subContent' label='Subpart Content'>
            <TextArea
              rows={3}
              placeholder='Enter content or passage description'
            />
          </Form.Item>
        </Card>

        {/* QUESTION DETAILS */}
        <Card title='Question Details'>
          <Form.Item
            name='instruction'
            label='Instruction Text'
            rules={[{ required: true, message: 'Instruction is required' }]}
          >
            <TextArea
              rows={3}
              placeholder='Enter the question text that students will see...'
            />
          </Form.Item>

          <Form.Item label='Question Type' required>
            <Select
              value={questionType}
              onChange={setQuestionType}
              size='large'
              className='w-full'
            >
              <Option value='multiple-choice'>Multiple Choice</Option>
              <Option value='dropdown-list'>
                Dropdown List (Matching-style)
              </Option>
              <Option value='listening-questions-group'>
                Listening Questions Group
              </Option>
            </Select>
          </Form.Item>

          {/* ============= MULTIPLE-CHOICE ============= */}
          {questionType === 'multiple-choice' && (
            <div className='flex flex-col gap-4'>
              <label className='font-medium text-gray-700'>
                Answer Options
              </label>
              {mcOptions.map((opt) => (
                <div key={opt.id} className='flex items-center gap-3 mb-1'>
                  <div className='w-10 h-10 rounded bg-blue-50 text-blue-900 font-bold flex items-center justify-center border border-blue-100 flex-shrink-0'>
                    {opt.label}
                  </div>
                  <Input
                    placeholder={`Enter option ${opt.label}`}
                    size='large'
                    value={opt.value}
                    onChange={(e) => handleMcChange(opt.id, e.target.value)}
                  />
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
                  value={mcCorrectOptionId ?? undefined}
                  onChange={setMcCorrectOptionId}
                  options={mcOptions.map((o) => ({
                    value: o.id,
                    label: `Option ${o.label}`,
                  }))}
                />
              </div>
            </div>
          )}

          {/* ============= DROPDOWN-LIST (MATCHING) ============= */}
          {questionType === 'dropdown-list' && (
            <MatchingEditor
              leftItems={matchingLeftItems}
              setLeftItems={setMatchingLeftItems}
              rightItems={matchingRightItems}
              setRightItems={setMatchingRightItems}
              mapping={matchingMapping}
              setMapping={setMatchingMapping}
            />
          )}

          {/* ============= LISTENING-QUESTIONS-GROUP ============= */}
          {questionType === 'listening-questions-group' && (
            <div className='flex flex-col gap-6'>
              <Button
                icon={<PlusOutlined />}
                size='large'
                className='w-56 border-blue-900 text-blue-900 font-medium'
                onClick={addGroupQuestion}
              >
                Add Sub-question
              </Button>

              {groupQuestions.map((q, idx) => (
                <Card
                  key={q.id}
                  size='small'
                  className='border border-gray-200 bg-gray-50 relative'
                  title={`Sub-question ${idx + 1}`}
                  extra={
                    groupQuestions.length > 1 && (
                      <Button
                        type='text'
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeGroupQuestion(q.id)}
                      >
                        Remove
                      </Button>
                    )
                  }
                >
                  <div className='mb-3'>
                    <label className='text-sm font-medium text-gray-600'>
                      Question Text <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      size='large'
                      className='mt-1'
                      placeholder='Enter question text...'
                      value={q.content}
                      onChange={(e) =>
                        updateGroupQuestionContent(q.id, e.target.value)
                      }
                    />
                  </div>

                  <div className='flex flex-col gap-3 mb-3'>
                    {q.options.map((opt) => (
                      <div key={opt.id} className='flex items-center gap-3'>
                        <div className='w-7 h-7 rounded-full bg-blue-50 text-blue-900 font-bold flex items-center justify-center border border-blue-100 flex-shrink-0 text-sm'>
                          {opt.label}
                        </div>
                        <Input
                          size='middle'
                          placeholder={`Option ${opt.label}`}
                          value={opt.value}
                          onChange={(e) =>
                            updateGroupOptionValue(q.id, opt.id, e.target.value)
                          }
                        />
                        {q.options.length > 2 && (
                          <DeleteOutlined
                            className='text-gray-400 hover:text-red-500 cursor-pointer'
                            onClick={() => removeGroupOption(q.id, opt.id)}
                          />
                        )}
                      </div>
                    ))}
                    <Button
                      type='dashed'
                      icon={<PlusOutlined />}
                      onClick={() => addGroupOption(q.id)}
                    >
                      Add option
                    </Button>
                  </div>

                  <div>
                    <label className='text-sm font-medium text-gray-600'>
                      Correct Answer <span className='text-red-500'>*</span>
                    </label>
                    <Select
                      className='w-full mt-1'
                      placeholder='Select correct answer'
                      value={q.correctOptionId ?? undefined}
                      onChange={(val) => setGroupCorrectOption(q.id, val)}
                      options={q.options.map((o) => ({
                        value: o.id,
                        label: `Option ${o.label}`,
                      }))}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* MEDIA ATTACHMENTS */}
        <Card
          title='Media Attachments'
          className='[&_.ant-card-body]:overflow-auto'
        >
          <Dragger {...uploadProps} className='bg-blue-50/50 border-blue-200'>
            <p className='text-center py-2'>
              <AudioOutlined style={{ fontSize: 24, color: '#1e3a8a' }} />
              <br />
              <span className='font-medium text-gray-700'>Upload Audio</span>
            </p>
          </Dragger>
        </Card>

        {/* PREVIEW */}
        <Card title='Preview'>
          {/* Audio preview */}
          {audioUrl && (
            <div className='mb-4'>
              <p className='text-sm font-medium text-gray-700 mb-1'>Audio</p>
              <audio controls src={audioUrl} className='w-full'>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {questionType === 'multiple-choice' && (
            <div className='space-y-4'>
              <p className='font-medium text-gray-900'>
                {instructionText || 'Instruction preview...'}
              </p>
              <div className='flex flex-col gap-3'>
                {mcOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className={`flex items-center rounded-lg border px-3 py-2 text-sm ${
                      mcCorrectOptionId === opt.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <span className='w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold mr-3'>
                      {opt.label}
                    </span>
                    <span className='text-gray-900'>
                      {opt.value || (
                        <span className='text-gray-400 italic'>
                          Option text...
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {questionType === 'dropdown-list' && (
            <MatchingPreview
              content={instructionText || ''}
              leftItems={matchingLeftItems}
              rightItems={matchingRightItems}
              mapping={matchingMapping}
              onChange={(leftIndex, rightId) => {
                setMatchingMapping((prev) => {
                  const exist = prev.find((m) => m.leftIndex === leftIndex);
                  if (exist) {
                    return prev.map((m) =>
                      m.leftIndex === leftIndex ? { ...m, rightId } : m
                    );
                  }
                  return [...prev, { leftIndex, rightId }];
                });
              }}
            />
          )}

          {questionType === 'listening-questions-group' && (
            <div className='space-y-4'>
              <p className='font-medium text-gray-900'>
                {instructionText || 'Instruction preview...'}
              </p>
              <div className='space-y-4'>
                {groupQuestions.map((q, idx) => (
                  <div key={q.id} className='border rounded-lg p-3'>
                    <p className='font-semibold text-gray-800 mb-2'>
                      {idx + 1}.{' '}
                      {q.content || (
                        <span className='text-gray-400 italic'>
                          Question text...
                        </span>
                      )}
                    </p>
                    <div className='flex flex-col gap-2'>
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`flex items-center text-sm rounded border px-3 py-1 ${
                            q.correctOptionId === opt.id
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <span className='w-6 text-xs font-bold text-blue-900'>
                            {opt.label}.
                          </span>
                          <span className='text-gray-900'>
                            {opt.value || (
                              <span className='text-gray-400 italic'>
                                Option text...
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* ACTION BUTTONS */}
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button size='large' onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type='primary'
            size='large'
            className='bg-blue-900'
            loading={isCreating}
            onClick={handleSave}
          >
            Save Question
          </Button>
        </Space>
      </Space>
    </Form>
  );
};

export default CreateListening;
