// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input, Button, Form, Card, Modal, message, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, TagsOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

import { QuestionApi, SectionApi } from '../../../../features/questions/api';
import MinioUploadDragger from '@shared/components/MinioUploadDragger';

import { createSpeakingSchema } from '../../schemas/createQuestionSchema';
import { yupSync } from '@shared/lib/utils';
import {
  MAX_QUESTION_INPUT_LENGTH,
  sanitizeQuestionInput,
} from '@shared/lib/questionInput';

const AUTOSAVE_DEBOUNCE_MS = 2000;

const CreateSpeaking = ({ draftId: propDraftId }) => {
  const navigate = useNavigate();
  const { draftId: urlDraftId } = useParams();
  const draftId = propDraftId || urlDraftId;
  const [form] = Form.useForm();

  const [images, setImages] = useState({});
  const imagesRef = useRef({});
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!draftId);
  const [formKey, setFormKey] = useState(0);
  const debounceTimerRef = useRef(null);
  const payloadRef = useRef(null);
  const draftIdRef = useRef(draftId);
  const draftDataRef = useRef(null);
  const [tags, setTags] = useState([]);

  // Keep ref in sync
  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);

  // Load existing draft from URL
  useEffect(() => {
    if (!draftId) return;

    let cancelled = false;
    const loadDraft = async () => {
      try {
        const { data } = await QuestionApi.getDetail({ skillName: 'SPEAKING', sectionId: draftId });
        if (cancelled) return;

        const d = data.data;
        const partMap = {};
        const imgMap = {};
        const parts = Object.keys(d).filter((k) => typeof k === 'string' && k.startsWith('part'));

        parts.forEach((key) => {
          const p = d[key];
          // API returns lowercase: name, questions, image
          // or uppercase: PartName, Questions, Image (from buildSpeakingDetail)
          const questions = (p.questions || p.Questions || []).map((q) => {
            if (typeof q === 'string') {
              return { value: q, type: 'speaking' };
            }
            return {
              id: q.ID,
              value: q.Content || '',
              type: q.Type || 'speaking',
              sequence: q.Sequence,
              content: q.Content || '',
            };
          });

          const filledQuestions = questions.length > 0 ? questions : [{ value: '' }, { value: '' }, { value: '' }];

          partMap[key] = {
            name: p.name || p.PartName || '',
            image: p.image || p.Image || null,
            questions: filledQuestions,
          };
          if (p.image || p.Image) {
            imgMap[key] = p.image || p.Image;
          }
        });

        // Force form re-render with new key so initialValues are applied correctly
        setImages(imgMap);
        imagesRef.current = imgMap;
        // Store draft data in a ref for initialValues
        draftDataRef.current = { sectionName: d.SectionName, parts: partMap };
        console.log('[DRAFT LOAD] Raw API response:', JSON.stringify(d, null, 2));
        console.log('[DRAFT LOAD] Mapped partMap:', JSON.stringify(partMap, null, 2));
        setFormKey((prev) => prev + 1);
      } catch (error) {
        console.error('Failed to load draft:', error);
        message.error('Failed to load draft');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadDraft();
    return () => { cancelled = true; };
  }, [draftId]);

  // Autosave logic
  const scheduleAutosave = useCallback((payload) => {
    payloadRef.current = payload;
    setIsAutosaving(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (payloadRef.current && draftIdRef.current) {
        try {
          await QuestionApi.update({ sectionId: draftIdRef.current, payload: payloadRef.current });
        } catch (error) {
          console.error('Autosave failed:', error);
        } finally {
          setIsAutosaving(false);
          payloadRef.current = null;
        }
      } else {
        setIsAutosaving(false);
      }
    }, AUTOSAVE_DEBOUNCE_MS);
  }, []);

  const handleValuesChange = (changedValues, allValues) => {
    imagesRef.current = { ...imagesRef.current };
    if (draftIdRef.current) {
      scheduleAutosave(buildPayload(allValues, imagesRef.current));
    }
  };

  // Autosave when tags change
  useEffect(() => {
    if (draftIdRef.current && tags) {
      const values = form.getFieldsValue(true);
      scheduleAutosave(buildPayload(values, imagesRef.current));
    }
  }, [tags]);

  const buildPayload = (values, imgs, status = 'draft') => {
    const buildPartQuestions = (questions) =>
      (questions || []).map((q, idx) => ({
        id: q.id || null,
        type: q.type || 'speaking',
        sequence: idx + 1,
        content: q.value || '',
      }));

    return {
      SkillName: 'SPEAKING',
      SectionName: values?.sectionName || 'Untitled Draft',
      Status: status,
      tags: tags,
      parts: {
        part1: { name: values?.parts?.part1?.name, image: imgs?.part1, sequence: 1, questions: buildPartQuestions(values?.parts?.part1?.questions) },
        part2: { name: values?.parts?.part2?.name, image: imgs?.part2, sequence: 2, questions: buildPartQuestions(values?.parts?.part2?.questions) },
        part3: { name: values?.parts?.part3?.name, image: imgs?.part3, sequence: 3, questions: buildPartQuestions(values?.parts?.part3?.questions) },
        part4: { name: values?.parts?.part4?.name, image: imgs?.part4, sequence: 4, questions: buildPartQuestions(values?.parts?.part4?.questions) },
      },
    };
  };

  const handleSaveAsDraft = async () => {
    if (!draftIdRef.current) {
      message.warning('No draft to save');
      return;
    }
    const values = form.getFieldsValue(true);
    const payload = buildPayload(values, imagesRef.current, 'draft');

    try {
      await QuestionApi.update({ sectionId: draftIdRef.current, payload });
      message.success('Draft saved successfully');
      navigate(-1);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save draft');
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

  const handlePublish = async () => {
    try {
      const values = await form.validateFields();
      const payload = buildPayload(values, imagesRef.current, 'published');

      if (draftIdRef.current) {
        await QuestionApi.update({ sectionId: draftIdRef.current, payload });
        message.success('Question published successfully');
        navigate(-1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = useCallback((key, url) => {
    setImages((prev) => {
      const next = { ...prev, [key]: url };
      imagesRef.current = next;
      return next;
    });
    form.setFieldsValue({
      parts: {
        ...form.getFieldValue('parts'),
        [key]: {
          ...form.getFieldValue(['parts', key]),
          image: url,
        },
      },
    });
    form.validateFields([['parts', key, 'image']]);
  }, [form]);

  const renderPart = (key, title) => {
    const isRequiredImage = key !== 'part1';

    return (
      <Card title={title} className='mb-6 border rounded-lg shadow-sm'>
        <Form.Item
          label='Part Name'
          name={['parts', key, 'name']}
          getValueFromEvent={(e) => sanitizeQuestionInput(e.target.value)}
          rules={[yupSync(createSpeakingSchema, ['parts', key, 'name'])]}
          validateTrigger={['onChange', 'onBlur']}
          required
        >
          <Input
            maxLength={MAX_QUESTION_INPUT_LENGTH}
            placeholder='Enter part name'
          />
        </Form.Item>

        <Form.Item
          required={isRequiredImage}
          label='Picture'
          name={['parts', key, 'image']}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!isRequiredImage) return Promise.resolve();
                if (value) return Promise.resolve();
                return Promise.reject(
                  'Picture is required for this instruction'
                );
              },
            }),
          ]}
        >
          <MinioUploadDragger
            accept='.jpg,.jpeg,.png'
            allowedMimeTypes={['image/jpeg', 'image/png']}
            bucketType='images'
            hint='Drop a JPG or PNG image here or click to browse'
            listType='picture'
            onChange={(url) => handleImageChange(key, url)}
            title='Upload instruction image'
            value={images[key]}
          />
        </Form.Item>

        <Form.List name={['parts', key, 'questions']}>
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <div key={field.key} className='flex gap-3 mb-4'>
                  <div className='w-8 h-8 bg-blue-900 text-white flex items-center justify-center rounded-full'>
                    {field.name + 1}
                  </div>

                  <Form.Item
                    {...field}
                    className='w-full'
                    name={[field.name, 'value']}
                    getValueFromEvent={(e) =>
                      sanitizeQuestionInput(e.target.value)
                    }
                    rules={[
                      yupSync(createSpeakingSchema, [
                        'parts',
                        key,
                        'questions',
                        field.name,
                        'value',
                      ]),
                    ]}
                    validateTrigger={['onChange', 'onBlur']}
                  >
                    <Input
                      maxLength={MAX_QUESTION_INPUT_LENGTH}
                      placeholder='Enter question'
                    />
                  </Form.Item>

                  {field.name >= 3 && (
                    <Button
                      type='text'
                      icon={<DeleteOutlined className='text-red-500' />}
                      onClick={() => remove(field.name)}
                    />
                  )}
                </div>
              ))}

              <Button
                icon={<PlusOutlined />}
                onClick={() => add({ value: '' })}
                type='dashed'
                className='border-blue-900 text-blue-900'
              >
                Add More Question
              </Button>
            </>
          )}
        </Form.List>
      </Card>
    );
  };

  // If no draftId in URL, create one and redirect
  if (!draftId && !isLoading) {
    return <RedirectToNewDraft />;
  }

  if (isLoading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading draft...</div>;
  }

  return (
    <Form
      key={formKey}
      form={form}
      layout='vertical'
      onValuesChange={handleValuesChange}
      initialValues={draftDataRef.current || {
        parts: {
          part1: { questions: [{ value: '' }, { value: '' }, { value: '' }] },
          part2: { questions: [{ value: '' }, { value: '' }, { value: '' }] },
          part3: { questions: [{ value: '' }, { value: '' }, { value: '' }] },
          part4: { questions: [{ value: '' }, { value: '' }, { value: '' }] },
        },
      }}
    >
      <Card title='Section information' className='mb-5'>
        <Form.Item
          label='Name'
          name='sectionName'
          getValueFromEvent={(e) => sanitizeQuestionInput(e.target.value)}
          rules={[{ required: true, message: 'Section name is required' }]}
        >
          <Input
            maxLength={MAX_QUESTION_INPUT_LENGTH}
            placeholder='Enter section name'
          />
        </Form.Item>
        <Form.Item label='Tags'>
          <Select
            mode='tags'
            placeholder='Add tags for this section'
            value={tags}
            onChange={setTags}
            style={{ width: '100%' }}
            tokenSeparators={[',']}
          />
        </Form.Item>
      </Card>

      {renderPart('part1', 'Instruction 1')}
      {renderPart('part2', 'Instruction 2')}
      {renderPart('part3', 'Instruction 3')}
      {renderPart('part4', 'Instruction 4')}

      <div className='flex justify-end gap-4 mt-6'>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSaveAsDraft} loading={isAutosaving}>
          <SaveOutlined /> Save as Draft
        </Button>
        <Button
          type='primary'
          onClick={handlePublish}
          loading={isAutosaving}
          className='bg-blue-900'
        >
          Publish
        </Button>
      </div>
    </Form>
  );
};

// Component that creates a draft and redirects
const RedirectToNewDraft = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const createAndRedirect = async () => {
      try {
        const { data } = await SectionApi.createDraft('SPEAKING');
        const sectionId = data.data.ID;
        navigate(`/questions/create/speaking/${sectionId}`, { replace: true });
      } catch (error) {
        console.error('Failed to create draft:', error);
        message.error('Failed to create draft');
      }
    };
    createAndRedirect();
  }, []);

  return <div style={{ padding: 40, textAlign: 'center' }}>Creating draft...</div>;
};

export default CreateSpeaking;
