/**
 * Exam / Topic status configuration
 * APTIS-133: Status badges + transition UI
 */

export const EXAM_STATUSES = {
    DRAFT: 'draft',
    SUBMITED: 'submited',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ARCHIVED: 'archived',
};

/**
 * Status display config: color, label, icon name
 */
export const STATUS_CONFIG = {
    [EXAM_STATUSES.DRAFT]: {
        color: '#8c8c8c',
        bg: '#f5f5f5',
        border: '#d9d9d9',
        label: 'Draft',
        antColor: 'default',
    },
    [EXAM_STATUSES.SUBMITED]: {
        color: '#d48806',
        bg: '#fffbe6',
        border: '#ffe58f',
        label: 'Submitted',
        antColor: 'warning',
    },
    [EXAM_STATUSES.APPROVED]: {
        color: '#389e0d',
        bg: '#f6ffed',
        border: '#b7eb8f',
        label: 'Approved',
        antColor: 'success',
    },
    [EXAM_STATUSES.REJECTED]: {
        color: '#cf1322',
        bg: '#fff2f0',
        border: '#ffccc7',
        label: 'Rejected',
        antColor: 'error',
    },
    [EXAM_STATUSES.ARCHIVED]: {
        color: '#637381',
        bg: '#F4F6F8',
        border: '#DFE4EA',
        label: 'Archived',
        antColor: 'processing',
    },
};

/**
 * Valid status transitions map
 * Key: current status → Value: array of valid next statuses
 */
export const VALID_TRANSITIONS = {
    [EXAM_STATUSES.DRAFT]: [EXAM_STATUSES.SUBMITED],
    [EXAM_STATUSES.SUBMITED]: [EXAM_STATUSES.APPROVED, EXAM_STATUSES.REJECTED],
    [EXAM_STATUSES.APPROVED]: [], // terminal state
    [EXAM_STATUSES.REJECTED]: [EXAM_STATUSES.DRAFT],
};

/**
 * Check if a status transition is valid
 */
export const canTransition = (from, to) => {
    const allowed = VALID_TRANSITIONS[from];
    return Array.isArray(allowed) && allowed.includes(to);
};

/**
 * Get list of valid next statuses for a given status
 */
export const getValidNextStatuses = (currentStatus) => {
    return VALID_TRANSITIONS[currentStatus] || [];
};
