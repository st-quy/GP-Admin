// UpdateReading.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Form, Input, Button, Card, Space, Typography, message, Modal, Select } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

import { buildFullReadingPayload } from '@features/questions/utils/buildQuestionPayload';
import {
  useGetQuestionGroupDetail,
  useUpdateQuestionGroup,
} from '@features/questions/hooks';
import { useGetAllTags } from '@features/sections/hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { QuestionApi } from '@features/questions/api';

import DropdownBlankOptions from '../CreateSkills/Reading/dropdown/DropdownBlankOptions';
import DropdownEditor from '../CreateSkills/Reading/dropdown/DropdownEditor';
import DropdownPreview from '../CreateSkills/Reading/dropdown/DropdownPreview';
import MatchingEditor from '../CreateSkills/Reading/matching/MatchingEditor';
import MatchingEditorPart4 from '../CreateSkills/Reading/matching/MatchingEditorPart4';
import OrderingEditor from '../CreateSkills/Reading/ordering/OrderingEditor';

import {
  MAX_QUESTION_INPUT_LENGTH,
  sanitizeQuestionInput,
} from '@shared/lib/questionInput';

const AUTOSAVE_DEBOUNCE_MS = 2000;

const UpdateReading = () => {
  const navigate = useNavigate();
  const { id: sectionId } = useParams();
  const [form] = Form.useForm();
  const { data, isFetching } = useGetQuestionGroupDetail('READING', sectionId);
  const { mutate: updateReading, isPending } = useUpdateQuestionGroup();

  const [dataLoaded, setDataLoaded] = useState(false);
  const [part1Content, setPart1Content] = useState('');
  const [part1Blanks, setPart1Blanks] = useState([]);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceTimerRef = useRef(null);
  const payloadRef = useRef(null);
  const isPublishingRef = useRef(false);
  const [tags, setTags] = useState([]);
  const [originalStatus, setOriginalStatus] = useState('draft');
  const { data: existingTags = [] } = useGetAllTags();

  /** WATCH PART 1 CONTENT + BLANKS */
  const watchPart1Content = Form.useWatch(['part1', 'content'], form);
  const watchPart1Blanks = Form.useWatch(['part1', 'blanks'], form);
  const part3Mapping = Form.useWatch(['part3', 'mapping'], form);
  const part4Mapping = Form.useWatch(['part4', 'mapping'], form);

  useEffect(() => {
    setPart1Content(watchPart1Content);
    setPart1Blanks(watchPart1Blanks);
  }, [watchPart1Content, watchPart1Blanks]);

  // ---------------------------------------------------------
  // Convert ordering API -> correct sorted items
  // ---------------------------------------------------------
  const transformOrdering = (apiPart) => {
    if (!apiPart) return null;

    const options = apiPart.AnswerContent?.options || [];
    const correctAnswer = apiPart.AnswerContent?.correctAnswer || [];

    const orderMap = {};
    correctAnswer.forEach((a) => (orderMap[a.key] = a.value));

    const items = options.map((opt) => ({
      text: opt,
      order: orderMap[opt] ?? 999,
    }));

    items.sort((a, b) => a.order - b.order);

    return {
      id: apiPart.PartID,
      name: apiPart.PartName || '',
      intro: apiPart.Content || '',
      items: items.map((x) => ({ text: x.text })),
    };
  };

  // ---------------------------------------------------------
  // Transform API → Form
  // ---------------------------------------------------------
  const transformApiDataToForm = (apiData) => {
    if (!apiData) return null;

    const transformed = {
      sectionName: apiData.SectionName || '',
    };

    /* ---------------- PART 1 ---------------- */
    if (apiData.part1) {
      const apiBlanks = apiData.part1.AnswerContent?.options || [];
      const apiCorrect = apiData.part1.AnswerContent?.correctAnswer || [];

      let content =
        apiData.part1.AnswerContent?.content || apiData.part1.Content || '';

      content = content.replace(/\([^()]*\)/g, '');

      apiBlanks.forEach((opt) => {
        const key = String(opt.key);
        const rmPunct = new RegExp(`\\b${key}[\\.,);:!?-]`, 'g');
        content = content.replace(rmPunct, key);

        const bare = new RegExp(`\\b${key}\\b`, 'g');
        content = content.replace(bare, `[${key}]`);
      });

      content = content.replace(/\([^()]*\)/g, '');

      content = content
        .replace(/\r\n/g, '\n')
        .replace(/[ ]+\n/g, '\n')
        .replace(/\n{2,}/g, '\n')
        .trim();

      const transformedBlanks = apiBlanks.map((opt) => {
        const correctObj = apiCorrect.find((a) => a.key === opt.key);
        const correctValue = correctObj?.value;

        const options = (opt.value || []).map((v, idx) => ({
          id: `${opt.key}-${idx}`,
          value: v,
        }));

        const correctOption = options.find((o) => o.value === correctValue);

        return {
          key: opt.key,
          options,
          correctAnswer: correctOption?.id || '',
        };
      });

      transformed.part1 = {
        id: apiData.part1.PartID,
        name: apiData.part1.PartName,
        content,
        blanks: transformedBlanks,
      };
    }

    /* ---------------- PART 2A ---------------- */
    if (apiData.part2) transformed.part2A = transformOrdering(apiData.part2);

    /* ---------------- PART 2B ---------------- */
    if (apiData.part3) transformed.part2B = transformOrdering(apiData.part3);

    /* ---------------- PART 4 (Dropdown-matching) ---------------- */
    if (apiData.part4) {
      const AC = apiData.part4.AnswerContent;

      const leftItems = (AC.leftItems || []).map((t, i) => ({
        id: i + 1,
        text: typeof t === 'string' ? t.replace(/^\s*\d+\.\s*/, '') : t.text || '',
      }));

      const rightItems = (AC.rightItems || []).map((t, i) => ({
        id: i + 1,
        text: typeof t === 'string' ? t : t.text || '',
      }));

      const mapping = (AC.correctAnswer || []).map((a) => {
        const leftIndex = Number(a.key) - 1;
        const rightItem = rightItems.find((r) => r.text === a.value);

        return {
          leftIndex,
          rightId: rightItem?.id || null,
        };
      });

      transformed.part3 = {
        id: apiData.part4.PartID,
        name: apiData.part4.PartName,
        content: apiData.part4.Content,
        leftItems,
        rightItems,
        mapping,
      };
    }

    /* ---------------- PART 5 (Full matching) ---------------- */
    if (apiData.part5) {
      const AC = apiData.part5.AnswerContent;

      const leftItems = (AC.leftItems || []).map((t, i) => ({
        id: i + 1,
        text: typeof t === 'string' ? t : t.text || '',
      }));

      const rightItems = (AC.rightItems || []).map((t, i) => ({
        id: i + 1,
        text: typeof t === 'string' ? t : t.text || '',
      }));

      const mapping = (AC.correctAnswer || []).map((a) => {
        const leftIndex = leftItems.findIndex((l) => l.text === a.left);
        const rightItem = rightItems.find((r) => r.text === a.right);

        return {
          leftIndex,
          rightId: rightItem?.id || null,
        };
      });

      transformed.part4 = {
        id: apiData.part5.PartID,
        name: apiData.part5.PartName,
        content: AC.content,
        leftItems,
        rightItems,
        mapping,
      };
    }

    return transformed;
  };

  useEffect(() => {
    if (data && !dataLoaded) {
      const transformed = transformApiDataToForm(data);

      form.setFieldsValue(transformed);

      if (transformed.part1) {
        setPart1Content(transformed.part1.content);
        setPart1Blanks(transformed.part1.blanks);
      }

      const allTags = new Set();
      Object.keys(data).filter(k => typeof k === 'string' && k.startsWith('part')).forEach(key => {
        const part = data[key];
        (part?.questions || []).forEach(q => {
          (q.Tags || []).forEach(t => allTags.add(t));
        });
      });
      setTags(Array.from(allTags));
      setOriginalStatus(data.Status || 'draft');

      setDataLoaded(true);
    }
  }, [data, dataLoaded]);

  /* ---------------- AUTOSAVE ---------------- */
  const scheduleAutosave = useCallback((payload) => {
    if (isPublishingRef.current) return;
    payloadRef.current = payload;
    setIsAutosaving(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      if (payloadRef.current) {
        try {
          await QuestionApi.update({ sectionId, payload: payloadRef.current });
        } catch (error) {
        } finally {
          setIsAutosaving(false);
          payloadRef.current = null;
        }
      } else {
        setIsAutosaving(false);
      }
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [sectionId]);

  const handleValuesChange = useCallback((changedValues, allValues) => {
    if (isPublishingRef.current) return;
    try {
      const fullPayload = buildFullReadingPayload(allValues);
      const payload = {
        SkillName: 'READING',
        SectionName: allValues.sectionName || 'Untitled Draft',
        Status: originalStatus,
        tags: tags,
        parts: fullPayload.parts,
      };
      scheduleAutosave(payload);
    } catch (e) {
    }
  }, [scheduleAutosave, isSubmitting, isPending, tags, originalStatus]);

  // Autosave when matching mapping changes
  useEffect(() => {
    if (isPublishingRef.current) return;
    if (dataLoaded && (part3Mapping || part4Mapping)) {
      const values = form.getFieldsValue(true);
      try {
        const fullPayload = buildFullReadingPayload(values);
        const payload = {
          SkillName: 'READING',
          SectionName: values.sectionName || 'Untitled Draft',
          Status: originalStatus,
          tags: tags,
          parts: fullPayload.parts,
        };
        scheduleAutosave(payload);
      } catch (e) {
      }
    }
  }, [part3Mapping, part4Mapping, dataLoaded, isSubmitting, isPending, tags, originalStatus]);

  /* ---------------- BUTTONS ---------------- */
  const handleSaveAsDraft = async () => {
    const values = form.getFieldsValue(true);
    try {
      const fullPayload = buildFullReadingPayload(values);
      const payload = {
        SkillName: 'READING',
        SectionName: values.sectionName || 'Untitled Draft',
        Status: 'draft',
        tags: tags,
        parts: fullPayload.parts,
      };
      setIsSubmitting(true);
      await QuestionApi.update({ sectionId, payload });
      message.success('Draft saved successfully');
      navigate(-1);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Discard Changes?',
      content: 'You have unsaved changes. Are you sure you want to go back?',
      okText: 'Discard & Go Back',
      cancelText: 'Keep Editing',
      okButtonProps: { danger: true },
      onOk: () => navigate(-1),
      onCancel: () => {},
    });
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = buildFullReadingPayload(values);
      payload.Status = 'published';
      payload.tags = tags;

      // Clear any pending autosave to prevent overwriting publish
      isPublishingRef.current = true;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      payloadRef.current = null;

      setIsSubmitting(true);
      updateReading(
        { sectionId, payload },
        {
          onSuccess: () => {
            message.success('Update reading section successfully!');
            navigate(-1);
          },
          onError: (err) => {
            message.error(err?.response?.data?.message || 'Update failed');
          },
        }
      );
    } catch (err) {
      console.error(err);
      if (err?.errorFields) {
        message.error(`Validation failed: ${err.errorFields.map(f => f.name.join('.')).join(', ')}`);
      } else {
        message.error('Validation failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching || !dataLoaded) return <div>Loading...</div>;

  return (
    <Form form={form} layout='vertical' onValuesChange={handleValuesChange}>
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        {/* SECTION INFO */}
        <Card title='Section Information'>
          <Form.Item
            label='Name'
            name='sectionName'
            getValueFromEvent={(e) => sanitizeQuestionInput(e.target.value)}
            rules={[{ required: true }]}
          >
            <Input maxLength={MAX_QUESTION_INPUT_LENGTH} />
          </Form.Item>
          <Form.Item label='Tags'>
            <Select
              mode='tags'
              placeholder='Add tags for this section'
              value={tags}
              onChange={setTags}
              style={{ width: '100%' }}
              tokenSeparators={[',']}
              options={existingTags.map((t) => ({ label: t, value: t }))}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Card>

        {/* PART 1 */}
        <Card title='Part 1 (Dropdown)'>
          <Form.Item name={['part1', 'id']} hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label='Part Name'
            name={['part1', 'name']}
            getValueFromEvent={(e) => sanitizeQuestionInput(e.target.value)}
            rules={[{ required: true }]}
          >
            <Input maxLength={MAX_QUESTION_INPUT_LENGTH} />
          </Form.Item>

          <Form.Item
            label='Content'
            name={['part1', 'content']}
            rules={[{ required: true }]}
          >
            <DropdownEditor />
          </Form.Item>

          <DropdownBlankOptions />
          <Form.Item shouldUpdate noStyle>
            {({ getFieldValue }) => {
              const part1 = getFieldValue(['part1']) || {};
              const blanks = Array.isArray(part1.blanks) ? part1.blanks : [];

              return (
                <Form.Item
                  name={['part1', '_minBlanks']}
                  validateTrigger='onSubmit'
                  rules={[
                    {
                      validator: () => {
                        if (blanks.length < 1) {
                          return Promise.reject(
                            new Error('Must have at least 1 blank')
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <div style={{ height: 0 }} />
                </Form.Item>
              );
            }}
          </Form.Item>

          <Typography.Text strong>Preview:</Typography.Text>
          <div
            style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}
          >
            <div
              style={{
                fontSize: 16,
                lineHeight: 2.4,
                whiteSpace: 'pre-wrap',
              }}
            >
              <DropdownPreview content={part1Content} blanks={part1Blanks} />
            </div>
          </div>
        </Card>

        {/* PART 2A */}
        <Card title='Part 2 (Ordering)'>
          <Form.Item name={['part2A', 'id']} hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label='Part Name'
            name={['part2A', 'name']}
            getValueFromEvent={(e) => sanitizeQuestionInput(e.target.value)}
            rules={[{ required: true }]}
          >
            <Input maxLength={MAX_QUESTION_INPUT_LENGTH} />
          </Form.Item>

          <Form.Item
            label='Introduction'
            name={['part2A', 'intro']}
            getValueFromEvent={(e) => sanitizeQuestionInput(e.target.value)}
            rules={[{ required: true }]}
          >
            <Input.TextArea maxLength={MAX_QUESTION_INPUT_LENGTH} />
          </Form.Item>

          <Form.List name={['part2A', 'items']}>
            {(fields, helpers) => (
              <OrderingEditor
                fields={fields}
                helpers={helpers}
                listPath={['part2A', 'items']}
              />
            )}
          </Form.List>
        </Card>

        {/* PART 2B */}
        <Card title='Part 3 (Ordering)'>
          <Form.Item name={['part2B', 'id']} hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label='Part Name'
            name={['part2B', 'name']}
            getValueFromEvent={(e) => sanitizeQuestionInput(e.target.value)}
            rules={[{ required: true }]}
          >
            <Input maxLength={MAX_QUESTION_INPUT_LENGTH} />
          </Form.Item>

          <Form.Item
            label='Introduction'
            name={['part2B', 'intro']}
            getValueFromEvent={(e) => sanitizeQuestionInput(e.target.value)}
            rules={[{ required: true }]}
          >
            <Input.TextArea maxLength={MAX_QUESTION_INPUT_LENGTH} />
          </Form.Item>

          <Form.List name={['part2B', 'items']}>
            {(fields, helpers) => (
              <OrderingEditor
                fields={fields}
                helpers={helpers}
                listPath={['part2B', 'items']}
              />
            )}
          </Form.List>
        </Card>

        {/* PART 4 */}
        <Card title='Part 4 (Matching)'>
          <Form.Item name={['part3', 'id']} hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label='Part Name'
            name={['part3', 'name']}
            getValueFromEvent={(e) => sanitizeQuestionInput(e.target.value)}
            rules={[{ required: true }]}
          >
            <Input maxLength={MAX_QUESTION_INPUT_LENGTH} />
          </Form.Item>

          <Form.Item
            label='Content'
            name={['part3', 'content']}
            getValueFromEvent={(e) => sanitizeQuestionInput(e.target.value)}
            rules={[{ required: true }]}
          >
            <Input.TextArea maxLength={MAX_QUESTION_INPUT_LENGTH} />
          </Form.Item>

          <Form.Item name={['part3']}>
            <MatchingEditor />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const part3 = getFieldValue(['part3']) || {};
              const left = Array.isArray(part3.leftItems)
                ? part3.leftItems
                : [];
              const right = Array.isArray(part3.rightItems)
                ? part3.rightItems
                : [];

              return (
                <Form.Item
                  name={['part3', '_minItems']}
                  rules={[
                    {
                      validator: () => {
                        if (left.length < 1)
                          return Promise.reject(
                            new Error('Must have at least 1 content')
                          );
                        if (right.length < 1)
                          return Promise.reject(
                            new Error('Must have at least 1 option')
                          );
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <div style={{ height: 0 }} />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Card>

        {/* PART 5 */}
        <Card title='Part 5 (Matching)'>
          <Form.Item name={['part4', 'id']} hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label='Part Name'
            name={['part4', 'name']}
            getValueFromEvent={(e) => sanitizeQuestionInput(e.target.value)}
            rules={[{ required: true }]}
          >
            <Input maxLength={MAX_QUESTION_INPUT_LENGTH} />
          </Form.Item>

          <Form.Item
            label='Content'
            name={['part4', 'content']}
            getValueFromEvent={(e) => sanitizeQuestionInput(e.target.value)}
            rules={[{ required: true }]}
          >
            <Input.TextArea maxLength={MAX_QUESTION_INPUT_LENGTH} />
          </Form.Item>

          <Form.Item name={['part4']}>
            <MatchingEditorPart4 />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const part4 = getFieldValue(['part4']) || {};
              const left = Array.isArray(part4.leftItems)
                ? part4.leftItems
                : [];
              const right = Array.isArray(part4.rightItems)
                ? part4.rightItems
                : [];

              return (
                <Form.Item
                  name={['part4', '_minItems']}
                  rules={[
                    {
                      validator: () => {
                        if (left.length < 1)
                          return Promise.reject(
                            new Error('Must have at least 1 content')
                          );
                        if (right.length < 1)
                          return Promise.reject(
                            new Error('Must have at least 1 option')
                          );
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <div style={{ height: 0 }} />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Card>

        <div className='flex justify-end gap-4'>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button loading={isSubmitting || isAutosaving} onClick={handleSaveAsDraft}>
            <SaveOutlined /> Save as Draft
          </Button>
          <Button type='primary' className='bg-blue-900' loading={isSubmitting || isAutosaving || isPending} onClick={handleSubmit}>
            Publish
          </Button>
        </div>
      </Space>
    </Form>
  );
};

export default UpdateReading;
