import React, { useState } from 'react';
import {
  Table,
  Input,
  Select,
  Pagination,
  Button,
  Space,
  Tag,
  Empty,
  message,
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  useGetTopics,
  useDeleteTopic,
  useDeleteTopicSectionByTopicId,
  useUpdateTopic,
} from '../../features/topic/hooks';
import useConfirm from '@shared/hook/useConfirm';
import { useDebouncedValue } from '@shared/hook/useDebounceValue';
import { STATUS_CONFIG } from '@shared/lib/constants/examStatus';
import { Tooltip as AntTooltip } from 'antd';

const { Option } = Select;

const PAGE_SIZE_OPTIONS = [
  { value: 5, label: '05 / pages' },
  { value: 10, label: '10 / pages' },
  { value: 20, label: '20 / pages' },
  { value: 50, label: '50 / pages' },
];

const STATUS_CARDS = [
  {
    key: 'Submited',
    label: 'Submitted',
    color: '#D97706',
    bg: '#FFFBEB',
    icon: <ClockCircleOutlined />,
  },
  {
    key: 'approved',
    label: 'Approved',
    color: '#059669',
    bg: '#ECFDF5',
    icon: <CheckCircleOutlined />,
  },
  {
    key: 'Draft',
    label: 'Draft',
    color: '#6B7280',
    bg: '#FFF7ED',
    icon: <ExclamationCircleOutlined />,
  },
  {
    key: 'Rejected',
    label: 'Rejected',
    color: '#DC2626',
    bg: '#FEF2F2',
    icon: <CloseCircleOutlined />,
  },
];

