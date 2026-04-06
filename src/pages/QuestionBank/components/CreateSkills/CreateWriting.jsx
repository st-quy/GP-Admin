// CreateWriting.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, message, Form, Input, Modal } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

import WritingEditor from './Writing/WritingEditor';
import { WRITING_PART_TYPES } from '@features/questions/constant/writingType';
import { buildWritingFullPayload } from '@features/questions/utils/buildQuestionPayload';
import { QuestionApi, SectionApi } from '@features/questions/api';
import {
  MAX_QUESTION_INPUT_LENGTH,
  sanitizeQuestionInput,
} from '@shared/lib/questionInput';

const AUTOSAVE_DEBOUNCE_MS = 2000;

const CreateWriting = ({ draftId: propDraftId }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { draftId: urlDraftId } = useParams();
  const draftId = propDraftId || urlDraftId;

  const [isAutosaving, setIsAutosaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!draftId);
  const debounceTimerRef = useRef(null);
  const payloadRef = useRef(null);
  const draftIdRef = useRef(draftId);

  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);

  // Load existing draft
  useEffect(() => {
    if (!draftId) return;
    let cancelled = false;
    const loadDraft = async () => {
      try {
        console.log('[WRITING DRAFT] Loading draft:', draftId);
        const { data } = await QuestionApi.getDetail({ skillName: 'WRITING', sectionId: draftId });
        if (cancelled) return;
        const d = data.data;
        console.log('[WRITING DRAFT] Raw API response:', JSON.stringify(d, null, 2));

        form.setFieldsValue({
          sectionName: d.SectionName || '',
          part1: {
            PartID: d.part1?.PartID,
            title: d.part1?.name || '',
            questions: (d.part1?.questions || []).map((q) => ({ question: q.question || '' })),
          },
          part2: {
            PartID: d.part2?.PartID,
            title: d.part2?.name || '',
            question: d.part2?.question || '',
            fields: [''],
          },
          part3: {
            PartID: d.part3?.PartID,
            title: d.part3?.name || '',
            chats: (d.part3?.chats || []).map((c) => ({
              speaker: c.speaker || '',
              question: c.question || '',
              wordLimit: '',
            })),
          },
          part4: {
            PartID: d.part4?.PartID,
            partName: d.part4?.name || '',
            emailText: d.part4?.emailText || '',
            q1: d.part4?.q1 || '',
            q1_wordLimit: d.part4?.q1_wordLimit || '',
            q2: d.part4?.q2 || '',
            q2_wordLimit: d.part4?.q2_wordLimit || '',
          },
        });

        console.log('[WRITING DRAFT] Form populated successfully');
      } catch (error) {
        console.error('[WRITING DRAFT] Failed to load draft:', error);
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
          console.log('[WRITING AUTOSAVE] Sending payload:', JSON.stringify(payloadRef.current, null, 2).substring(0, 500) + '...');
          await QuestionApi.update({ sectionId: draftIdRef.current, payload: payloadRef.current });
          console.log('[WRITING AUTOSAVE] Success');
        } catch (error) {
          console.error('[WRITING AUTOSAVE] Failed:', error.response?.data || error.message);
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
        const fullPayload = buildWritingFullPayload(allValues);
        const payload = {
          SkillName: 'WRITING',
          SectionName: allValues.sectionName || 'Untitled Draft',
          Status: 'draft',
          parts: fullPayload.parts,
        };
        console.log('[WRITING VALUES CHANGE] Triggered. Changed:', Object.keys(changedValues).join(', '));
        scheduleAutosave(payload);
      } catch (e) {
        console.warn('[WRITING VALUES CHANGE] Payload build failed:', e.message);
      }
    }
  }, [scheduleAutosave]);

  const handleSaveAsDraft = async () => {
    const values = form.getFieldsValue(true);
    try {
      const fullPayload = buildWritingFullPayload(values);
      const payload = {
        SkillName: 'WRITING',
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
      console.error('[WRITING SAVE DRAFT] Failed:', err);
      message.error(err?.response?.data?.message || 'Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    try {
      const values = await form.validateFields();
      const fullPayload = buildWritingFullPayload(values);
      const payload = {
        SkillName: 'WRITING',
        SectionName: values.sectionName,
        Status: 'published',
        parts: fullPayload.parts,
      };

      if (draftIdRef.current) {
        setIsSubmitting(true);
        await QuestionApi.update({ sectionId: draftIdRef.current, payload });
        message.success('Writing test published successfully!');
        navigate(-1);
      }
    } catch (err) {
      console.error('[WRITING PUBLISH] Failed:', err);
      if (err?.errorFields) {
        message.error(`Validation failed: ${err.errorFields.map(f => f.name.join('.')).join(', ')}`);
      } else {
        message.error(err?.response?.data?.message || 'Validation failed. Please check inputs.');
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
        sectionName: '',
        part1: { title: '', questions: [{ question: '' }] },
        part2: { title: '', question: '', wordLimit: '', fields: [''] },
        part3: {
          title: '',
          chats: [{ speaker: '', question: '', wordLimit: '' }],
        },
        part4: {
          emailText: '',
          q1: '',
          q1_wordLimit: '',
          q2: '',
          q2_wordLimit: '',
        },
      }}
      className='flex flex-col gap-8 pb-20'
    >
      {/* SECTION INFO */}
      <Card title='Section Information'>
        <Form.Item
          label='Section Name'
          name='sectionName'
          getValueFromEvent={(e) => sanitizeQuestionInput(e.target.value)}
          rules={[{ required: true, message: 'Section name is required' }]}
        >
          <Input
            maxLength={MAX_QUESTION_INPUT_LENGTH}
            placeholder='e.g., Fitness Club Writing Test'
          />
        </Form.Item>
      </Card>

      {/* ===== PART 1 ===== */}
      <Card title='Part 1 — Short Answers'>
        <WritingEditor
          partType={WRITING_PART_TYPES.PART1_SHORT_ANSWERS}
          requireImage={false}
        />
      </Card>

      {/* ===== PART 2 ===== */}
      <Card title='Part 2 — Form Filling'>
        <WritingEditor
          partType={WRITING_PART_TYPES.PART2_FORM_FILLING}
          requireImage={true}
        />
      </Card>

      {/* ===== PART 3 ===== */}
      <Card title='Part 3 — Chat Room'>
        <WritingEditor
          partType={WRITING_PART_TYPES.PART3_CHAT_ROOM}
          requireImage={true}
        />
      </Card>

      {/* ===== PART 4 ===== */}
      <Card title='Part 4 — Email Writing'>
        <WritingEditor
          partType={WRITING_PART_TYPES.PART4_EMAIL_WRITING}
          requireImage={true}
        />
      </Card>

      {/* ACTION BUTTONS */}
      <div className='flex justify-end gap-4'>
        <Button size='large' onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          size='large'
          loading={isSubmitting || isAutosaving}
          onClick={handleSaveAsDraft}
        >
          <SaveOutlined /> Save as Draft
        </Button>
        <Button
          type='primary'
          size='large'
          loading={isSubmitting || isAutosaving}
          className='bg-blue-900'
          onClick={handlePublish}
        >
          Publish
        </Button>
      </div>
    </Form>
  );
};

const RedirectToNewDraft = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const createAndRedirect = async () => {
      try {
        console.log('[WRITING REDIRECT] Creating draft for WRITING...');
        const { data } = await SectionApi.createDraft('WRITING');
        const sectionId = data.data.ID;
        console.log('[WRITING REDIRECT] Created draft:', sectionId, 'Redirecting...');
        navigate(`/questions/create/writing/${sectionId}`, { replace: true });
      } catch (error) {
        console.error('[WRITING REDIRECT] Failed:', error);
        message.error('Failed to create draft');
      }
    };
    createAndRedirect();
  }, []);
  return <div style={{ padding: 40, textAlign: 'center' }}>Creating draft...</div>;
};

export default CreateWriting;
