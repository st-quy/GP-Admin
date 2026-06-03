// dropdown/DropdownEditor.jsx
import React, { useEffect } from 'react';
import { Button, Space, Typography, Input, Form } from 'antd';

import {
  MAX_QUESTION_INPUT_LENGTH,
  sanitizeQuestionInput,
} from '@shared/lib/questionInput';

const { TextArea } = Input;
const { Text } = Typography;

const BLANK_REGEX = /\[(\d+)\]/g;

const DropdownEditor = () => {
  const form = Form.useFormInstance();
  const content = Form.useWatch(['part1', 'content'], form);

  const syncBlanks = (val) => {
    const detectedKeys = [...val.matchAll(BLANK_REGEX)].map((m) => m[1]);
    const existingBlanks = form.getFieldValue(['part1', 'blanks']) || [];

    const mergedBlanks = detectedKeys.map((key) => {
      const found = existingBlanks.find((b) => String(b.key) === String(key));
      if (found) return found;
      return {
        key,
        options: [],
        correctAnswer: null,
      };
    });

    form.setFieldValue(['part1', 'blanks'], mergedBlanks);
  };

  const handleChange = (val) => {
    form.setFieldValue(['part1', 'content'], val);
    syncBlanks(val);
  };

  const insertBlank = () => {
    const current = form.getFieldValue(['part1', 'content']) || '';
    const count = (current.match(/\[\d+\]/g) || []).length;
    handleChange(current + ` [${count}]`);
  };

  // Sync blanks when content changes (including programmatic setFieldsValue)
  useEffect(() => {
    if (content !== undefined && content !== null) {
      syncBlanks(content);
    }
  }, [content]);

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

      <Form.Item
        name={['part1', 'content']}
        noStyle={false}
        rules={[{ required: true, message: 'Content is required' }]}
      >
        <TextArea
          rows={6}
          placeholder='Type reading text... Example: Dear [0], thank you for [1].'
          maxLength={MAX_QUESTION_INPUT_LENGTH}
          onChange={(e) => handleChange(sanitizeQuestionInput(e.target.value))}
        />
      </Form.Item>
    </div>
  );
};

export default DropdownEditor;
