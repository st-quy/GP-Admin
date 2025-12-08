// CreateWriting.jsx
import React from 'react';
import { Card, Button, message, Form, Divider, Input } from 'antd';
import { useNavigate } from 'react-router-dom';

import WritingEditor from './Writing/WritingEditor';
import { WRITING_PART_TYPES } from '@features/questions/constant/writingType';
import { useCreateQuestion } from '@features/questions/hooks';
import { buildWritingFullPayload } from '@features/questions/utils/buildQuestionPayload';

const CreateWriting = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { mutate: createWritingGroup, isPending } = useCreateQuestion();

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // ===== Build payload FE → BE =====
      const payload = buildWritingFullPayload(values);
      console.log('FINAL PAYLOAD:', payload);

      createWritingGroup(payload, {
        onSuccess: () => {
          message.success('Writing test created successfully!');
          navigate(-1);
        },
        onError: (err) => {
          message.error(
            err?.response?.data?.message || 'Error creating writing test'
          );
        },
      });
    } catch (err) {
      console.error(err);
      message.error('Validation failed. Please check inputs.');
    }
  };

  return (
    <Form
      form={form}
      layout='vertical'
      initialValues={{
        sectionName: '',
        part1: { title: '', questions: [{ question: '' }] },
        part2: { title: '', question: '', wordLimit: '', fields: [''] },
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
      className='flex flex-col gap-8 pb-20'
    >
      {/* SECTION INFO */}
      <Card title='Section Information'>
        <Form.Item
          label='Section Name'
          name='sectionName'
          rules={[{ required: true, message: 'Section name is required' }]}
        >
          <Input placeholder='e.g., Fitness Club Writing Test' />
        </Form.Item>
      </Card>

      {/* ===== PART 1 ===== */}
      <Card title='Part 1 — Short Answers'>
        <WritingEditor partType={WRITING_PART_TYPES.PART1_SHORT_ANSWERS} />
      </Card>

      {/* ===== PART 2 ===== */}
      <Card title='Part 2 — Form Filling'>
        <WritingEditor partType={WRITING_PART_TYPES.PART2_FORM_FILLING} />
      </Card>

      {/* ===== PART 3 ===== */}
      <Card title='Part 3 — Chat Room'>
        <WritingEditor partType={WRITING_PART_TYPES.PART3_CHAT_ROOM} />
      </Card>

      {/* ===== PART 4 ===== */}
      <Card title='Part 4 — Email Writing'>
        <WritingEditor partType={WRITING_PART_TYPES.PART4_EMAIL_WRITING} />
      </Card>

      {/* ACTION BUTTONS */}
      <div className='flex justify-end gap-4'>
        <Button size='large' onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button
          type='primary'
          size='large'
          loading={isPending}
          className='bg-blue-900'
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </Form>
  );
};

export default CreateWriting;
