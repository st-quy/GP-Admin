import React, { useState } from 'react';
import { Input, Button, Upload, Form, Card } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import axiosInstance from '@shared/config/axios';
import { useCreateQuestion } from '../../../../features/questions/hooks';

import { createSpeakingSchema } from '../../schemas/createQuestionSchema';
import { yupSync } from '@shared/lib/utils';

const CreateSpeaking = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { mutate: createSpeaking, isPending } = useCreateQuestion();
  const [images, setImages] = useState({});
  const [fileLists, setFileLists] = useState({
    part1: [],
    part2: [],
    part3: [],
    part4: [],
  });

  /** Validate file type + size */
  const beforeUpload = (file) => {
    const valid = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!valid) return Upload.LIST_IGNORE;

    if (file.size / 1024 / 1024 >= 10) return Upload.LIST_IGNORE;
    return true;
  };

  /** Upload logic */
  const uploadProps = (partKey) => ({
    maxCount: 1,
    listType: 'picture-card',
    beforeUpload,

    onChange(info) {
      // Khi user vừa chọn file → thêm vào fileList để hiển thị loading
      if (info.file.status === 'uploading') {
        setFileLists((prev) => ({
          ...prev,
          [partKey]: [
            {
              uid: info.file.uid,
              name: info.file.name,
              status: 'uploading',
              percent: 0,
            },
          ],
        }));
      }
    },

    customRequest: async ({ file, onSuccess, onError, onProgress }) => {
      try {
        const { data } = await axiosInstance.post('/presigned-url/upload-url', {
          fileName: file.name,
          type: 'images',
        });

        const { uploadUrl, fileUrl } = data;

        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          const total = event.total || file.size; // fallback
          const percent = Math.round((event.loaded / total) * 100);

          setFileLists((prev) => ({
            ...prev,
            [partKey]: prev[partKey].map((f) =>
              f.uid === file.uid ? { ...f, status: 'uploading', percent } : f
            ),
          }));

          onProgress({ percent });
        };

        xhr.onload = function () {
          if (xhr.status === 200) {
            setFileLists((prev) => ({
              ...prev,
              [partKey]: [
                {
                  uid: file.uid,
                  name: file.name,
                  status: 'done',
                  url: fileUrl,
                },
              ],
            }));

            setImages((prev) => ({ ...prev, [partKey]: fileUrl }));

            form.setFieldsValue({
              parts: {
                ...form.getFieldValue('parts'),
                [partKey]: {
                  ...form.getFieldValue(['parts', partKey]),
                  image: fileUrl,
                },
              },
            });

            onSuccess({ fileUrl });
          } else {
            onError(new Error('Upload failed'));
          }
        };

        xhr.onerror = function () {
          onError(new Error('Upload error'));
        };

        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      } catch (err) {
        onError(err);
      }
    },

    onRemove: () => {
      setImages((prev) => ({ ...prev, [partKey]: null }));
      setFileLists((prev) => ({ ...prev, [partKey]: [] }));
      form.setFieldsValue({
        parts: {
          ...form.getFieldValue('parts'),
          [partKey]: {
            ...form.getFieldValue(['parts', partKey]),
            image: null,
          },
        },
      });
      return true;
    },

    onPreview: (file) => {
      const src = file.url || file.response?.fileUrl;
      if (src) window.open(src);
    },

    fileList: fileLists[partKey],
  });

  /** FE → BE Payload */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

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
    } catch (err) {
      console.error(err);
    }
  };

  /** Render mỗi Instruction */
  const renderPart = (key, title) => {
    const isRequiredImage = key !== 'part1';

    return (
      <Card title={title} className='mb-6 border rounded-lg shadow-sm'>
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

        {/* UPLOAD FIELD WITH VALIDATION */}
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
          <Upload {...uploadProps(key)}>
            {fileLists[key].length === 0 ||
            fileLists[key][0].status === 'done' ? (
              <div style={{ textAlign: 'center' }}>
                <CloudUploadOutlined style={{ fontSize: 40 }} />
                <div>Upload</div>
              </div>
            ) : null}
          </Upload>
        </Form.Item>

        {/* QUESTIONS */}
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
  };

  return (
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
          name='sectionName'
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
  );
};

export default CreateSpeaking;
