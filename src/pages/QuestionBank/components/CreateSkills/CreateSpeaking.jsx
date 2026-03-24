// @ts-nocheck
import React, { useState } from 'react';
import { Input, Button, Form, Card } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useCreateQuestion } from '../../../../features/questions/hooks';
import MinioUploadDragger from '@shared/components/MinioUploadDragger';

import { createSpeakingSchema } from '../../schemas/createQuestionSchema';
import { yupSync } from '@shared/lib/utils';

const CreateSpeaking = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { mutate: createSpeaking, isPending } = useCreateQuestion();
  const [images, setImages] = useState({});

  /** FE → BE Payload */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        SkillName: 'SPEAKING',
        SectionName: values.sectionName,
        Description: values.description?.trim() || '',
        parts: {
          part1: { ...values.parts.part1, image: images.part1, sequence: 1 },
          part2: { ...values.parts.part2, image: images.part2, sequence: 2 },
          part3: { ...values.parts.part3, image: images.part3, sequence: 3 },
          part4: { ...values.parts.part4, image: images.part4, sequence: 4 },
        },
      };

      createSpeaking(payload, {
        onSuccess: () =>
          navigate('/questions?skillName=SPEAKING', { replace: true }),
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
          <Input maxLength={255} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()\"':]/g, ''); }} placeholder='Enter part name' />
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
          <MinioUploadDragger
            accept='.jpg,.jpeg,.png'
            allowedMimeTypes={['image/jpeg', 'image/png']}
            bucketType='images'
            hint='Drop a JPG or PNG image here or click to browse'
            listType='picture'
            onChange={(url) => {
              setImages((prev) => ({ ...prev, [key]: url }));
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
            }}
            title='Upload instruction image'
            value={images[key]}
          />
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
                    <Input maxLength={255} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()\"':]/g, ''); }} placeholder='Enter question' />
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
        description: '',
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
          <Input maxLength={255} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()\"':]/g, ''); }} placeholder='Enter section name' />
        </Form.Item>
        <Form.Item label='Description' name='description'>
          <Input.TextArea rows={3} placeholder='-' maxLength={510} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, ''); }} />
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
