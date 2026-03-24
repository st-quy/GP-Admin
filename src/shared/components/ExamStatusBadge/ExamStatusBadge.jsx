import React from 'react';
import { Tag, Tooltip } from 'antd';
import {
    EditOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';
import { STATUS_CONFIG } from '@shared/lib/constants/examStatus';

const STATUS_ICONS = {
    draft: <EditOutlined />,
    submited: <ClockCircleOutlined />,
    approved: <CheckCircleOutlined />,
    rejected: <CloseCircleOutlined />,
};

/**
 * ExamStatusBadge - Color-coded status badge with icon
 * @param {Object} props
 * @param {string} props.status - draft | submited | approved | rejected
 * @param {string} [props.rejectReason] - Tooltip reason for rejected status
 * @param {object} [props.style] - Additional style overrides
 */
const ExamStatusBadge = ({ status, rejectReason, style = {} }) => {
    const config = STATUS_CONFIG[status];

    if (!config) {
        return <Tag>{status || 'Unknown'}</Tag>;
    }

    const tagElement = (
        <Tag
            icon={STATUS_ICONS[status]}
            color={config.antColor}
            style={{
                fontSize: 13,
                fontWeight: 500,
                padding: '2px 10px',
                borderRadius: 6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                ...style,
            }}
        >
            {config.label}
        </Tag>
    );

    if (status === 'rejected' && rejectReason) {
        return (
            <Tooltip title={rejectReason} placement="top">
                {tagElement}
            </Tooltip>
        );
    }

    return tagElement;
};

export default ExamStatusBadge;
