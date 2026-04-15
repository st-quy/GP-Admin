import React, { useState } from 'react';
import { Tooltip, message } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';

const CopyableText = ({ 
  text, 
  className = '', 
  iconClassName = '',
  tooltipTitle = 'Click to copy',
  successMessage = 'Copied to clipboard!'
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      message.success(successMessage);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      message.error('Failed to copy');
    }
  };

  return (
    <Tooltip title={copied ? 'Copied!' : tooltipTitle}>
      <span
        onClick={handleCopy}
        className={`inline-flex items-center gap-1.5 cursor-pointer transition-opacity hover:opacity-70 ${className}`}
      >
        <span>{text}</span>
        <span className={`transition-all ${iconClassName}`}>
          {copied ? (
            <CheckOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
          ) : (
            <CopyOutlined style={{ color: '#8c8c8c', fontSize: '14px' }} />
          )}
        </span>
      </span>
    </Tooltip>
  );
};

export default CopyableText;
