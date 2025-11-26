// dropdown/DropdownEditor.jsx
import React, { useState, useEffect } from 'react';
import { Button, Space, Typography } from 'antd';

const { Text } = Typography;

const DropdownEditor = ({ value, onChange }) => {
  const [content, setContent] = useState(value || '');

  useEffect(() => {
    setContent(value || '');
  }, [value]);

  const insertBlank = () => {
    const blankIndex = (content.match(/\[\d+\]/g) || []).length;
    const newContent = content + ` [${blankIndex}]`;
    handleChange(newContent);
  };

  const handleChange = (val) => {
    setContent(val);

    // Extract blanks dạng: [0], [1], [2]
    const blanks = [...val.matchAll(/\[(\d+)\]/g)].map((m) => ({
      key: m[1],
    }));

    onChange && onChange(val, blanks);
  };

  return (
    <div className='w-full pt-2'>
      <Space style={{ marginBottom: 12 }}>
        <Button type='dashed' onClick={insertBlank}>
          Insert Blank
        </Button>
        <Text type='secondary'>
          Enter để xuống dòng • Preview real-time ở dưới
        </Text>
      </Space>

      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder='Type reading text... Example: Dear [0], thank you for [1].'
        style={{
          width: '100%',
          height: 200,
          padding: 12,
          fontSize: 16,
          borderRadius: 8,
          border: '1px solid #d9d9d9',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
        }}
      />
    </div>
  );
};

export default DropdownEditor;
