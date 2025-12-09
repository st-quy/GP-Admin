// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Input, Button, Upload, Form, Card, Spin, message } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

import axiosInstance from '@shared/config/axios';
import {
  useGetQuestionGroupDetail,
  useUpdateQuestionGroup,
} from '@features/questions/hooks';

import { createSpeakingSchema } from '../../schemas/createQuestionSchema';
import { yupSync } from '@shared/lib/utils';

const UpdateSpeaking = () => {
  const navigate = useNavigate();
  const { id: sectionId } = useParams();
  const [form] = Form.useForm();

  const [images, setImages] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});

  const { data, isFetching } = useGetQuestionGroupDetail('SPEAKING', sectionId);
  const { mutate: updateSpeaking, isPending } = useUpdateQuestionGroup();

  /** =================================================================
   * 1. Fill form khi fetch xong
   * ================================================================= */
  useEffect(() => {
    if (!data) return;

    const mapQuestions = (part) => {
      if (!part?.questions) return [];

      return part.questions.map((q, idx) => ({
        id: q.ID,
        value: q.Content || '',
        type: q.Type || 'speaking',
        sequence: q.Sequence || idx + 1,
        content: q.Content || '',
      }));
    };

    form.setFieldsValue({
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
    });

    setImages({
      part1: data.part1?.image,
      part2: data.part2?.image,
      part3: data.part3?.image,
      part4: data.part4?.image,
    });
  }, [data]);

  /** =================================================================
   * 2. Validate file upload
   * ================================================================= */
  const beforeUpload = (file, partKey) => {
    const valid = file.type === 'image/jpeg' || file.type === 'image/png';

    if (!valid) {
      setUploadErrors((prev) => ({
        ...prev,
        [partKey]: 'Only JPG or PNG allowed',
      }));
      return Upload.LIST_IGNORE;
    }

    if (file.size / 1024 / 1024 >= 10) {
      setUploadErrors((prev) => ({
        ...prev,
        [partKey]: 'Image must be smaller than 10MB',
      }));
      return Upload.LIST_IGNORE;
    }

    setUploadErrors((prev) => ({ ...prev, [partKey]: null }));
    return true;
  };

  /** =================================================================
   * 3. Upload Presigned URL
   * ================================================================= */
  const uploadProps = (partKey) => ({
    maxCount: 1,
    listType: 'picture-card',
    beforeUpload: (file) => beforeUpload(file, partKey),

    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const { data } = await axiosInstance.post('/presigned-url/upload-url', {
          fileName: file.name,
          type: 'images',
        });

        await fetch(data.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        setImages((prev) => ({ ...prev, [partKey]: data.fileUrl }));
        form.setFieldValue(['parts', partKey, 'image'], data.fileUrl);

        onSuccess({ fileUrl: data.fileUrl });
      } catch (e) {
        onError(e);
      }
    },

    onPreview: () => {
      const src = images[partKey];
      if (src) window.open(src, '_blank');
    },
  });

  /** =================================================================
   * 4. Submit → gửi format chuẩn BE cần
   * ================================================================= */
  const mapPartPayload = (part, index, imageUrl) => ({
    id: part.id,
    name: part.name,
    image: imageUrl,
    sequence: index + 1,
    questions: part.questions?.map((q, idx) => ({
      id: q.id || null,
      type: q.type || 'speaking',
      sequence: idx + 1,
      content: q.value || '',
    })),
  });

  const handleSubmit = (values) => {
    const payload = {
      SkillName: 'SPEAKING',
      SectionName: values.sectionName,
      parts: {
        part1: mapPartPayload(values.parts.part1, 0, images.part1),
        part2: mapPartPayload(values.parts.part2, 1, images.part2),
        part3: mapPartPayload(values.parts.part3, 2, images.part3),
        part4: mapPartPayload(values.parts.part4, 3, images.part4),
      },
    };

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

  /** =================================================================
   * 5. Validate before submit
   * ================================================================= */
  const handleBeforeSubmit = async () => {
    try {
      await form.validateFields();
      form.submit();
    } catch (err) {
      message.error('Please complete all required fields!');
    }
  };

  /** =================================================================
   * 6. Render Part UI
   * ================================================================= */
  const renderPart = (key, title) => (
    <Card title={title} className='mb-6 border rounded-lg shadow-sm'>
      <Form.Item name={['parts', key, 'id']} hidden>
        <Input />
      </Form.Item>

      <Form.Item
        label='Part Name'
        name={['parts', key, 'name']}
        rules={[
          { required: true, message: 'Part name is required' },
          yupSync(createSpeakingSchema, ['parts', key, 'name']),
        ]}
      >
        <Input placeholder='Enter part name' />
      </Form.Item>

      <Form.Item
        label='Picture'
        name={['parts', key, 'image']}
        // rules={[{ required: true, message: 'Image is required!' }]}
        // help={uploadErrors[key]}
        // validateStatus={uploadErrors[key] ? 'error' : ''}
      >
        <Upload {...uploadProps(key)}>
          {!images[key] ? (
            <div style={{ textAlign: 'center' }}>
              <CloudUploadOutlined style={{ fontSize: 40 }} />
              <div>Upload</div>
            </div>
          ) : (
            <img
              src={images[key]}
              alt='preview'
              style={{ width: '100%', borderRadius: 8 }}
            />
          )}
        </Upload>
      </Form.Item>

      <Form.List name={['parts', key, 'questions']}>
        {(fields, { add, remove }) => (
          <>
            {fields.map((f) => (
              <div key={f.key} className='flex gap-3 mb-4'>
                <Form.Item name={[f.name, 'id']} hidden>
                  <Input />
                </Form.Item>
                <Form.Item
                  name={[f.name, 'type']}
                  hidden
                  initialValue={'speaking'}
                >
                  <Input />
                </Form.Item>
                <Form.Item name={[f.name, 'content']} hidden initialValue={{}}>
                  <Input />
                </Form.Item>

                <div className='w-8 h-8 bg-blue-900 text-white flex items-center justify-center rounded-full'>
                  {f.name + 1}
                </div>

                <Form.Item
                  {...f}
                  className='w-full'
                  name={[f.name, 'value']}
                  rules={[
                    { required: true, message: 'Question cannot be empty' },
                  ]}
                >
                  <Input placeholder='Enter question' />
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
              onClick={() =>
                add({
                  id: null,
                  value: '',
                  type: 'speaking',
                  sequence: fields.length + 1,
                  content: {},
                })
              }
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

  if (isFetching) return <Spin size='large' />;

  return (
    <div>
      <Form form={form} layout='vertical' onFinish={handleSubmit}>
        <Card title='Section information' className='mb-5'>
          <Form.Item
            label='Name'
            name={'sectionName'}
            rules={[{ required: true, message: 'Section name is required' }]}
          >
            <Input placeholder='Enter section name' />
          </Form.Item>
        </Card>

        {renderPart('part1', 'Instruction 1')}
        {renderPart('part2', 'Instruction 2')}
        {renderPart('part3', 'Instruction 3')}
        {renderPart('part4', 'Instruction 4')}

        <div className='flex justify-end gap-4 mt-6'>
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button
            type='primary'
            className='bg-blue-900'
            onClick={handleBeforeSubmit}
          >
            Update
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default UpdateSpeaking;
