// CreateReading.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, Input, Button, Card, Space, Typography, message, Modal } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

import DropdownEditor from './Reading/dropdown/DropdownEditor';
import DropdownBlankOptions from './Reading/dropdown/DropdownBlankOptions';
import DropdownPreview from './Reading/dropdown/DropdownPreview';

import OrderingEditor from './Reading/ordering/OrderingEditor';
import MatchingEditor from './Reading/matching/MatchingEditor';
import MatchingEditorPart4 from './Reading/matching/MatchingEditorPart4';

import { buildFullReadingPayload } from '@features/questions/utils/buildQuestionPayload';
import { useCreateQuestion } from '@features/questions/hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { QuestionApi, SectionApi } from '@features/questions/api';

const AUTOSAVE_DEBOUNCE_MS = 2000;

const CreateReading = ({ draftId: propDraftId }) => {
  const navigate = useNavigate();
  const { draftId: urlDraftId } = useParams();
  const draftId = propDraftId || urlDraftId;

  const [form] = Form.useForm();
  const { mutate: createQuestion, isPending } = useCreateQuestion();

  const [isAutosaving, setIsAutosaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!draftId);
  const debounceTimerRef = useRef(null);
  const payloadRef = useRef(null);
  const draftIdRef = useRef(draftId);

  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);

  // Hooks must be called unconditionally - move before any early returns
  const part1Content = Form.useWatch(['part1', 'content'], form);
  const part1Blanks = Form.useWatch(['part1', 'blanks'], form);
  const part3Mapping = Form.useWatch(['part3', 'mapping'], form);
  const part4Mapping = Form.useWatch(['part4', 'mapping'], form);

  // Load existing draft
  const [draftPart3, setDraftPart3] = useState(null);
  const [draftPart4, setDraftPart4] = useState(null);

  useEffect(() => {
    if (!draftId) return;
    let cancelled = false;
    const loadDraft = async () => {
      try {
        const { data } = await QuestionApi.getDetail({ skillName: 'READING', sectionId: draftId });
        if (cancelled) return;
        const d = data.data;

        // Map API keys (part1, part2, part3, part4, part5) to form keys (part1, part2A, part2B, part3, part4)
        const mapPartData = (partKey) => {
          const p = d[partKey];
          if (!p) return {};
          const ac = p.AnswerContent || {};

          if (partKey === 'part1') {
            // Reconstruct blanks from AnswerContent
            const opts = ac.options || [];
            const correctAnswers = ac.correctAnswer || [];
            const blanks = opts.map((opt, idx) => {
              const correctVal = correctAnswers.find(ca => ca.key === opt.key)?.value || '';
              const optValues = opt.value || [];
              const correctIdx = optValues.findIndex(v => v === correctVal);
              return {
                key: opt.key || String(idx),
                options: optValues.map((v, i) => ({ id: i + 1, value: v })),
                correctAnswer: correctIdx >= 0 ? correctIdx + 1 : null,
              };
            });

            // Reverse the buildDropdownContent transformation
            // API returns: "0. (opt1 / opt2)text 1. (opt3 / opt4)"
            // Form needs: "[0]text [1]"
            let rawContent = ac.content || p.Content || '';
            blanks.forEach((b) => {
              const optionsText = (b.options || []).map(o => o.value).join(' / ');
              const formatted = `${b.key}. (${optionsText})`;
              // Escape special regex characters in the formatted string
              const escaped = formatted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              rawContent = rawContent.replace(new RegExp(escaped, 'g'), `[${b.key}]`);
            });

            return {
              part1: {
                name: p.PartName || '',
                content: rawContent,
                blanks,
              },
            };
          }

          if (partKey === 'part2') {
            return {
              part2A: {
                name: p.PartName || '',
                intro: ac.content || p.Content || '',
                items: (ac.options || []).map((t) => ({ text: typeof t === 'string' ? t : t.key || t.text || '' })),
              },
            };
          }

          if (partKey === 'part3') {
            return {
              part2B: {
                name: p.PartName || '',
                intro: ac.content || p.Content || '',
                items: (ac.options || []).map((t) => ({ text: typeof t === 'string' ? t : t.key || t.text || '' })),
              },
            };
          }

          if (partKey === 'part4') {
            return {
              part3: {
                name: p.PartName || '',
                content: ac.content || p.Content || '',
                leftItems: (ac.leftItems || []).map((t, i) => ({ id: i + 1, text: typeof t === 'string' ? t : t.text || '' })),
                rightItems: (ac.rightItems || []).map((t, i) => ({ id: i + 1, text: typeof t === 'string' ? t : t.text || '' })),
                mapping: (ac.correctAnswer || []).map((m, i) => {
                  const leftIdx = (ac.leftItems || []).indexOf(m.left);
                  const rightIdx = (ac.rightItems || []).findIndex(t => (typeof t === 'string' ? t : t.text) === m.right);
                  return {
                    leftIndex: leftIdx >= 0 ? leftIdx : i,
                    rightId: rightIdx >= 0 ? rightIdx + 1 : null,
                  };
                }),
              },
            };
          }

          if (partKey === 'part5') {
            return {
              part4: {
                name: p.PartName || '',
                content: ac.content || p.Content || '',
                leftItems: (ac.leftItems || []).map((t, i) => ({ id: i + 1, text: typeof t === 'string' ? t : t.text || '' })),
                rightItems: (ac.rightItems || []).map((t, i) => ({ id: i + 1, text: typeof t === 'string' ? t : t.text || '' })),
                mapping: (ac.correctAnswer || []).map((m, i) => {
                  const leftIdx = (ac.leftItems || []).indexOf(m.left);
                  const rightIdx = (ac.rightItems || []).findIndex(t => (typeof t === 'string' ? t : t.text) === m.right);
                  return {
                    leftIndex: leftIdx >= 0 ? leftIdx : i,
                    rightId: rightIdx >= 0 ? rightIdx + 1 : null,
                  };
                }),
              },
            };
          }

          return {};
        };

        const formValues = {
          sectionName: d.SectionName || '',
          description: d.Description || '',
          ...mapPartData('part1'),
          ...mapPartData('part2'),
          ...mapPartData('part3'),
          ...mapPartData('part4'),
          ...mapPartData('part5'),
        };

        form.setFieldsValue(formValues);

        // Store draft data for matching editors
        setDraftPart3(formValues.part3 || null);
        setDraftPart4(formValues.part4 || null);

      } catch (error) {
        message.error('Failed to load draft');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadDraft();
    return () => { cancelled = true; };
  }, [draftId]);

  const scheduleAutosave = useCallback((payload) => {
    payloadRef.current = payload;
    setIsAutosaving(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      if (payloadRef.current && draftIdRef.current) {
        try {
          await QuestionApi.update({ sectionId: draftIdRef.current, payload: payloadRef.current });
        } catch (error) {
        } finally {
          setIsAutosaving(false);
          payloadRef.current = null;
        }
      } else {
        setIsAutosaving(false);
      }
    }, AUTOSAVE_DEBOUNCE_MS);
  }, []);

  const handleValuesChange = useCallback((changedValues, allValues) => {
    if (draftIdRef.current) {
      try {
        const fullPayload = buildFullReadingPayload(allValues);
        const payload = {
          SkillName: 'READING',
          SectionName: allValues.sectionName || 'Untitled Draft',
          Status: 'draft',
          parts: fullPayload.parts,
        };
        if (changedValues.part3 || changedValues.part4) {
        }
        scheduleAutosave(payload);
      } catch (e) {
      }
    }
  }, [scheduleAutosave]);

  // Autosave when matching mapping changes (useWatch doesn't trigger onValuesChange)
  useEffect(() => {
    if (draftIdRef.current && (part3Mapping || part4Mapping)) {
      const values = form.getFieldsValue(true);
      try {
        const fullPayload = buildFullReadingPayload(values);
        const payload = {
          SkillName: 'READING',
          SectionName: values.sectionName || 'Untitled Draft',
          Status: 'draft',
          parts: fullPayload.parts,
        };
        scheduleAutosave(payload);
      } catch (e) {
      }
    }
  }, [part3Mapping, part4Mapping]);

  const handleSaveAsDraft = async () => {
    const values = form.getFieldsValue(true);
    try {
      const fullPayload = buildFullReadingPayload(values);
      const payload = {
        SkillName: 'READING',
        SectionName: values.sectionName || 'Untitled Draft',
        Status: 'draft',
        parts: fullPayload.parts,
      };
      if (draftIdRef.current) {
        setIsSubmitting(true);
        await QuestionApi.update({ sectionId: draftIdRef.current, payload });
        message.success('Draft saved successfully');
        navigate(-1);
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    try {
      const values = await form.validateFields();
      const fullPayload = buildFullReadingPayload(values);
      const payload = {
        SkillName: 'READING',
        SectionName: values.sectionName,
        Status: 'published',
        parts: fullPayload.parts,
      };

      if (draftIdRef.current) {
        setIsSubmitting(true);
        await QuestionApi.update({ sectionId: draftIdRef.current, payload });
        message.success('Created successfully!');
        navigate('/questions?skillName=READING', { replace: true });
      }
    } catch (err) {
      if (err?.errorFields) {
        message.error(`Validation failed: ${err.errorFields.map(f => f.errors?.[0] || f.name?.join('.')).join('; ')}`);
      } else {
        message.error('Form error — check again!');
      }
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
      onOk: async () => {
        if (draftIdRef.current) {
          try {
            await SectionApi.deleteDraft(draftIdRef.current);
          } catch (e) {
            console.error('Failed to discard draft:', e);
          }
        }
        navigate(-1);
      },
      onCancel: () => {},
    });
  };

  if (!draftId && !isLoading) {
    return <RedirectToNewDraft />;
  }
  if (isLoading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading draft...</div>;
  }

  return (
    <Form
      form={form}
      layout='vertical'
      onValuesChange={handleValuesChange}
      initialValues={{
        part1: { name: '', content: '', blanks: [] },
        part2A: {
          name: '',
          items: [
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
          ],
        },
        part2B: {
          name: '',
          items: [
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
          ],
        },
        part3: { name: '', leftItems: [], rightItems: [], mapping: [] },
        part4: {
          name: '',
          content: '',
          leftItems: [],
          rightItems: [],
          mapping: [],
        },
      }}
    >
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        <Card title='Section information'>
          <Form.Item
            label='Name'
            className='w-full'
            name={'sectionName'}
            required
            getValueFromEvent={(e) => e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '')}
            rules={[{ required: true, message: 'Section name is required' }]}
          >
            <Input maxLength={255} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()\"':]/g, ''); }} placeholder='Enter section name' />
          </Form.Item>
          <Form.Item label='Description' name='description'>
            <Input.TextArea rows={3} placeholder='-' maxLength={510} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, ''); }} />
          </Form.Item>
        </Card>

        {/* PART 1 — DROPDOWN BLANKS */}
        <Card title='Instruction 1'>
          <Form.Item
            label='Part Name'
            name={['part1', 'name']}
            getValueFromEvent={(e) => e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '')}
            rules={[{ required: true, message: 'Part name is required' }]}
          >
            <Input maxLength={255} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()\"':]/g, ''); }} placeholder='Enter Part 1 Name' />
          </Form.Item>

          <Form.Item label='Content' required>
            <DropdownEditor />
          </Form.Item>

          <DropdownBlankOptions />

          <Form.Item shouldUpdate noStyle>
            {({ getFieldValue }) => {
              return (
                <Form.Item
                  name={['part1', '_minBlanks']}
                  validateTrigger='onSubmit'
                  rules={[
                    {
                      validator: () => {
                        const part1 = getFieldValue(['part1']) || {};
                        const blanks = Array.isArray(part1.blanks) ? part1.blanks : [];
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

          <div style={{ marginTop: 12 }}>
            <Typography.Text strong>Preview:</Typography.Text>
            <div style={{ marginTop: 8, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
              <div style={{ fontSize: 16, lineHeight: 2.4, whiteSpace: 'pre-wrap' }}>
                <DropdownPreview
                  content={part1Content}
                  blanks={part1Blanks}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* PART 2A — ORDERING */}
        <Card title='Instruction 2'>
          <Form.Item
            label='Part Name'
            name={['part2A', 'name']}
            getValueFromEvent={(e) => e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '')}
            rules={[{ required: true, message: 'Part name is required' }]}
          >
            <Input maxLength={255} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()\"':]/g, ''); }} placeholder='Enter Part 2A Name' />
          </Form.Item>

          <Form.Item
            label='Content'
            name={['part2A', 'intro']}
            getValueFromEvent={(e) => e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '')}
            rules={[{ required: true, message: 'Content is required' }]}
          >
            <Input maxLength={255} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()\"':]/g, ''); }} />
          </Form.Item>
          <Form.List name={['part2A', 'items']}>
            {(fields, helpers) => (
              <OrderingEditor fields={fields} helpers={helpers} listPath={['part2A', 'items']} />
            )}
          </Form.List>
        </Card>

        {/* PART 2B — ORDERING */}
        <Card title='Instruction 3'>
          <Form.Item
            label='Part Name'
            name={['part2B', 'name']}
            getValueFromEvent={(e) => e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '')}
            rules={[{ required: true, message: 'Part name is required' }]}
          >
            <Input maxLength={255} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()\"':]/g, ''); }} placeholder='Enter Part 2B Name' />
          </Form.Item>

          <Form.Item
            label='Content'
            getValueFromEvent={(e) => e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '')}
            name={['part2B', 'intro']}
            rules={[{ required: true, message: 'Content is required' }]}
          >
            <Input maxLength={255} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()\"':]/g, ''); }} />
          </Form.Item>
          <Form.List name={['part2B', 'items']}>
            {(fields, helpers) => (
              <OrderingEditor fields={fields} helpers={helpers} listPath={['part2B', 'items']} />
            )}
          </Form.List>
        </Card>

        {/* PART 3 — DROPDOWN MATCHING */}
        <Card title='Instruction 4'>
          <Form.Item
            label='Part Name'
            name={['part3', 'name']}
            getValueFromEvent={(e) => e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '')}
            rules={[{ required: true, message: 'Part name is required' }]}
          >
            <Input maxLength={255} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()\"':]/g, ''); }} placeholder='Enter Part 3 Name' />
          </Form.Item>
          <Form.Item
            label='Content'
            name={['part3', 'content']}
            getValueFromEvent={(e) => e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '')}
            rules={[{ required: true, message: 'Content is required' }]}
          >
            <Input.TextArea rows={3} placeholder='Enter content...' maxLength={510} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, ''); }} />
          </Form.Item>

          <MatchingEditor />
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              return (
                <Form.Item
                  name={['part3', '_minItems']}
                  rules={[
                    {
                      validator: () => {
                        const part3 = getFieldValue(['part3']) || {};
                        const left = Array.isArray(part3.leftItems) ? part3.leftItems : [];
                        const right = Array.isArray(part3.rightItems) ? part3.rightItems : [];
                        if (left.length < 1) return Promise.reject(new Error('Instruction 4 must have at least 1 content'));
                        if (right.length < 1) return Promise.reject(new Error('Instruction 4 must have at least 1 option'));
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

        {/* PART 4 — FULL MATCHING */}
        <Card title='Instruction 5'>
          <Form.Item
            label='Part Name'
            name={['part4', 'name']}
            getValueFromEvent={(e) => e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '')}
            rules={[{ required: true, message: 'Part name is required' }]}
          >
            <Input maxLength={255} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()\"':]/g, ''); }} placeholder='Enter Part 4 Name' />
          </Form.Item>
          <Form.Item
            label='Content'
            name={['part4', 'content']}
            getValueFromEvent={(e) => e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '')}
            rules={[{ required: true, message: 'Content is required' }]}
          >
            <Input.TextArea rows={3} placeholder='Enter reading paragraph...' maxLength={510} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, ''); }} />
          </Form.Item>

          <MatchingEditorPart4 />
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              return (
                <Form.Item
                  name={['part4', '_minItems']}
                  rules={[
                    {
                      validator: () => {
                        const part4 = getFieldValue(['part4']) || {};
                        const left = Array.isArray(part4.leftItems) ? part4.leftItems : [];
                        const right = Array.isArray(part4.rightItems) ? part4.rightItems : [];
                        if (left.length < 1) return Promise.reject(new Error('Must have at least 1 content'));
                        if (right.length < 1) return Promise.reject(new Error('Must have at least 1 option'));
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
          <Button
            type='primary'
            onClick={handlePublish}
            loading={isSubmitting || isAutosaving || isPending}
            className='bg-blue-900'
          >
            Publish
          </Button>
        </div>
      </Space>
    </Form>
  );
};

const RedirectToNewDraft = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const createAndRedirect = async () => {
      try {
        const { data } = await SectionApi.createDraft('READING');
        const sectionId = data.data.ID;
        navigate(`/questions/create/reading/${sectionId}`, { replace: true });
      } catch (error) {
        message.error('Failed to create draft');
      }
    };
    createAndRedirect();
  }, []);
  return <div style={{ padding: 40, textAlign: 'center' }}>Creating draft...</div>;
};

export default CreateReading;
