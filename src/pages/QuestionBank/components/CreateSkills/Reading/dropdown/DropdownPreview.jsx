// dropdown/DropdownPreview.jsx
import React from 'react';
import { Select } from 'antd';

const DropdownPreview = ({ content, blanks }) => {
  if (!content) return null;

  const parts = content.split(/(\[\d+\])/g);

  return parts.map((part, idx) => {
    if (/^\[(\d+)\]$/.test(part)) {
      const key = part.match(/\[(\d+)\]/)[1];
      const blank = blanks.find((b) => b.key === key);

      const value = blank?.correctAnswer || undefined;

      return (
        <Select
          key={idx}
          style={{ minWidth: 150, margin: '0 4px' }}
          value={value}
          options={blank?.options?.map((o, index) => ({
            label: o.value,
            value: `${blank.key}-${index}`, // dùng ID chuẩn
          }))}
        />
      );
    }

    return <span key={idx}>{part}</span>;
  });
};

export default DropdownPreview;
