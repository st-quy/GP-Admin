import React from 'react';
import { Button, Space, Divider, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * @param {Object} props
 * @param {number} props.selectedCount - Number of selected items
 * @param {Array} props.actions - Array of action objects { label, onClick, icon, color, danger, disabled }
 * @param {Function} props.onClearSelection - Function to clear selection
 * @param {boolean} props.visible - Whether to show the toolbar
 */
const BulkActionToolbar = ({ 
  selectedCount, 
  actions = [], 
  onClearSelection,
  visible = false
}) => {
  // Always render the component but control visibility with CSS
  return (
    <div className={`bulk-action-toolbar ${visible ? 'slide-up' : 'slide-down'}`}>
      <div className="bulk-action-toolbar-content">
        <Space split={<Divider type="vertical" className="border-gray-300 h-6" />}>
          <Space size="middle">
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={onClearSelection}
              className="flex items-center justify-center hover:bg-gray-100 rounded-full"
            />
            <Text strong className="text-[#003087]">
              {selectedCount} selected
            </Text>
          </Space>

          <Space size="middle">
            {actions.map((action, index) => (
              <Button
                key={index}
                type={action.danger ? 'primary' : 'default'}
                danger={action.danger}
                icon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`flex items-center gap-2 rounded-lg font-medium transition-all ${
                  !action.danger ? 'border-[#003087] text-[#003087] hover:bg-[#E6F0FA]' : ''
                }`}
              >
                {action.label}
              </Button>
            ))}
          </Space>
        </Space>
      </div>

      <style>{`
        .bulk-action-toolbar {
          position: fixed;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1001;
          animation-fill-mode: forwards;
          animation-duration: 0.3s;
          animation-timing-function: ease-out;
          pointer-events: ${props => props.visible ? 'auto' : 'none'};
          opacity: ${props => props.visible ? '1' : '0'};
        }

        .bulk-action-toolbar-content {
          background: #ffffff;
          border: 1px solid #003087;
          box-shadow: 0px 10px 20px rgba(0, 48, 135, 0.15);
          border-radius: 100px;
          padding: 8px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes slideUp {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            transform: translate(-50%, 0);
            opacity: 1;
          }
          to {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default BulkActionToolbar;
