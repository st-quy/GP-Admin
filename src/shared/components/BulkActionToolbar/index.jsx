import React from 'react';
import { Button, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const BulkActionToolbar = ({ selectedCount, actions = [], onClearSelection }) => {
  if (selectedCount === 0) return null;

  return (
    <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] border border-gray-200 px-5 py-3 flex items-center gap-4 animate-slide-up'>
      <span className='text-sm font-semibold text-gray-700 whitespace-nowrap'>
        {selectedCount} selected
      </span>

      <div className='w-px h-6 bg-gray-200' />

      <Space size='small'>
        {actions.map((action) => (
          <Button
            key={action.key}
            type={action.type || 'default'}
            danger={action.danger}
            icon={action.icon}
            size='middle'
            onClick={action.onClick}
            disabled={action.disabled}
            className={action.className}
          >
            {action.label}
          </Button>
        ))}
      </Space>

      <div className='w-px h-6 bg-gray-200' />

      <Button
        type='text'
        icon={<CloseOutlined />}
        size='small'
        onClick={onClearSelection}
        className='text-gray-400 hover:text-gray-600'
      />
    </div>
  );
};

export default BulkActionToolbar;
