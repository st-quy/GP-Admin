import React, { useState, useEffect } from 'react';
import { Button, Space, Typography, Card } from 'antd';

const { Text } = Typography;

/**
 * Editor + Preview cho Reading Fill-in-Blank
 */
const ReadingDropdownEditor = ({ value, onChange }) => {
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

    // Extract blanks
    const blanks = [...val.matchAll(/\[(\d+)\]/g)].map((m) => ({
      key: m[1],
    }));

    onChange && onChange(val, blanks);
  };

  return (
    <div className='w-full pt-2'>
      {/* TOP BUTTON BAR */}
      <Space style={{ marginBottom: 12 }}>
        <Button type='dashed' onClick={insertBlank}>
          Insert Blank
        </Button>
        <Text type='secondary'>
          Enter để xuống dòng • Preview real-time bên dưới
        </Text>
      </Space>

      {/* TEXT EDITOR */}
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder='Type your reading passage here...'
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

export default ReadingDropdownEditor;
