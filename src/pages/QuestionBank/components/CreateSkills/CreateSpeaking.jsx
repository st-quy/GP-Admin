// @ts-nocheck
import React, { useState } from 'react';
import { Input, Select, Button, Upload, message, Form } from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCreateSpeaking } from '../../../../features/questions/hooks';

import { yupSync } from '@shared/lib/utils';
import { createSpeakingSchema } from '../../schemas/createSpeakingSchema';

const { TextArea } = Input;
const { Dragger } = Upload;

const CreateSpeaking = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([
    { id: 1, value: '' },
    { id: 2, value: '' },
    { id: 3, value: '' },
  ]);

  // TODO: thay bằng PartID thật (từ props / route / context...)
  const partIdFromContext = 'da0d2a5a-f256-4226-ab8f-98758ee31deb';

  const { mutate: createSpeaking, isPending: isCreating } = useCreateSpeaking();

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
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        // TODO: call real upload API & set url vào response
        // const formData = new FormData();
        // formData.append('file', file);
        // const res = await axios.post('/upload', formData, {...});
        // onSuccess({ url: res.data.url });

        onSuccess({
          url: 'https://10.22.1.4:9000/gp-bucket/Topic14/Photo/P2.png',
        }); // demo
      } catch (err) {
        console.log(err);
        onError(err);
        message.error('Upload failed!');
      }
    },
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const {
          partType,
          description,
          questions: formQuestions,
          image,
        } = values;

        // Lấy URL image từ upload (tùy backend trả gì)
        let imageUrl = null;
        if (Array.isArray(image) && image.length > 0) {
          const file = image[0];
          imageUrl = file.response?.url || file.url || null;
        }

        // Build payload theo backend createQuestionGroup
        const payload = {
          PartID: partIdFromContext,
          SkillName: 'SPEAKING',
          PartType: partType,
          Description: description,
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
      <Form form={form} initialValues={{ questions }} layout='vertical'>
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
                options={[
                  { value: 'part1', label: 'Part 1: Personal Information' },
                  { value: 'part2', label: 'Part 2: Picture Description' },
                  { value: 'part3', label: 'Part 3: Picture Discussion' },
                  { value: 'part4', label: 'Part 4: Topic Discussion' },
                ]}
              />
            </Form.Item>
          </div>

          {/* <Form.Item
            name='description'
            label='Instruction'
            rules={[{ required: true, message: 'Description is required' }]}
            required
          >
            <TextArea rows={4} placeholder='e.g., Questions 1-5' />
          </Form.Item> */}
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
            // Nếu muốn bắt buộc image:
            // rules={[{ required: true, message: 'Image is required' }]}
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
          <Button
            size='large'
            className='min-w-[140px] border-blue-900 text-blue-900'
          >
            Preview
          </Button>
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
