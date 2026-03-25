// CreateReading.jsx
import React from 'react';
import { Form, Input, Button, Card, Space, Typography, message } from 'antd';

import DropdownEditor from './Reading/dropdown/DropdownEditor';
import DropdownBlankOptions from './Reading/dropdown/DropdownBlankOptions';
import DropdownPreview from './Reading/dropdown/DropdownPreview';

import OrderingEditor from './Reading/ordering/OrderingEditor';
import MatchingEditor from './Reading/matching/MatchingEditor';
import MatchingEditorPart4 from './Reading/matching/MatchingEditorPart4';

import { buildFullReadingPayload } from '@features/questions/utils/buildQuestionPayload';
import { useCreateQuestion } from '@features/questions/hooks';
import { useNavigate } from 'react-router-dom';

const CreateReading = () => {
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const { mutate: createQuestion, isPending } = useCreateQuestion();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = buildFullReadingPayload(values);

      createQuestion(payload, {
        onSuccess: () => {
          message.success('Created successfully!');
          navigate(-1);
        },
        onError: (err) => {
          message.error(err?.response?.data?.message || 'Failed to create');
        },
      });
      message.success('Created reading successfully!');
    } catch (err) {
      console.error(err);
      message.error('Form error — check again!');
    }
  };

  return (
    <Form
      form={form}
      layout='vertical'
      initialValues={{
        part1: { name: '', content: '', blanks: [] },
        part2A: {
          name: '',
          items: [
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
          ],
        },
        part2B: {
          name: '',
          items: [
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
          ],
        },
        part3: { name: '', leftItems: [], rightItems: [], mapping: [] },
        part4: {
          name: '',
          content: '',
          leftItems: [],
          rightItems: [],
          mapping: [],
        },
      }}
    >
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        <Card title='Section information'>
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

        {/* ----------------------------------------------------------- */}
        {/* PART 1 — DROPDOWN BLANKS */}
        {/* ----------------------------------------------------------- */}
        <Card title='Instruction 1'>
          <Form.Item
            label='Part Name'
            name={['part1', 'name']}
            rules={[{ required: true, message: 'Part name is required' }]}
          >
            <Input placeholder='Enter Part 1 Name' />
          </Form.Item>

          <Form.Item
            label='Content'
            name={['part1', 'content']}
            rules={[{ required: true, message: 'Content is required' }]}
          >
            <DropdownEditor />
          </Form.Item>

          <DropdownBlankOptions />

          <Form.Item shouldUpdate noStyle>
            {({ getFieldValue }) => {
              const part1 = getFieldValue(['part1']) || {};
              const blanks = Array.isArray(part1.blanks) ? part1.blanks : [];

              return (
                <Form.Item
                  name={['part1', '_minBlanks']}
                  validateTrigger='onSubmit'
                  rules={[
                    {
                      validator: () => {
                        if (blanks.length < 1) {
                          return Promise.reject(
                            new Error('Must have at least 1 blank')
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <div style={{ height: 0 }} />
                </Form.Item>
              );
            }}
          </Form.Item>

          <div style={{ marginTop: 12 }}>
            <Typography.Text strong>Preview:</Typography.Text>
            <div
              style={{
                marginTop: 8,
                padding: 12,
                border: '1px solid #eee',
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  lineHeight: 2.4,
                  whiteSpace: 'pre-wrap',
                }}
              >
                <DropdownPreview
                  content={Form.useWatch(['part1', 'content'], form)}
                  blanks={Form.useWatch(['part1', 'blanks'], form)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* ----------------------------------------------------------- */}
        {/* PART 2A — ORDERING */}
        {/* ----------------------------------------------------------- */}
        <Card title='Instruction 2'>
          {/* 🔥 ADD PART NAME */}
          <Form.Item
            label='Part Name'
            name={['part2A', 'name']}
            rules={[{ required: true, message: 'Part name is required' }]}
          >
            <Input placeholder='Enter Part 2A Name' />
          </Form.Item>

          <Form.Item
            label='Content'
            name={['part2A', 'intro']}
            rules={[{ required: true, message: 'Content is required' }]}
          >
            <Input />
          </Form.Item>

          <Form.List name={['part2A', 'items']}>
            {(fields, helpers) => (
              <OrderingEditor
                fields={fields}
                helpers={helpers}
                listPath={['part2A', 'items']}
              />
            )}
          </Form.List>
        </Card>

        {/* ----------------------------------------------------------- */}
        {/* PART 2B — ORDERING */}
        {/* ----------------------------------------------------------- */}
        <Card title='Instruction 3'>
          {/* 🔥 ADD PART NAME */}
          <Form.Item
            label='Part Name'
            name={['part2B', 'name']}
            rules={[{ required: true, message: 'Part name is required' }]}
          >
            <Input placeholder='Enter Part 2B Name' />
          </Form.Item>

          <Form.Item
            label='Content'
            name={['part2B', 'intro']}
            rules={[{ required: true, message: 'Content is required' }]}
          >
            <Input />
          </Form.Item>

          <Form.List name={['part2B', 'items']}>
            {(fields, helpers) => (
              <OrderingEditor
                fields={fields}
                helpers={helpers}
                listPath={['part2B', 'items']}
              />
            )}
          </Form.List>
        </Card>

        {/* ----------------------------------------------------------- */}
        {/* PART 3 — DROPDOWN MATCHING */}
        {/* ----------------------------------------------------------- */}
        <Card title='Instruction 4'>
          <Form.Item
            label='Part Name'
            name={['part3', 'name']}
            rules={[{ required: true, message: 'Part name is required' }]}
          >
            <Input placeholder='Enter Part 3 Name' />
          </Form.Item>
          {/* CONTENT */}
          <Form.Item
            label='Content'
            name={['part3', 'content']}
            rules={[{ required: true, message: 'Content is required' }]}
          >
            <Input.TextArea rows={3} placeholder='Enter content...' />
          </Form.Item>

          <Form.Item name={['part3']}>
            <MatchingEditor />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const part3 = getFieldValue(['part3']) || {};
              const left = Array.isArray(part3.leftItems)
                ? part3.leftItems
                : [];
              const right = Array.isArray(part3.rightItems)
                ? part3.rightItems
                : [];

              return (
                <Form.Item
                  name={['part3', '_minItems']}
                  rules={[
                    {
                      validator: () => {
                        if (left.length < 1)
                          return Promise.reject(
                            new Error(
                              'Instruction 4 must have at least 1 content'
                            )
                          );
                        if (right.length < 1)
                          return Promise.reject(
                            new Error(
                              'Instruction 4 must have at least 1 option'
                            )
                          );
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <div style={{ height: 0 }} />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Card>

        {/* ----------------------------------------------------------- */}
        {/* PART 4 — FULL MATCHING */}
        {/* ----------------------------------------------------------- */}
        <Card title='Instruction 5'>
          <Form.Item
            label='Part Name'
            name={['part4', 'name']}
            rules={[{ required: true, message: 'Part name is required' }]}
          >
            <Input placeholder='Enter Part 4 Name' />
          </Form.Item>
          {/* CONTENT */}
          <Form.Item
            label='Content'
            name={['part4', 'content']}
            rules={[{ required: true, message: 'Content is required' }]}
          >
            <Input.TextArea rows={3} placeholder='Enter reading paragraph...' />
          </Form.Item>

          <Form.Item name={['part4']}>
            <MatchingEditorPart4 />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const part4 = getFieldValue(['part4']) || {};
              const left = Array.isArray(part4.leftItems)
                ? part4.leftItems
                : [];
              const right = Array.isArray(part4.rightItems)
                ? part4.rightItems
                : [];

              return (
                <Form.Item
                  name={['part4', '_minItems']}
                  rules={[
                    {
                      validator: () => {
                        if (left.length < 1)
                          return Promise.reject(
                            new Error('Must have at least 1 content')
                          );
                        if (right.length < 1)
                          return Promise.reject(
                            new Error('Must have at least 1 option')
                          );
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <div style={{ height: 0 }} />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Card>

        <div className='flex justify-end gap-4'>
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button
            type='primary'
            onClick={handleSubmit}
            loading={isPending}
            className='bg-blue-900'
          >
            Save
          </Button>
        </div>
      </Space>
    </Form>
  );
};

export default CreateReading;
