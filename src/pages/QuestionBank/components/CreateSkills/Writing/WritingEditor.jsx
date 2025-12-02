// WritingEditor.jsx
import React from 'react';
import { Form, Input, Button, Space, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { WRITING_PART_TYPES } from '@features/questions/constant/writingType';

const { TextArea } = Input;

const WritingEditor = ({ partType }) => {
  /* ---------- PART 1 — Short Answers ---------- */
  if (partType === WRITING_PART_TYPES.PART1_SHORT_ANSWERS) {
    return (
      <div className='flex flex-col gap-4'>
        <Form.Item
          name={['part1', 'title']}
          label='Instruction Text'
          rules={[{ required: true, message: 'Instruction text is required' }]}
        >
          <TextArea
            rows={3}
            placeholder='e.g., Answer the following questions.'
          />
        </Form.Item>

        <Form.List name={['part1', 'questions']}>
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <div
                  key={field.key}
                  className='border border-gray-200 rounded-lg bg-gray-50'
                >
                  <div className='flex justify-between items-center'>
                    <span className='font-semibold text-gray-800'>
                      Question {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <Button
                        type='text'
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(field.name)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <Form.Item
                    {...field}
                    name={[field.name, 'question']}
                    fieldKey={[field.fieldKey, 'question']}
                    rules={[
                      { required: true, message: 'Question is required' },
                    ]}
                    className='!m-0'
                  >
                    <Input placeholder='Enter question...' />
                  </Form.Item>
                </div>
              ))}

              <Button
                type='dashed'
                icon={<PlusOutlined />}
                onClick={() => add({ question: '', wordLimit: '' })}
              >
                Add question
              </Button>
            </>
          )}
        </Form.List>
      </div>
    );
  }

  /* ---------- PART 2 — Form Filling ---------- */
  if (partType === WRITING_PART_TYPES.PART2_FORM_FILLING) {
    return (
      <div className='flex flex-col'>
        <Form.Item
          name={['part2', 'title']}
          label='Instruction Text'
          rules={[{ required: true, message: 'Instruction text is required' }]}
        >
          <TextArea
            rows={3}
            placeholder='e.g., You are filling in a registration form...'
          />
        </Form.Item>

        <Form.Item
          name={['part2', 'question']}
          label='Question'
          rules={[{ required: true, message: 'Question is required' }]}
        >
          <TextArea
            rows={3}
            placeholder='e.g., Complete the form below with appropriate information.'
          />
        </Form.Item>

        <Form.Item
          name={['part2', 'wordLimit']}
          label='Word limit'
          rules={[{ required: true, message: 'Word limit is required' }]}
        >
          <Input
            placeholder='e.g., 30'
            addonAfter='words'
            type='number'
            min={1}
          />
        </Form.Item>
      </div>
    );
  }

  /* ---------- PART 3 — Chat Room ---------- */
  if (partType === WRITING_PART_TYPES.PART3_CHAT_ROOM) {
    return (
      <div className='flex flex-col'>
        <Form.Item
          name={['part3', 'title']}
          label='Instruction Text'
          rules={[{ required: true, message: 'Title is required' }]}
        >
          <TextArea
            rows={3}
            placeholder='e.g., Answer the questions in the chat room below.'
          />
        </Form.Item>

        <Form.List name={['part3', 'chats']}>
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, idx) => (
                <div
                  key={field.key}
                  className='border border-gray-200 rounded-lg p-4 bg-gray-50'
                >
                  <div className='flex justify-between items-center'>
                    <span className='font-semibold text-gray-800'>
                      Chat line {idx + 1}
                    </span>
                    {fields.length > 1 && (
                      <Button
                        type='text'
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(field.name)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <Space
                    direction='vertical'
                    className='w-full [&_.ant-form-item]:!mb-0'
                    size='small'
                  >
                    <Form.Item
                      {...field}
                      name={[field.name, 'speaker']}
                      fieldKey={[field.fieldKey, 'speaker']}
                      label='Speaker'
                      rules={[
                        { required: true, message: 'Speaker is required' },
                      ]}
                    >
                      <Input placeholder='e.g., Ben, Quinn, Chris, Hannah...' />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      name={[field.name, 'question']}
                      fieldKey={[field.fieldKey, 'question']}
                      label='Question'
                      rules={[
                        { required: true, message: 'Question is required' },
                      ]}
                    >
                      <TextArea rows={2} placeholder='Enter question...' />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      name={[field.name, 'wordLimit']}
                      fieldKey={[field.fieldKey, 'wordLimit']}
                      label='Word limit'
                      rules={[
                        { required: true, message: 'Word limit is required' },
                      ]}
                    >
                      <Input
                        placeholder='e.g., 30'
                        addonAfter='words'
                        type='number'
                        min={1}
                      />
                    </Form.Item>
                  </Space>
                </div>
              ))}

              <Button
                type='dashed'
                icon={<PlusOutlined />}
                onClick={() =>
                  add({ speaker: '', question: '', wordLimit: '' })
                }
              >
                Add chat line
              </Button>
            </>
          )}
        </Form.List>
      </div>
    );
  }

  /* ---------- PART 4 — Email Writing ---------- */
  if (partType === WRITING_PART_TYPES.PART4_EMAIL_WRITING) {
    return (
      <div className='flex flex-col gap-4 [&_.ant-form-item]:!mb-0'>
        <Form.Item
          name={['part4', 'partName']}
          label='Instruction Text'
          rules={[{ required: true, message: 'Instruction text is required' }]}
        >
          <Input placeholder='e.g., You are a member of the Fitness Club. ...' />
        </Form.Item>
        <Form.Item
          name={['part4', 'emailText']}
          label='Sub Instruction'
          rules={[{ required: true, message: 'Instruction text is required' }]}
        >
          <TextArea
            rows={5}
            placeholder='Paste the news / situation / email text here...'
          />
        </Form.Item>

        <div className='border border-gray-200 rounded-lg p-4 bg-gray-50 mb-4'>
          <Form.Item
            name={['part4', 'q1']}
            label='Question 1'
            rules={[{ required: true, message: 'Question 1 is required' }]}
          >
            <TextArea
              rows={3}
              placeholder='e.g., Write an email to your friend...'
            />
          </Form.Item>
          <Form.Item
            name={['part4', 'q1_wordLimit']}
            label='Word limit'
            rules={[{ required: true, message: 'Word limit is required' }]}
          >
            <Input
              placeholder='e.g., 50'
              addonAfter='words'
              type='number'
              min={1}
            />
          </Form.Item>
        </div>

        <div className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
          <Form.Item
            name={['part4', 'q2']}
            label='Question 2'
            rules={[{ required: true, message: 'Question 2 is required' }]}
          >
            <TextArea
              rows={3}
              placeholder='e.g., Write an email to the club president...'
            />
          </Form.Item>
          <Form.Item
            name={['part4', 'q2_wordLimit']}
            label='Word limit'
            rules={[{ required: true, message: 'Word limit is required' }]}
          >
            <Input
              placeholder='e.g., 120-150'
              addonAfter='words'
              // nếu muốn cho dạng range thì để type text
            />
          </Form.Item>
        </div>
      </div>
    );
  }

  return null;
};

export default WritingEditor;
