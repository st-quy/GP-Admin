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
  const { data, isFetching } = useGetQuestionGroupDetail('SPEAKING', sectionId);
  const { mutate: updateSpeaking, isPending } = useUpdateQuestionGroup();
  const [fileLists, setFileLists] = useState({
    part1: [],
    part2: [],
    part3: [],
    part4: [],
  });

  /** Khi load data → fill cả fileList */
  useEffect(() => {
    if (!data) return;

    setFileLists({
      part1: data.part1?.image
        ? [
            {
              uid: Date.now() + '_1',
              name: 'Image',
              status: 'done',
              url: data.part1.image,
            },
          ]
        : [],
      part2: data.part2?.image
        ? [
            {
              uid: Date.now() + '_2',
              name: 'Image',
              status: 'done',
              url: data.part2.image,
            },
          ]
        : [],
      part3: data.part3?.image
        ? [
            {
              uid: Date.now() + '_3',
              name: 'Image',
              status: 'done',
              url: data.part3.image,
            },
          ]
        : [],
      part4: data.part4?.image
        ? [
            {
              uid: Date.now() + '_4',
              name: 'Image',
              status: 'done',
              url: data.part4.image,
            },
          ]
        : [],
    });
  }, [data]);

  /** ================================================================
   * 1. Fill form khi fetch xong
   * ================================================================ */
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

  /** ================================================================
   * 2. Validate file upload
   * ================================================================ */
  const beforeUpload = (file) => {
    const isValid =
      (file.type === 'image/jpeg' || file.type === 'image/png') &&
      file.size / 1024 / 1024 < 10;

    return isValid || Upload.LIST_IGNORE;
  };

  /** ================================================================
   * 3. Upload Presigned URL
   * ================================================================ */
  /** Upload logic giống Create */
  const uploadProps = (partKey) => ({
    maxCount: 1,
    listType: 'picture-card',
    beforeUpload,

    onChange(info) {
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
          const total = event.total || file.size;
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

            form.validateFields([['parts', partKey, 'image']]);

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

    /** Remove */
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

  /** ================================================================
   * 4. Submit → gửi format chuẩn BE cần
   * ================================================================ */
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

  /** ================================================================
   * 5. Validate before submit
   * ================================================================ */
  const handleBeforeSubmit = async () => {
    try {
      await form.validateFields();
      form.submit();
    } catch (err) {
      message.error('Please complete all required fields!');
    }
  };

  /** ================================================================
   * 6. Render Part UI
   * ================================================================ */
  const renderPart = (key, title) => {
    const isRequiredImage = key !== 'part1';

    return (
      <Card title={title} className='mb-6 border rounded-lg shadow-sm'>
        {/* Part Name */}
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

        {/* Upload with VALIDATION */}
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
          <Upload {...uploadProps(key)}>
            {fileLists[key].length === 0 ? (
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
              {fields.map((f) => (
                <div key={f.key} className='flex gap-3 mb-4'>
                  <div className='w-8 h-8 bg-blue-900 text-white flex items-center justify-center rounded-full'>
                    {f.name + 1}
                  </div>

                  <Form.Item
                    name={[f.name, 'value']}
                    className='w-full'
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

  if (isFetching) return <Spin size='large' />;

  return (
    <div>
      <Form form={form} layout='vertical' onFinish={handleSubmit}>
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