const TopicListPage = () => {
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);

  const isAdmin = Array.isArray(role)
    ? role.some(
        (r) => r.toLowerCase() === 'admin' || r.toLowerCase() === 'superadmin'
      )
    : typeof role === 'string' &&
      (role.toLowerCase() === 'admin' || role.toLowerCase() === 'superadmin');

  const { openConfirmModal, ModalComponent } = useConfirm();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 500);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useGetTopics({
    searchName: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    pageSize,
  });

  const topics = data?.data || [];
  const totalItems = data?.totalItems || 0;
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const deleteTopic = useDeleteTopic();
  const deleteTopicSectionsByTopicId = useDeleteTopicSectionByTopicId();
  const { mutateAsync: updateTopic } = useUpdateTopic();

  const counts = {
    Submited: data?.statusCounts?.submited || 0,
    approved: data?.statusCounts?.approved || 0,
    Draft: data?.statusCounts?.draft || 0,
    Rejected: data?.statusCounts?.rejected || 0,
  };

  const handleApproveTopic = (topic) => {
    openConfirmModal({
      title: 'Approve Exam',
      message: `Are you sure you want to approve "${topic.Name}"? This will make the exam available for students.`,
      okText: 'Approve',
      okButtonColor: '#52c41a',
      onConfirm: async () => {
        try {
          await updateTopic({ id: topic.ID, data: { Status: 'approved' } });
          message.success('Exam approved successfully');
        } catch (error) {
          message.error('Failed to approve exam');
        }
      },
    });
  };

  const handleRejectTopic = (topic) => {
    openConfirmModal({
      title: 'Reject Exam',
      message: `Are you sure you want to reject "${topic.Name}"? The teacher will need to review and submit it again.`,
      okText: 'Reject',
      okButtonColor: '#FF4D4F',
      onConfirm: async () => {
        try {
          await updateTopic({
            id: topic.ID,
            data: { Status: 'rejected', ReasonReject: null },
          });
          message.success('Exam rejected successfully');
        } catch (error) {
          message.error('Failed to reject exam');
        }
      },
    });
  };

  const handleDeleteTopic = (topic) => {
    openConfirmModal({
      title: 'Are you sure you want to delete this topic?',
      message: 'After deleting this topic it will no longer appear.',
      okText: 'Delete',
      okButtonColor: '#FF4D4F',
      onConfirm: async () => {
        try {
          if (['approved', 'submited'].includes(topic.Status)) {
            message.error(
              'Cannot delete topic with status Approved or Submited'
            );
            return;
          }
          await deleteTopicSectionsByTopicId.mutateAsync(topic.ID);
          await deleteTopic.mutateAsync(topic.ID);
          message.success('Topic and its TopicSections deleted successfully');
        } catch (error) {
          console.error(error);
          message.error('Failed to delete topic or its Sections');
        }
      },
    });
  };

  const onStartHandler = (record) => {
    localStorage.setItem('listening_test_answers', []);
    localStorage.setItem('listening_formatted_answers', []);
    localStorage.setItem('listening_played_questions', []);
    localStorage.removeItem('listening_test_submitted');
    localStorage.removeItem('isSubmitted');
    localStorage.removeItem('grammarAnswers');
    localStorage.removeItem('readingAnswers');
    localStorage.removeItem('writingAnswers');
    localStorage.removeItem('timeRemainingData');
    localStorage.removeItem('readingSubmitted');
    navigate(`/waiting-for-approval/${record.ID}`);
  };

  const handleEditTopic = (topic) => {
    if (['approved', 'submited'].includes(topic.Status)) {
      message.error('Cannot edit topic with status Approved or Submited');
      return;
    }
    navigate(`/exam/edit/${topic.ID}`);
  };

  const columns = [
    {
      title: 'TOPIC NAME',
      dataIndex: 'Name',
      key: 'Name',
      ellipsis: true,
      render: (text) => (
        <span className='font-semibold text-[#111827]'>{text}</span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'Status',
      key: 'Status',
      width: 140,
      render: (_, record) => {
        const cfg = STATUS_CONFIG[record.Status] || {};
        const tagElement = (
          <Tag
            color={cfg.antColor}
            className='font-medium px-3 py-1 rounded-md'
          >
            {cfg.label || record.Status}
          </Tag>
        );
        if (record.Status === 'rejected') {
          return (
            <AntTooltip
              title={
                record.ReasonReject
                  ? record.ReasonReject
                  : 'No reject reason provided'
              }
            >
              {tagElement}
            </AntTooltip>
          );
        }
        return tagElement;
      },
    },
    {
      title: 'CREATION DAY',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => (
        <span className='text-[#637381]'>
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'UPDATE DATE',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (date) => (
        <span className='text-[#637381]'>
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'action',
      align: 'center',
      width: 200,
      render: (_, record) => {
        const isSubmitted = record.Status === 'submited';
        const isApproved = record.Status === 'approved';
        const canModify = isSubmitted || isApproved;

        return (
          <div className='flex items-center justify-center gap-2'>
            <AntTooltip title='View'>
              <button
                className='cursor-pointer border-none bg-transparent hover:opacity-70 transition-all'
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`view/${record.ID}`);
                }}
              >
                <EyeOutlined style={{ fontSize: '18px', color: '#003087' }} />
              </button>
            </AntTooltip>

            {isSubmitted && isAdmin && (
              <>
                <AntTooltip title='Approve'>
                  <button
                    className='cursor-pointer border-none bg-transparent hover:opacity-70 transition-all'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApproveTopic(record);
                    }}
                  >
                    <CheckCircleOutlined
                      style={{ fontSize: '18px', color: '#13C296' }}
                    />
                  </button>
                </AntTooltip>
                <AntTooltip title='Reject'>
                  <button
                    className='cursor-pointer border-none bg-transparent hover:opacity-70 transition-all'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRejectTopic(record);
                    }}
                  >
                    <CloseCircleOutlined
                      style={{ fontSize: '18px', color: '#FF4D4F' }}
                    />
                  </button>
                </AntTooltip>
              </>
            )}

            {!canModify && (
              <>
                <AntTooltip title='Edit'>
                  <button
                    className='cursor-pointer border-none bg-transparent hover:opacity-70 transition-all'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTopic(record);
                    }}
                  >
                    <EditOutlined
                      style={{ fontSize: '18px', color: '#003087' }}
                    />
                  </button>
                </AntTooltip>
                <AntTooltip title='Delete'>
                  <button
                    className='cursor-pointer border-none bg-transparent hover:opacity-70 transition-all'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTopic(record);
                    }}
                  >
                    <DeleteOutlined
                      style={{ fontSize: '18px', color: '#FF4D4F' }}
                    />
                  </button>
                </AntTooltip>
              </>
            )}

            <AntTooltip title='Mock Test'>
              <button
                className='cursor-pointer border-none bg-transparent hover:opacity-70 transition-all'
                onClick={() => onStartHandler(record)}
              >
                <PlayCircleOutlined
                  style={{ fontSize: '18px', color: '#003087' }}
                />
              </button>
            </AntTooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div className='figma-page-container'>
      <ModalComponent />

      <div className='figma-content-wrapper'>
        {/* Header */}
        <div className='figma-header-section'>
          <div>
            <h1 className='figma-title'>Exam Management</h1>
            <p className='figma-subtitle'>Manage and track all exam topics</p>
          </div>
          <div className='flex items-center gap-3 pt-4'>
            <Button
              className='figma-primary-btn'
              onClick={() => navigate('create')}
              icon={<PlusOutlined />}
            >
              Create New Topic
            </Button>
          </div>
        </div>

        {/* Status Summary Cards */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          {STATUS_CARDS.map((card) => (
            <div
              key={card.key}
              className='figma-stat-card'
              style={{ borderLeft: `4px solid ${card.color}` }}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p
                    className='text-sm font-medium mb-1'
                    style={{ color: card.color }}
                  >
                    {card.label}
                  </p>
                  <p className='text-2xl font-bold text-[#111827]'>
                    {counts[card.key]}
                  </p>
                </div>
                <div
                  className='w-10 h-10 rounded-xl flex items-center justify-center'
                  style={{ background: card.bg, color: card.color, fontSize: 20 }}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className='figma-filter-bar'>
          <div className='flex flex-wrap items-center gap-4'>
            <Input
              allowClear
              placeholder='Search topic name...'
              prefix={<SearchOutlined className='text-[#6B7280] mr-2' />}
              value={search}
              maxLength={255}
              onChange={(e) => {
                const sanitized = e.target.value.replace(
                  /[^a-zA-Z0-9 ,.\-_:]/g,
                  ''
                );
                setPage(1);
                setSearch(sanitized);
              }}
              className='figma-search-input'
            />
            <Select
              value={statusFilter}
              onChange={(val) => {
                setPage(1);
                setStatusFilter(val);
              }}
              style={{ width: 180 }}
              size='large'
              className='figma-filter-select'
            >
              <Option value='all'>All Statuses</Option>
              <Option value='submited'>Submitted</Option>
              <Option value='draft'>Draft</Option>
              <Option value='approved'>Approved</Option>
              <Option value='rejected'>Rejected</Option>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className='figma-table-card'>
          <Table
            rowKey='ID'
            columns={columns}
            dataSource={topics}
            loading={isLoading}
            pagination={false}
            className='figma-table-overrides'
            scroll={{ x: 800 }}
            locale={{
              emptyText: <Empty description='No topics found.' />,
            }}
          />
        </div>

        {/* Pagination */}
        <div className='figma-pagination-wrapper'>
          <div className='figma-pagination-box'>
            <div className='figma-pagination-text whitespace-nowrap'>
              {totalItems === 0
                ? 'No entries found'
                : `Showing ${String(startItem).padStart(2, '0')}-${String(endItem).padStart(2, '0')} of ${totalItems}`}
            </div>

            <div className='figma-pagination-nav-group'>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={totalItems}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
                itemRender={(pg, type, original) => {
                  if (type === 'page') {
                    const isActive = page === pg;
                    return (
                      <button
                        className={`figma-page-btn ${isActive ? 'active' : ''}`}
                      >
                        {pg}
                      </button>
                    );
                  }
                  if (type === 'prev') {
                    return (
                      <button className='figma-symbol-btn' type='button'>
                        {'\u2039'}
                      </button>
                    );
                  }
                  if (type === 'next') {
                    return (
                      <button className='figma-symbol-btn' type='button'>
                        {'\u203A'}
                      </button>
                    );
                  }
                  if (type === 'jump-prev' || type === 'jump-next') {
                    return (
                      <span
                        className='text-[#637381] px-1'
                        style={{ fontSize: '16px', lineHeight: '25px' }}
                      >
                        ...
                      </span>
                    );
                  }
                  return original;
                }}
              />
            </div>

            <div className='figma-page-size-container'>
              <Select
                value={pageSize}
                onChange={(val) => {
                  setPageSize(val);
                  setPage(1);
                }}
                bordered={false}
                className='figma-page-size-select'
                options={PAGE_SIZE_OPTIONS}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicListPage;
