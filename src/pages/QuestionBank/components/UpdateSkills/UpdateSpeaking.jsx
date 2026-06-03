// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input, Button, Form, Card, Spin, message, Modal, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useGetQuestionGroupDetail,
  useUpdateQuestionGroup,
} from '@features/questions/hooks';
import { useGetAllTags } from '@features/sections/hooks';
import MinioUploadDragger from '@shared/components/MinioUploadDragger';
import { QuestionApi } from '@features/questions/api';

import { createSpeakingSchema } from '../../schemas/createQuestionSchema';
import { yupSync } from '@shared/lib/utils';
import {
  MAX_QUESTION_INPUT_LENGTH,
  sanitizeQuestionInput,
} from '@shared/lib/questionInput';

const AUTOSAVE_DEBOUNCE_MS = 2000;

const UpdateSpeaking = () => {
  const navigate = useNavigate();
  const { id: sectionId } = useParams();
  const [form] = Form.useForm();

  const [images, setImages] = useState({});
  const imagesRef = useRef({});
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const debounceTimerRef = useRef(null);
  const payloadRef = useRef(null);
  const [tags, setTags] = useState([]);
  const [originalStatus, setOriginalStatus] = useState('draft');
  const { data: existingTags = [] } = useGetAllTags();

  const { data, isFetching } = useGetQuestionGroupDetail('SPEAKING', sectionId);
  const { mutate: updateSpeaking, isPending } = useUpdateQuestionGroup();

  // Autosave logic
  const scheduleAutosave = useCallback((payload) => {
    payloadRef.current = payload;
    setIsAutosaving(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (payloadRef.current) {
        try {
          await QuestionApi.update({ sectionId, payload: payloadRef.current });
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
  }, [sectionId]);

  const handleValuesChange = (changedValues, allValues) => {
    imagesRef.current = { ...imagesRef.current };
    const payload = buildPayload(allValues, imagesRef.current, originalStatus);
    scheduleAutosave(payload);
  };

  // Autosave when tags change
  useEffect(() => {
    if (data) {
      const values = form.getFieldsValue(true);
      const payload = buildPayload(values, imagesRef.current, originalStatus);
      scheduleAutosave(payload);
    }
  }, [tags, originalStatus]);

  useEffect(() => {
    if (!data) return;

    const mapQuestions = (part) =>
      (part?.questions || []).map((q, idx) => ({
        id: q.ID,
        value: q.Content || '',
        type: q.Type || 'speaking',
        sequence: q.Sequence || idx + 1,
        content: q.Content || '',
      }));

    const formValues = {
      sectionName: data.SectionName,
      parts: {
        part1: {
          ...data.part1,
          questions: mapQuestions(data.part1),
          image: data.part1?.image,
        },
        part2: {
          ...data.part2,
          questions: mapQuestions(data.part2),
          image: data.part2?.image,
        },
        part3: {
          ...data.part3,
          questions: mapQuestions(data.part3),
          image: data.part3?.image,
        },
        part4: {
          ...data.part4,
          questions: mapQuestions(data.part4),
          image: data.part4?.image,
        },
      },
    };

    form.setFieldsValue(formValues);

    const imgs = {
      part1: data.part1?.image,
      part2: data.part2?.image,
      part3: data.part3?.image,
      part4: data.part4?.image,
    };
    setImages(imgs);
    imagesRef.current = imgs;

    const allTags = new Set();
    Object.keys(data).forEach(key => {
      if (typeof key !== 'string' || !key.startsWith('part')) return;
      const p = data[key];
      (p?.questions || []).forEach(q => {
        (q.Tags || []).forEach(t => allTags.add(t));
      });
    });
    setTags(Array.from(allTags));
    setOriginalStatus(data.Status || 'draft');

    setIsLoading(false);
  }, [data]);

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
        part1: { id: values?.parts?.part1?.id, name: values?.parts?.part1?.name, image: imgs?.part1, sequence: 1, questions: buildPartQuestions(values?.parts?.part1?.questions) },
        part2: { id: values?.parts?.part2?.id, name: values?.parts?.part2?.name, image: imgs?.part2, sequence: 2, questions: buildPartQuestions(values?.parts?.part2?.questions) },
        part3: { id: values?.parts?.part3?.id, name: values?.parts?.part3?.name, image: imgs?.part3, sequence: 3, questions: buildPartQuestions(values?.parts?.part3?.questions) },
        part4: { id: values?.parts?.part4?.id, name: values?.parts?.part4?.name, image: imgs?.part4, sequence: 4, questions: buildPartQuestions(values?.parts?.part4?.questions) },
      },
    };
  };

  const handleSubmit = (values) => {
    const payload = buildPayload(values, imagesRef.current, 'published');

    updateSpeaking(
      { sectionId, payload },
      {
        onSuccess: () => {
          message.success('Update speaking section successfully!');
          navigate(-1);
        },
      }
    );
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

  const handleSaveAsDraft = async () => {
    const values = form.getFieldsValue(true);
    const payload = buildPayload(values, imagesRef.current, 'draft');

    try {
      await QuestionApi.update({ sectionId, payload });
      message.success('Draft saved successfully');
      navigate(-1);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save draft');
    }
  };

  const handleBeforeSubmit = async () => {
    try {
      await form.validateFields();
      form.submit();
    } catch (err) {
      message.error('Please complete all required fields!');
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
          rules={[
            { required: true, message: 'Part name is required' },
            yupSync(createSpeakingSchema, ['parts', key, 'name']),
          ]}
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
            {
              validator(_, value) {
                if (!isRequiredImage) return Promise.resolve();
                if (value) return Promise.resolve();
                return Promise.reject('Picture is required!');
              },
            },
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
              {fields.map((f) => (
                <div key={f.key} className='flex gap-3 mb-4'>
                  <div className='w-8 h-8 bg-blue-900 text-white flex items-center justify-center rounded-full'>
                    {f.name + 1}
                  </div>

                  <Form.Item
                    name={[f.name, 'value']}
                    className='w-full'
                    getValueFromEvent={(e) =>
                      sanitizeQuestionInput(e.target.value)
                    }
                    rules={[
                      { required: true, message: 'Question cannot be empty' },
                    ]}
                  >
                    <Input
                      maxLength={MAX_QUESTION_INPUT_LENGTH}
                      placeholder='Enter question'
                    />
                  </Form.Item>

                  {f.name >= 3 && (
                    <Button
                      type='text'
                      icon={<DeleteOutlined className='text-red-500' />}
                      onClick={() => remove(f.name)}
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

  if (isFetching || isLoading) return <Spin size='large' />;

  return (
    <div className="figma-page-container">
      <div className="figma-content-wrapper">
        <div className="py-8">
          <Form form={form} layout='vertical' onValuesChange={handleValuesChange} onFinish={handleSubmit}>
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
                  options={existingTags.map((t) => ({ label: t, value: t }))}
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
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
                className='bg-blue-900'
                onClick={handleBeforeSubmit}
                loading={isAutosaving || isPending}
              >
                Publish
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default UpdateSpeaking;
