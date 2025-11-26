// CreateWriting.jsx
import React from 'react';
import { Card, Select, Button, message, Form } from 'antd';

import { useGetPartsBySkillName } from '@features/parts/hooks';
import { useCreateQuestion } from '@features/questions/hooks';
import { WRITING_PART_TYPES } from '@features/questions/constant/writingType';
import {
  buildPayloadPart1,
  buildPayloadPart2,
  buildPayloadPart3,
  buildPayloadPart4,
} from '@features/questions/utils/buildQuestionPayload';
import {
  schemaPart1,
  schemaPart2,
  schemaPart3,
  schemaPart4,
} from '@pages/QuestionBank/schemas/createQuestionSchema';
import WritingEditor from './Writing/WritingEditor';
import WritingPreview from './Writing/WritingPreview';

const { Option } = Select;

const CreateWriting = () => {
  const [form] = Form.useForm();

  const { data: writingParts = [], isLoading } =
    useGetPartsBySkillName('WRITING');

  const { mutate: createQuestion, isPending } = useCreateQuestion();

  // Watch toàn bộ form để feed cho Preview
  const allValues = Form.useWatch([], form) || {};
  // Watch partType để switch UI
  const partType =
    Form.useWatch('partType', form) || WRITING_PART_TYPES.PART1_SHORT_ANSWERS;

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const { partId } = values;

      if (!partId) {
        message.error('Please choose a Part.');
        return;
      }

      let payload = null;

      if (partType === WRITING_PART_TYPES.PART1_SHORT_ANSWERS) {
        const data = values.part1 || {};
        await schemaPart1.validate(data, { abortEarly: false });
        payload = buildPayloadPart1({ ...data, partId });
      }

      if (partType === WRITING_PART_TYPES.PART2_FORM_FILLING) {
        const data = values.part2 || {};
        await schemaPart2.validate(data, { abortEarly: false });
        payload = buildPayloadPart2({ ...data, partId });
      }

      if (partType === WRITING_PART_TYPES.PART3_CHAT_ROOM) {
        const data = values.part3 || {};
        await schemaPart3.validate(data, { abortEarly: false });
        payload = buildPayloadPart3({ ...data, partId });
      }

      if (partType === WRITING_PART_TYPES.PART4_EMAIL_WRITING) {
        const data = values.part4 || {};
        await schemaPart4.validate(data, { abortEarly: false });
        payload = buildPayloadPart4({ ...data, partId });
      }

      if (!payload) {
        message.error('Invalid part type');
        return;
      }

      createQuestion(payload, {
        onSuccess: () => {
          message.success('Created successfully!');
          // nếu muốn quay lại:
          // navigate(-1);
        },
        onError: (err) =>
          message.error(err?.response?.data?.message || 'Error creating'),
      });
    } catch (err) {
      if (err?.name === 'ValidationError') {
        return message.error(err.errors[0]);
      }
      console.error(err);
    }
  };

  const previewData =
    partType === WRITING_PART_TYPES.PART1_SHORT_ANSWERS
      ? allValues.part1
      : partType === WRITING_PART_TYPES.PART2_FORM_FILLING
        ? allValues.part2
        : partType === WRITING_PART_TYPES.PART3_CHAT_ROOM
          ? allValues.part3
          : allValues.part4;
  const customizeRequiredMark = (label, { required }) => (
    <>
      {label}
      {required && <span style={{ color: 'red', marginLeft: 4 }}>*</span>}
    </>
  );
  return (
    <Form
      form={form}
      layout='vertical'
      initialValues={{
        partType: WRITING_PART_TYPES.PART1_SHORT_ANSWERS,
        part1: {
          title: '',
          questions: [{ question: '', wordLimit: '' }],
        },
        part2: {
          title: '',
          question: '',
          wordLimit: '',
          fields: [''],
        },
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
      className='flex flex-col gap-6 pb-10'
      requiredMark={customizeRequiredMark}
    >
      {/* PART INFORMATION */}
      <Card title='Part Information'>
        <Form.Item
          name='partId'
          label='Name'
          rules={[{ required: true, message: 'Please choose a Part' }]}
        >
          <Select
            loading={isLoading}
            placeholder='Select part'
            size='large'
            allowClear
          >
            {writingParts.map((p) => (
              <Option key={p.ID} value={p.ID}>
                {p.Content}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name='partType'
          label='Writing Part Type'
          rules={[
            { required: true, message: 'Please choose Writing part type' },
          ]}
        >
          <Select size='large'>
            <Option value={WRITING_PART_TYPES.PART1_SHORT_ANSWERS}>
              Part 1 — Short Answers
            </Option>
            <Option value={WRITING_PART_TYPES.PART2_FORM_FILLING}>
              Part 2 — Form Filling
            </Option>
            <Option value={WRITING_PART_TYPES.PART3_CHAT_ROOM}>
              Part 3 — Chat Room
            </Option>
            <Option value={WRITING_PART_TYPES.PART4_EMAIL_WRITING}>
              Part 4 — Email Writing
            </Option>
          </Select>
        </Form.Item>
      </Card>

      {/* EDITOR */}
      <Card title='Question Details'>
        <WritingEditor partType={partType} />
      </Card>

      {/* PREVIEW */}
      <Card title='Preview'>
        <WritingPreview partType={partType} data={previewData} />
      </Card>

      {/* ACTION BUTTONS */}
      <div className='flex justify-end gap-4'>
        <Button size='large'>Cancel</Button>
        <Button
          type='primary'
          size='large'
          loading={isPending}
          className='bg-blue-900'
          onClick={handleSave}
        >
          Save Question
        </Button>
      </div>
    </Form>
  );
};

export default CreateWriting;
