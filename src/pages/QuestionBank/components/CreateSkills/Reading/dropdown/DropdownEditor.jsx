// dropdown/DropdownEditor.jsx
import React from 'react';
import { Button, Space, Typography, Input, Form } from 'antd';

const { TextArea } = Input;
const { Text } = Typography;

const BLANK_REGEX = /\[(\d+)\]/g;

const DropdownEditor = () => {
  const form = Form.useFormInstance();

  const insertBlank = () => {
    const content = form.getFieldValue(['part1', 'content']) || '';
    const count = (content.match(/\[\d+\]/g) || []).length;
    const newContent = content + ` [${count}]`;
    handleChange(newContent);
  };

  const handleChange = (val) => {
    form.setFieldValue(['part1', 'content'], val);

    // Detect blank keys hiện có trong content
    const detectedKeys = [...val.matchAll(BLANK_REGEX)].map((m) => m[1]);

    // Get existing blanks in form
    const existingBlanks = form.getFieldValue(['part1', 'blanks']) || [];

    // Build new blanks list mà KHÔNG mất options cũ
    const mergedBlanks = detectedKeys.map((key) => {
      const found = existingBlanks.find((b) => b.key === key);
      if (found) return found; // giữ lại options + correctAnswer

      // blank mới → tạo blank rỗng
      return {
        key,
        options: [],
        correctAnswer: '',
      };
    });

    form.setFieldValue(['part1', 'blanks'], mergedBlanks);
  };

  return (
    <div className='w-full pt-2'>
      <Space style={{ marginBottom: 12 }}>
        <Button type='dashed' onClick={insertBlank}>
          Insert Blank
        </Button>
        <Text type='secondary'>
          Enter to go to a new line • Real-time preview below
        </Text>
      </Space>

      <Form.Item name={['part1', 'content']} noStyle>
        <TextArea
          rows={6}
          placeholder='Type reading text... Example: Dear [0], thank you for [1].'
          onChange={(e) => handleChange(e.target.value)}
        />
      </Form.Item>
    </div>
  );
};

export default DropdownEditor;
