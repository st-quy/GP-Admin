import React, { useState } from 'react';
import {
  Card,
  Table,
  Input,
  Select,
  Pagination,
  Space,
  Button,
  Typography,
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
} from '@ant-design/icons';

import HeaderInfo from '@app/components/HeaderInfo';
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
import { Tag, Tooltip as AntTooltip } from 'antd';

const { Option } = Select;
const { Text } = Typography;

const TopicListPage = () => {
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);
  
  // Robust check for admin role
  const isAdmin = Array.isArray(role) 
    ? role.some(r => r.toLowerCase() === 'admin' || r.toLowerCase() === 'superadmin')
    : (typeof role === 'string' && (role.toLowerCase() === 'admin' || role.toLowerCase() === 'superadmin'));
    
  const { openConfirmModal, ModalComponent } = useConfirm();

  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 500);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [targetTopic, setTargetTopic] = useState(null);

  // Query topics from backend with params
  const { data, isLoading } = useGetTopics({
    searchName: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    pageSize,
  });

  const topics = data?.data || [];
  const totalItems = data?.totalItems || 0;

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
      title: 'Topic Name',
      dataIndex: 'Name',
      key: 'Name',
      ellipsis: true,
      render: (text) => (
        <span className='font-medium text-gray-800'>{text}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'Status',
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
      title: 'Creation day',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span className='text-gray-500 text-sm'>
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'Update date',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => (
        <span className='text-gray-500 text-sm'>
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      // ellipsis: true,
      render: (_, record) => {
        const isSubmitted = record.Status === 'submited';
        const isApproved = record.Status === 'approved';
        const canModify = isSubmitted || isApproved;
        
        return (
          <Space size='middle'>
            <Button
              title='Review Topic'
              type='text'
              icon={<EyeOutlined />}
              className='text-[#1890FF]'
              onClick={(e) => {
                e.stopPropagation();
                navigate(`view/${record.ID}`);
              }}
            />

            {isSubmitted && isAdmin && (
              <>
                <Button
                  title='Approve Topic'
                  type='text'
                  icon={<CheckCircleOutlined />}
                  className='text-[#52c41a]'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApproveTopic(record);
                  }}
                />
                <Button
                  title='Reject Topic'
                  type='text'
                  icon={<CloseCircleOutlined />}
                  className='text-[#FF4D4F]'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRejectTopic(record);
                  }}
                />
              </>
            )}

            {!canModify && (
              <>
                <Button
                  title='Edit Topic'
                  type='text'
                  icon={<EditOutlined />}
                  className='text-[#1890FF]'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditTopic(record);
                  }}
                />

                <Button
                  title='Delete Topic'
                  type='text'
                  icon={<DeleteOutlined />}
                  className='text-[#FF4D4F]'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTopic(record);
                  }}
                />
              </>
            )}
            <PlayCircleOutlined
              title='Do mock test'
              type='link'
              className='p-0 flex items-center cursor-pointer'
              onClick={() => onStartHandler(record)}
            />
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <ModalComponent />
      
      <HeaderInfo
        title='Topic List'
        subtitle='Manage and track all topics'
        SubAction={
          <Button
            className='w-full p-5 bg-white text-black border border-gray-300 hover:!bg-gray-100 rounded-lg shadow-sm'
            onClick={() => navigate('create')}
          >
            Create New Topic
          </Button>
        }
      />

      <div className='bg-gray-50 p-6'>
        <div className='mx-auto space-y-6'>
          {/* Summary Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card className='shadow-sm border-none'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-amber-500 text-sm'>Submited</div>
                  <div className='text-2xl font-semibold mt-1'>
                    {counts.Submited}
                  </div>
                </div>
                <div className='w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center'>
                  <ClockCircleOutlined className='text-gray-500' />
                </div>
              </div>
            </Card>

            <Card className='shadow-sm border-none'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-emerald-500 text-sm'>Approved</div>
                  <div className='text-2xl font-semibold mt-1'>
                    {counts.approved}
                  </div>
                </div>
                <div className='w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center'>
                  <CheckCircleOutlined className='text-emerald-500' />
                </div>
              </div>
            </Card>

            <Card className='shadow-sm border-none'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-gray-500 text-sm'>Draft</div>
                  <div className='text-2xl font-semibold mt-1'>
                    {counts.Draft}
                  </div>
                </div>
                <div className='w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center'>
                  <ExclamationCircleOutlined className='text-amber-500' />
                </div>
              </div>
            </Card>

            <Card className='shadow-sm border-none'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-rose-500 text-sm'>Rejected</div>
                  <div className='text-2xl font-semibold mt-1'>
                    {counts.Rejected}
                  </div>
                </div>
                <div className='w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center'>
                  <CloseCircleOutlined className='text-rose-500' />
                </div>
              </div>
            </Card>
          </div>

          {/* Table + Filters */}
          <Card className='shadow-sm border-none'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4'>
              <Input
                allowClear
                className='sm:max-w-xs'
                placeholder='Search topic name...'
                prefix={<SearchOutlined />}
                value={search}
                maxLength={255}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:]/g, '');

                  setPage(1);
                  setSearch(sanitized);
                }}
              />

              <Select
                className='w-40'
                value={statusFilter}
                onChange={(val) => {
                  setPage(1);
                  setStatusFilter(val);
                }}
              >
                <Option value='all'>All Statuses</Option>
                <Option value='submited'>Submited</Option>
                <Option value='draft'>Draft</Option>
                <Option value='approved'>Approved</Option>
                <Option value='rejected'>Rejected</Option>
              </Select>
            </div>

            <Table
              rowKey='ID'
              columns={columns}
              dataSource={topics}
              loading={isLoading}
              pagination={{
                current: page,
                pageSize: pageSize,
                total: totalItems,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20'],
                onChange: (p, ps) => {
                  setPage(p);
                  setPageSize(ps);
                },
                position: ['bottomRight'],
                showTotal: (total, range) => 
                  `${range[0]}–${range[1]} of ${total} items`,
              }}
            />
          </Card>
        </div>
      </div>
    </>
  );
};

export default TopicListPage;
