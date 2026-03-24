import React from 'react';
import { Dropdown, Modal, message } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import ExamStatusBadge from '@shared/components/ExamStatusBadge';
import {
    STATUS_CONFIG,
    getValidNextStatuses,
} from '@shared/lib/constants/examStatus';

/**
 * StatusTransitionDropdown - Dropdown chuyển trạng thái cho exam/topic
 * Click vào badge → dropdown hiển thị valid transitions
 * Block invalid transitions tự động
 *
 * @param {Object} props
 * @param {string} props.currentStatus - Status hiện tại
 * @param {string} [props.rejectReason] - Lý do reject (tooltip)
 * @param {Function} props.onTransition - Callback khi chuyển status: (newStatus) => Promise
 * @param {boolean} [props.disabled] - Disable dropdown
 */
const StatusTransitionDropdown = ({
    currentStatus,
    rejectReason,
    onTransition,
    disabled = false,
}) => {
    const validNext = getValidNextStatuses(currentStatus);

    // Nếu không có transition hợp lệ → chỉ hiển thị badge
    if (validNext.length === 0 || disabled) {
        return (
            <ExamStatusBadge status={currentStatus} rejectReason={rejectReason} />
        );
    }

    const handleMenuClick = ({ key }) => {
        const targetConfig = STATUS_CONFIG[key];
        if (!targetConfig) return;

        Modal.confirm({
            title: 'Confirm Status Change',
            content: `Are you sure you want to change status from "${STATUS_CONFIG[currentStatus]?.label}" to "${targetConfig.label}"?`,
            okText: 'Confirm',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await onTransition(key);
                } catch (error) {
                    message.error('Failed to update status');
                }
            },
        });
    };

    const menuItems = validNext.map((status) => {
        const cfg = STATUS_CONFIG[status];
        return {
            key: status,
            label: (
                <span style={{ color: cfg.color, fontWeight: 500 }}>
                    <SwapOutlined style={{ marginRight: 6 }} />
                    Move to {cfg.label}
                </span>
            ),
        };
    });

    return (
        <Dropdown
            menu={{ items: menuItems, onClick: handleMenuClick }}
            trigger={['click']}
            placement="bottomLeft"
        >
            <span style={{ cursor: 'pointer' }}>
                <ExamStatusBadge
                    status={currentStatus}
                    rejectReason={rejectReason}
                    style={{ cursor: 'pointer' }}
                />
            </span>
        </Dropdown>
    );
};

export default StatusTransitionDropdown;
