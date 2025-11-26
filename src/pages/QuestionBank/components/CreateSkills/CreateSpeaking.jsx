// @ts-nocheck
import React, { useState } from 'react';
import { Input, Select, Button, Upload, message, Form } from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useCreateQuestion } from '../../../../features/questions/hooks';
import { yupSync } from '@shared/lib/utils';
import { createSpeakingSchema } from '../../schemas/createQuestionSchema';
import axiosInstance from '@shared/config/axios';
import { useGetPartsBySkillName } from '../../../../features/parts/hooks';
const { TextArea } = Input;
const { Dragger } = Upload;

const CreateSpeaking = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { data: speakingParts = [], isLoading: loadingParts } =
    useGetPartsBySkillName('SPEAKING');

  const [questions, setQuestions] = useState([
    { id: 1, value: '' },
    { id: 2, value: '' },
    { id: 3, value: '' },
  ]);

  const { mutate: createSpeaking, isPending: isCreating } = useCreateQuestion();

  const addQuestion = () => {
    const newId =
      questions.length > 0 ? questions[questions.length - 1].id + 1 : 1;
    const newList = [...questions, { id: newId, value: '' }];
    setQuestions(newList);
    form.setFieldsValue({ questions: newList });
  };

  const removeQuestion = (id) => {
    const newList = questions.filter((q) => q.id !== id);
    setQuestions(newList);
    form.setFieldsValue({ questions: newList });
  };

  const updateQuestionValue = (id, newValue) => {
    const updated = questions.map((q) =>
      q.id === id ? { ...q, value: newValue } : q
    );
    setQuestions(updated);
    form.setFieldsValue({ questions: updated });
  };

  const uploadProps = {
    multiple: false,
    maxCount: 1,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const { data } = await axiosInstance.post('/presigned-url/upload-url', {
          fileName: file.name,
          type: 'images',
        });

        const { uploadUrl, fileUrl } = data;

        if (!uploadUrl || !fileUrl) {
          throw new Error('Invalid upload URL response');
        }

        // 2) Upload file trực tiếp lên MinIO
        const res = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
        });
        if (!res.ok) {
          console.error('MinIO upload failed', await res.text());
          throw new Error(`Upload failed with status ${res.status}`);
        }

        // 3) Báo thành công cho AntD Upload
        onSuccess({ fileUrl });
        message.success('Image uploaded successfully');
      } catch (err) {
        console.error('Upload image error:', err);
        onError(err);
        message.error('Upload failed!');
      }
    },
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const { partType, questions: formQuestions, image } = values;

        let imageUrl = null;
        if (Array.isArray(image) && image.length > 0) {
          const file = image[0];
          imageUrl = file?.response?.fileUrl || file.url || null;
        }

        const payload = {
          PartID: partType,
          SkillName: 'SPEAKING',
          PartType: partType,
          Description: '',
          questions: (formQuestions || []).map((q, index) => ({
            Type: 'speaking',
            Content: q.value,
            Sequence: index + 1,
            ImageKeys: imageUrl ? [imageUrl] : [],
            GroupContent: null,
            SubContent: null,
          })),
        };

        createSpeaking(payload);
      })
      .catch((err) => console.log('❌ Validation error:', err));
  };

  const partTypeValue = Form.useWatch('partType', form);

  return (
    <div className='flex flex-col gap-6 pb-10'>
      <Form
        form={form}
        initialValues={{ questions }}
        layout='vertical'
        // Nếu muốn dùng Yup:
        // onFinish={handleSubmit}
      >
        {/* PART INFO */}
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4'>
          <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
            <span className='text-blue-900'>🧩</span> Part Information
          </h3>

          <div className='grid grid-cols-1 gap-6'>
            <Form.Item
              name='partType'
              label='Type'
              rules={[{ required: true, message: 'Please select a part type' }]}
              required
            >
              <Select
                placeholder='Choose part type'
                size='large'
                options={
                  speakingParts?.map((part) => ({
                    value: part.ID,
                    label: part.Content,
                  })) ?? []
                }
              />
            </Form.Item>
          </div>
        </div>

        {/* QUESTIONS LIST */}
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4'>
          <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
            <span className='text-blue-900'>📃</span> Instruction
          </h3>
          <div className='flex flex-col gap-4'>
            {questions.map((q, index) => (
              <div key={q.id} className='flex w-full items-center gap-3'>
                <div className='p-2 w-10 h-full flex justify-center bg-[#1E3A8A] rounded-full text-white'>
                  {partTypeValue === 'part4' ? '+' : index + 1}
                </div>
                <Form.Item
                  name={['questions', index, 'value']}
                  rules={[
                    { required: true, message: 'Question cannot be empty' },
                  ]}
                  className='w-full m-0'
                >
                  <Input
                    value={q.value}
                    onChange={(e) => updateQuestionValue(q.id, e.target.value)}
                    placeholder='Enter question'
                    size='large'
                  />
                </Form.Item>
                {index + 1 > 3 && (
                  <Button
                    type='text'
                    icon={
                      <DeleteOutlined className='text-red-500 hover:text-red-700' />
                    }
                    onClick={() => removeQuestion(q.id)}
                  />
                )}
              </div>
            ))}

            <Button
              type='dashed'
              icon={<PlusOutlined />}
              onClick={addQuestion}
              className='w-48 mt-2 border-blue-900 text-blue-900 font-medium'
              size='large'
            >
              Add More Question
            </Button>
          </div>
        </div>

        {/* MEDIA */}
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
            <span className='text-blue-900'>📎</span> Media Attachments
          </h3>
          <Form.Item
            name='image'
            valuePropName='fileList'
            getValueFromEvent={(e) => e?.fileList}
          >
            <Dragger
              {...uploadProps}
              style={{ background: 'transparent', border: 'none' }}
            >
              <p className='ant-upload-drag-icon'>
                <CloudUploadOutlined
                  style={{ color: '#9CA3AF', fontSize: '48px' }}
                />
              </p>
              <p className='text-gray-600 font-medium text-lg'>
                Upload image file
              </p>
              <p className='text-gray-400 mb-4'>
                Supports JPG, PNG (max 10 MB)
              </p>

              <Button
                size='large'
                className='bg-white border-blue-900 text-blue-900 font-medium'
              >
                Choose File
              </Button>
            </Dragger>
          </Form.Item>
        </div>

        {/* ACTION BUTTONS */}
        <div className='flex justify-end gap-4 mt-4'>
          <Button
            size='large'
            className='min-w-[100px]'
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          {/* <Button
            size='large'
            className='min-w-[140px] border-blue-900 text-blue-900'
          >
            Preview
          </Button> */}
          <Button
            type='primary'
            size='large'
            className='min-w-[140px] bg-blue-900 hover:bg-blue-800'
            onClick={handleSubmit}
            loading={isCreating}
          >
            Save Question
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateSpeaking;
