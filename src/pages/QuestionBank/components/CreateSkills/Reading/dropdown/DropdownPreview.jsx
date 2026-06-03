// dropdown/DropdownPreview.jsx
import React from 'react';
import { Select } from 'antd';

const DropdownPreview = ({ content, blanks }) => {
  if (!content) return null;

  const parts = content.split(/(\[\d+\])/g);

  return parts.map((part, idx) => {
    if (/^\[(\d+)\]$/.test(part)) {
      const key = part.match(/\[(\d+)\]/)[1];
      const blank = blanks.find((b) => String(b.key) === String(key));

      const value = blank?.correctAnswer || undefined;

      return (
        <Select
          key={idx}
          style={{ minWidth: 150, margin: '0 4px' }}
          value={value}
          options={blank?.options?.map((o) => ({
            label: o.value,
            value: o.id,
          }))}
        />
      );
    }

    return <span key={idx}>{part}</span>;
  });
};

export default DropdownPreview;
