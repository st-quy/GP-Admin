import React, { useState, useEffect } from 'react';
import {
  Input,
  Select,
  Button,
  message,
  Card,
  Space,
  Typography,
  Form,
} from 'antd';

import { useNavigate } from 'react-router-dom';
import axiosInstance from '@shared/config/axios';

import { useCreateQuestion } from '@features/questions/hooks';
import { useGetPartsBySkillName } from '@features/parts/hooks';

// DROPDOWN components
import DropdownEditor from './Reading/dropdown/DropdownEditor';
import DropdownBlankOptions from './Reading/dropdown/DropdownBlankOptions';
import DropdownPreview from './Reading/dropdown/DropdownPreview';

// ORDERING components (support DND Kit)
import OrderingEditor from './Reading/ordering/OrderingEditor';
import OrderingPreview from './Reading/ordering/OrderingPreview';

// Yup Schemas
import {
  buildDropdownPayload,
  buildMatchingPayload,
  buildOrderingPayload,
} from '@features/questions/utils/buildQuestionPayload';
import {
  readingDropdownSchema,
  readingMatchingSchema,
  readingOrderingSchema,
} from '@pages/QuestionBank/schemas/createQuestionSchema';
import MatchingEditor from './Reading/matching/MatchingEditor';
import MatchingPreview from './Reading/matching/MatchingPreview';

const { TextArea } = Input;

