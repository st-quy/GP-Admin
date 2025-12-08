// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Input, Button, Upload, Form, Card } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import axiosInstance from '@shared/config/axios';
import { useCreateQuestion } from '../../../../features/questions/hooks';
import { useGetPartsBySkillName } from '../../../../features/parts/hooks';

import { createSpeakingSchema } from '../../schemas/createQuestionSchema';
import { yupSync } from '@shared/lib/utils';

const CreateSpeaking = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { mutate: createSpeaking, isPending } = useCreateQuestion();

  const [uploadErrors, setUploadErrors] = useState({});
  const [images, setImages] = useState({});

  /** Validate file type + size */
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
        [partKey]: 'Image must be < 10MB',
      }));
      return Upload.LIST_IGNORE;
    }

    setUploadErrors((prev) => ({ ...prev, [partKey]: null }));
    return true;
  };

  /** Upload (presigned) */
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

        const { uploadUrl, fileUrl } = data;

        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        setImages((prev) => ({ ...prev, [partKey]: fileUrl }));
        onSuccess({ fileUrl });
      } catch (e) {
        onError(e);
      }
    },

    onPreview: (file) => {
      const src = file?.response?.fileUrl || file.url;
      if (src) window.open(src, '_blank');
    },
  });

  /** FE submit → BE SPEAKING chuẩn */
  const handleSubmit = (values) => {
    const payload = {
      SkillName: 'SPEAKING',
      SectionName: values.sectionName,
      parts: {
        part1: { ...values.parts.part1, image: images.part1, sequence: 1 },
        part2: { ...values.parts.part2, image: images.part2, sequence: 2 },
        part3: { ...values.parts.part3, image: images.part3, sequence: 3 },
        part4: { ...values.parts.part4, image: images.part4, sequence: 4 },
      },
    };

    createSpeaking(payload, {
      onSuccess: () => navigate(-1),
    });
  };

  /** Render từng Part UI */
  const renderPart = (key, title) => (
    <Card title={title} className='mb-6 border rounded-lg shadow-sm'>
      {/* Hidden fields — bắt buộc để Form không cache */}
      <Form.Item name={['parts', key, 'id']} hidden>
        <Input />
      </Form.Item>

      <Form.Item name={['parts', key, 'sequence']} hidden>
        <Input />
      </Form.Item>

      {/* Part Name */}
      <Form.Item
        label='Part Name'
        name={['parts', key, 'name']}
        rules={[yupSync(createSpeakingSchema, ['parts', key, 'name'])]}
        validateTrigger={['onChange', 'onBlur']}
        required
      >
        <Input placeholder='Enter part name' />
      </Form.Item>

      {/* Picture Upload */}
      <Form.Item
        label='Picture'
        help={uploadErrors[key]}
        validateStatus={uploadErrors[key] ? 'error' : ''}
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

      {/* Questions */}
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
                  <Input placeholder='Enter question' />
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

  return (
    /** FORCE REMOUNT FORM TO CLEAR ALL CACHE */
    <div>
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
        initialValues={{
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
            className='w-full'
            name={'sectionName'}
            required
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
            htmlType='submit'
            loading={isPending}
            className='bg-blue-900'
          >
            Save
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateSpeaking;
