// CreateGrammarVocab.jsx
import React, { useState } from 'react';
import { Input, Select, Button, message, Form, Card } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import GrammarMultipleChoicePreview from './GrammarAndVocabulary/multiple-choice/GrammarMultipleChoicePreview';
import MatchingEditor from './Reading/matching/MatchingEditor';
import MatchingPreview from './Reading/matching/MatchingPreview';

import { useGetPartsBySkillName } from '@features/parts/hooks';
import { useCreateQuestion } from '@features/questions/hooks';
import { readingMatchingSchema } from '@pages/QuestionBank/schemas/createQuestionSchema';

const { TextArea } = Input;
const { Option } = Select;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const CreateGrammarVocab = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { data: grammarvocabParts = [], isLoading: loadingParts } =
    useGetPartsBySkillName('GRAMMAR AND VOCABULARY');

  const { mutate: createQuestion, isPending: isCreating } = useCreateQuestion();

  const [partId, setPartId] = useState(null);
  const [questionType, setQuestionType] = useState('multiple-choice');

  // Watch instruction text for preview
  const instructionText = Form.useWatch('instruction', form);

  /** ================= MULTIPLE CHOICE ================= **/
  const [mcOptions, setMcOptions] = useState([
    { id: 1, label: 'A', value: '' },
    { id: 2, label: 'B', value: '' },
    { id: 3, label: 'C', value: '' },
    { id: 4, label: 'D', value: '' },
  ]);
  const [mcCorrectOptionId, setMcCorrectOptionId] = useState(null);

  /** ================= MATCHING (REUSE FROM READING) ================= **/
  // leftItems / rightItems / mapping SHAPE GIỐNG HỆT CreateReading
  const [matchingLeftItems, setMatchingLeftItems] = useState([]);

  const [matchingRightItems, setMatchingRightItems] = useState([]);
  // [{ leftIndex, rightId }]
  const [matchingMapping, setMatchingMapping] = useState([]);

  /** ================= HELPERS ================= **/
  const getNextId = (arr) => (arr.length > 0 ? arr[arr.length - 1].id + 1 : 1);
  const getLetter = (index) => LETTERS[index] || `Opt${index + 1}`;

  /** ================= MC HANDLERS ================= **/
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

  /** ================= SUBMIT ================= **/
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!partId) {
        message.error('Part is required');
        return;
      }

      const instruction = (values.instruction || '').trim();
      if (!instruction) {
        message.error('Instruction text is required');
        return;
      }

      let answerContent = null;

      /** ---------- MULTIPLE CHOICE ---------- */
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

        // ĐÚNG FORMAT GRAMMAR MULTIPLE CHOICE (mẫu trong DB)
        answerContent = {
          title: instruction,
          options: normalizedOptions.map(({ key, value }) => ({
            key,
            value,
          })),
          correctAnswer: correct.value,
        };
      }

      /** ---------- MATCHING (REUSE LOGIC READING) ---------- */
      if (questionType === 'matching') {
        const validatePayload = {
          PartID: partId,
          Content: instruction,
          leftItems: matchingLeftItems?.map((i) => i.text),
          rightItems: matchingRightItems.map((i) => i.text),
          mapping: matchingMapping,
        };

        // dùng lại schema Reading
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
              left: left.text,
              right: right.text,
            };
          })
          .filter(Boolean);

        // ĐÚNG FORMAT GRAMMAR MATCHING (content/leftItems/rightItems/correctAnswer)
        answerContent = {
          content: instruction,
          leftItems,
          rightItems,
          correctAnswer,
        };
      }

      // Build 1 question cho Grammar & Vocab
      const baseQuestion = {
        Type: questionType, // 'multiple-choice' | 'matching'
        AudioKeys: null,
        ImageKeys: null,
        SkillID: null, // BE sẽ set từ SkillName
        PartID: partId,
        Sequence: 1,
        Content: instruction,
        SubContent: values.subContent || null,
        GroupContent: null,
        AnswerContent: answerContent,
      };

      const payload = {
        PartID: partId,
        SkillName: 'GRAMMAR AND VOCABULARY',
        PartType: questionType,
        Description: instruction,
        questions: [baseQuestion],
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
        console.error('❌ Validation error Grammar & Vocab:', err);
      }
    }
  };
  const customizeRequiredMark = (label, { required }) => (
    <>
      {label}
      {required && <span style={{ color: 'red', marginLeft: 4 }}>*</span>}
    </>
  );
  /** ================= RENDER ================= **/
  return (
    <Form form={form} layout='vertical' requiredMark={customizeRequiredMark}>
      {/* PART INFO */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4'>
        <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
          <span className='text-blue-900'>🧩</span> Part Information
        </h3>
        <Form.Item label='Name' required>
          <Select
            placeholder='Choose part'
            loading={loadingParts}
            value={partId}
            onChange={setPartId}
            options={grammarvocabParts.map((p) => ({
              value: p.ID,
              label: p.Content,
            }))}
          />
        </Form.Item>
        <Form.Item name='subContent' label='Subpart Content'>
          <TextArea
            rows={3}
            placeholder='e.g., Choose the best answer to complete the sentence.'
          />
        </Form.Item>
      </div>

      {/* QUESTION DETAILS */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4'>
        <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
          <span className='text-blue-900'>❓</span> Question Details
        </h3>
        <Form.Item
          name='instruction'
          label='Instruction Text'
          rules={[{ required: true, message: 'Question text is required' }]}
        >
          <TextArea
            rows={4}
            placeholder='Enter the grammar/vocabulary question or sentence stem...'
          />
        </Form.Item>

        <Form.Item
          label='Question Type'
          required
          help={null}
          style={{ marginBottom: 24 }}
        >
          <Select
            value={questionType}
            onChange={(val) => setQuestionType(val)}
            size='large'
            className='w-full'
          >
            <Option value='multiple-choice'>Multiple Choice</Option>
            <Option value='matching'>Matching</Option>
          </Select>
        </Form.Item>

        {/* ============= MULTIPLE CHOICE ============= */}
        {questionType === 'multiple-choice' && (
          <div className='flex flex-col gap-4'>
            <label className='font-medium text-gray-700'>Answer Options</label>
            {mcOptions.map((opt) => (
              <div key={opt.id} className='flex items-center gap-3 mb-1'>
                <div className='w-10 h-10 rounded bg-blue-50 text-blue-900 font-bold flex items-center justify-center border border-blue-100'>
                  {opt.label}
                </div>
                <Input
                  value={opt.value}
                  onChange={(e) => handleMcChange(opt.id, e.target.value)}
                  placeholder={`Enter option ${opt.label}`}
                  size='large'
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
              className='w-40 text-blue-900 font-medium justify-start pl-0'
              onClick={handleAddMcOption}
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
                onChange={(val) => setMcCorrectOptionId(val)}
              >
                {mcOptions.map((o) => (
                  <Option key={o.id} value={o.id}>
                    Option {o.label}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {/* ============= MATCHING (REUSE MATCHINGEDITOR) ============= */}
        {questionType === 'matching' && (
          <MatchingEditor
            leftItems={matchingLeftItems}
            setLeftItems={setMatchingLeftItems}
            rightItems={matchingRightItems}
            setRightItems={setMatchingRightItems}
            mapping={matchingMapping}
            setMapping={setMatchingMapping}
          />
        )}
      </div>

      {/* PREVIEW */}
      <Card title='Preview'>
        {questionType === 'multiple-choice' && (
          <GrammarMultipleChoicePreview
            questionText={instructionText}
            options={mcOptions}
            correctOptionId={mcCorrectOptionId}
          />
        )}

        {questionType === 'matching' && (
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
      </Card>

      {/* ACTION BUTTONS */}
      <div className='flex justify-end gap-4 mt-4'>
        <Button size='large' onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button
          type='primary'
          size='large'
          className='bg-blue-900'
          loading={isCreating}
          onClick={handleSubmit}
        >
          Save Question
        </Button>
      </div>
    </Form>
  );
};

export default CreateGrammarVocab;
