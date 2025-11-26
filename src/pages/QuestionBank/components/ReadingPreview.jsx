// ReadingPreview.jsx
import React from 'react';
import { Select, Typography } from 'antd';

const { Text } = Typography;

/**
 * props:
 *  - content: string (instruction/passage)
 *  - blanks: [
 *      { id, options: [{label, value}], correctOptionId }
 *    ]
 */
const ReadingPreview = ({ content, blanks }) => {
  if (!content) return null;

  // Replace [0], [1], ... with actual dropdowns
  const segments = content.split(/(\[\d+\])/g);

  const renderSegment = (segment, index) => {
    const match = segment.match(/\[(\d+)\]/);
    if (!match) {
      return <span key={index}>{segment}</span>;
    }

    const blankIndex = Number(match[1]);
    const blank = blanks[blankIndex];

    if (!blank) {
      return (
        <Text
          key={index}
          type='danger'
          style={{ padding: '0 6px', fontStyle: 'italic' }}
        >
          [Missing blank {blankIndex}]
        </Text>
      );
    }

    const options =
      blank.options?.map((opt) => ({
        value: opt.value,
        label: opt.value,
      })) || [];

    const defaultValue =
      blank.options.find((o) => o.id === blank.correctOptionId)?.value ||
      undefined;

    return (
      <Select
        key={index}
        size='small'
        defaultValue={defaultValue}
        style={{
          minWidth: 120,
          margin: '0 4px',
        }}
        options={options}
        placeholder='Select...'
      />
    );
  };

  return (
    <div
      style={{
        background: '#fafafa',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 16,
        lineHeight: '28px',
        whiteSpace: 'pre-wrap', // 👈 giữ xuống dòng nguyên bản!
      }}
    >
      {segments.map((seg, idx) => renderSegment(seg, idx))}
    </div>
  );
};

export default ReadingPreview;