const CreateReading = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  /** ================================ STATE ================================ **/
  const [partId, setPartId] = useState(null);
  const [questionType, setQuestionType] = useState('dropdown-list');

  // Dropdown state
  const [dropdownContent, setDropdownContent] = useState({
    content: '',
    blanks: [],
  });

  const [dropdownBlanks, setDropdownBlanks] = useState([]);

  // Ordering state
  const [orderingIntro, setOrderingIntro] = useState('');
  const [orderingItems, setOrderingItems] = useState([]);

  // Matching
  const [matchingInstruction, setMatchingInstruction] = useState('');
  const [matchingLeftItems, setMatchingLeftItems] = useState([]);
  const [matchingRightItems, setMatchingRightItems] = useState([]);
  const [matchingMapping, setMatchingMapping] = useState([]);

  // Media
  const [audioUrl, setAudioUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  // Errors
  const [errors, setErrors] = useState({
    partId: '',
    content: '',
    blanks: {},
  });

  const { data: readingParts = [], isLoading: loadingParts } =
    useGetPartsBySkillName('READING');

  const { mutate: createReading, isPending: isCreating } = useCreateQuestion();

  /** ========================================================================
   * SYNC DROPDOWN BLANKS
   * ======================================================================== **/
  useEffect(() => {
    if (questionType !== 'dropdown-list') return;

    const newBlankKeys = dropdownContent.blanks.map((b) => b.key);

    setDropdownBlanks((prev) => {
      const map = {};

      prev.forEach((b) => {
        map[b.key] = b;
      });

      return newBlankKeys.map((key) =>
        map[key]
          ? map[key] // giữ nguyên options cũ
          : {
              key,
              options: [],
              correctAnswer: null,
            }
      );
    });
  }, [dropdownContent, questionType]);

  /** ========================================================================
   * SAVE HANDLER
   * ======================================================================== **/
  const handleSave = async () => {
    setErrors({ partId: '', content: '', blanks: {} });

    if (!partId) {
      setErrors((e) => ({ ...e, partId: 'Part is required' }));
      return;
    }

    let payload = null;

    /** ---------------------- DROPDOWN ---------------------- **/
    if (questionType === 'dropdown-list') {
      const validatePayload = {
        PartID: partId,
        Content: dropdownContent.content,
        blanks: dropdownBlanks.map((b) => ({
          key: b.key,
          options: b.options.map((o) => ({ value: o.value })),
          correctAnswer:
            b.options.find((o) => o.id === b.correctAnswer)?.value || '',
        })),
      };

      try {
        await readingDropdownSchema.validate(validatePayload, {
          abortEarly: false,
        });
      } catch (err) {
        const newErrors = { partId: '', content: '', blanks: {} };

        err.inner.forEach((e) => {
          if (e.path === 'Content') newErrors.content = e.message;

          if (e.path?.startsWith('blanks[')) {
            const idx = Number(e.path.match(/blanks\[(\d+)\]/)[1]);
            const blankKey = validatePayload.blanks[idx]?.key;

            if (!newErrors.blanks[blankKey]) newErrors.blanks[blankKey] = [];
            newErrors.blanks[blankKey].push(e.message);
          }
        });

        setErrors(newErrors);
        return;
      }

      payload = buildDropdownPayload({
        partId,
        dropdownContent,
        dropdownBlanks,
        audioUrl,
        imageUrl,
      });
    }

    /** ---------------------- ORDERING ---------------------- **/
    if (questionType === 'ordering') {
      const validatePayload = {
        PartID: partId,
        Content: orderingIntro,
        items: orderingItems.map((i) => i.text),
      };

      try {
        await readingOrderingSchema.validate(validatePayload, {
          abortEarly: false,
        });
      } catch (err) {
        const newErrors = { partId: '', content: '' };
        err.inner.forEach((e) => {
          if (e.path === 'Content') newErrors.content = e.message;
        });
        setErrors(newErrors);
        return;
      }

      payload = buildOrderingPayload({
        partId,
        intro: orderingIntro,
        items: orderingItems,
        audioUrl,
        imageUrl,
      });
    }

    if (questionType === 'matching') {
      const validatePayload = {
        PartID: partId,
        Content: matchingInstruction,
        leftItems: matchingLeftItems.map((i) => i.text),
        rightItems: matchingRightItems.map((i) => i.text),
        mapping: matchingMapping, // nếu schema cần
      };

      try {
        await readingMatchingSchema.validate(validatePayload, {
          abortEarly: false,
        });
      } catch (err) {
        const newErrors = { partId: '', content: '' };
        err.inner.forEach((e) => {
          if (e.path === 'Content') newErrors.content = e.message;
        });
        setErrors(newErrors);
        return;
      }

      payload = buildMatchingPayload({
        partId,
        instruction: matchingInstruction,
        leftItems: matchingLeftItems,
        rightItems: matchingRightItems,
        mapping: matchingMapping,
        audioUrl,
        imageUrl,
      });
    }

    /** ---------------------- API CALL ---------------------- **/
    createReading(payload, {
      onSuccess: () => {
        message.success('Created successfully!');
        navigate(-1);
      },
      onError: (err) => {
        message.error(err?.response?.data?.message || 'Failed to create');
      },
    });
  };
  const customizeRequiredMark = (label, { required }) => (
    <>
      {label}
      {required && <span style={{ color: 'red', marginLeft: 4 }}>*</span>}
    </>
  );
  /** ========================================================================
   * UI
   * ======================================================================== **/
  return (
    <Form
      layout='vertical'
      form={form}
      style={{ width: '100%' }}
      requiredMark={customizeRequiredMark}
    >
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        {/* =================== Part & Type =================== */}
        <Card title='Part Information'>
          <Form.Item
            label='Name'
            validateStatus={errors.partId ? 'error' : ''}
            help={errors.partId}
            required
          >
            <Select
              placeholder='Choose part'
              loading={loadingParts}
              value={partId}
              onChange={setPartId}
              options={readingParts.map((p) => ({
                value: p.ID,
                label: p.Content,
              }))}
            />
          </Form.Item>
          <Form.Item label='Subpart Content'>
            <TextArea rows={4} />
          </Form.Item>
        </Card>

        {/* ============ DROPDOWN OPTIONS ============ */}
        <Card title={'Question Details'}>
          <Form.Item label='Question Type' required>
            <Select
              value={questionType}
              onChange={setQuestionType}
              options={[
                { value: 'dropdown-list', label: 'Dropdown (Fill in blank)' },
                { value: 'ordering', label: 'Ordering (Drag & Drop)' },
                { value: 'matching', label: 'Matching' },
              ]}
            />
          </Form.Item>

          {/* ========== Instruction Text ========== */}
          <Form.Item
            label='Instruction Text'
            validateStatus={errors.content ? 'error' : ''}
            help={errors.content}
            required
          >
            {questionType === 'dropdown-list' && (
              <DropdownEditor
                value={dropdownContent.content}
                onChange={(content, blanks) => {
                  setDropdownContent({ content, blanks });
                }}
              />
            )}

            {questionType === 'ordering' && (
              <TextArea
                rows={4}
                placeholder='Enter ordering introduction...'
                value={orderingIntro}
                onChange={(e) => setOrderingIntro(e.target.value)}
              />
            )}

            {questionType === 'matching' && (
              <TextArea
                rows={4}
                placeholder='Enter reading / instruction text...'
                value={matchingInstruction}
                onChange={(e) => setMatchingInstruction(e.target.value)}
              />
            )}
          </Form.Item>
          {questionType === 'dropdown-list' && (
            <DropdownBlankOptions
              blanks={dropdownBlanks}
              errors={errors.blanks}
              addOption={(blankKey) =>
                setDropdownBlanks((prev) =>
                  prev.map((b) =>
                    b.key === blankKey
                      ? {
                          ...b,
                          options: [
                            ...b.options,
                            {
                              id: Date.now(),
                              value: '',
                            },
                          ],
                        }
                      : b
                  )
                )
              }
              updateOptionValue={(blankKey, optId, value) =>
                setDropdownBlanks((prev) =>
                  prev.map((b) =>
                    b.key === blankKey
                      ? {
                          ...b,
                          options: b.options.map((o) =>
                            o.id === optId ? { ...o, value } : o
                          ),
                        }
                      : b
                  )
                )
              }
              removeOption={(blankKey, optId) =>
                setDropdownBlanks((prev) =>
                  prev.map((b) =>
                    b.key === blankKey
                      ? {
                          ...b,
                          options: b.options.filter((o) => o.id !== optId),
                          correctAnswer:
                            b.correctAnswer === optId ? null : b.correctAnswer,
                        }
                      : b
                  )
                )
              }
              setCorrectAnswer={(blankKey, optId) =>
                setDropdownBlanks((prev) =>
                  prev.map((b) =>
                    b.key === blankKey ? { ...b, correctAnswer: optId } : b
                  )
                )
              }
            />
          )}

          {/* ============ ORDERING (DND Ready) ============ */}
          {questionType === 'ordering' && (
            <OrderingEditor items={orderingItems} setItems={setOrderingItems} />
          )}

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
        </Card>
        {/* Preview */}
        <Card title='Preview'>
          {questionType === 'dropdown-list' && (
            <div
              style={{ fontSize: 16, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}
            >
              <DropdownPreview
                content={dropdownContent.content}
                blanks={dropdownBlanks}
              />
            </div>
          )}
          {questionType === 'ordering' && (
            <OrderingPreview items={orderingItems} />
          )}
          {questionType === 'matching' && (
            <MatchingPreview
              content={matchingInstruction} // Instruction Text / đoạn reading
              leftItems={matchingLeftItems} // list câu hỏi
              rightItems={matchingRightItems} // list tên (Nina, Harry, Brad…)
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

        {/* Footer */}
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button type='primary' loading={isCreating} onClick={handleSave}>
            Save Question
          </Button>
        </Space>
      </Space>
    </Form>
  );
};

export default CreateReading;
