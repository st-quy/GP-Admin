// dropdown/DropdownPreview.jsx
import React from 'react';
import { Select } from 'antd';

const DropdownPreview = ({ content, blanks }) => {
  if (!content) return 'No content';

  const parts = content.split(/(\[\d+\])/g);

  return parts.map((part, idx) => {
    if (/^\[(\d+)\]$/.test(part)) {
      const key = part.match(/\[(\d+)\]/)[1];
      const blank = blanks.find((b) => b.key === key);

      return (
        <Select
          key={idx}
          placeholder={`Blank ${key}`}
          style={{ minWidth: 140, margin: '0 4px' }}
          options={
            blank?.options?.map((o) => ({
              label: o.value,
              value: o.value,
            })) ?? []
          }
          value={
            blank?.correctAnswer
              ? blank.options.find((o) => o.id === blank.correctAnswer)?.value
              : undefined
          }
        />
      );
    }

    return <span key={idx}>{part}</span>;
  });
};

export default DropdownPreview;
