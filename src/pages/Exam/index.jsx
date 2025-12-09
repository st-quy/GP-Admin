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
  Tag,
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
import {
  useGetTopics,
  useDeleteTopic,
  useDeleteTopicSectionByTopicId,
} from '../../features/topic/hooks';
import useConfirm from '@shared/hook/useConfirm';

const { Option } = Select;
const { Text } = Typography;

const statusTagConfig = {
  submited: { bg: 'bg-amber-100', text: 'text-gray-700', label: 'Submited' },
  approved: { bg: 'bg-emerald-100', text: 'text-gray-700', label: 'Approved' },
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
  rejected: { bg: 'bg-rose-100', text: 'text-gray-700', label: 'Rejected' },
};

const TopicListPage = () => {
  const navigate = useNavigate();
  const { openConfirmModal, ModalComponent } = useConfirm();

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Query topics from backend with params
  const { data, isLoading } = useGetTopics({
    searchName: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    pageSize,
  });

  const topics = data?.data || [];
  const totalItems = data?.totalItems || 0;

  const deleteTopic = useDeleteTopic();
  const deleteTopicSectionsByTopicId = useDeleteTopicSectionByTopicId();

  const counts = {
    Submited: data?.statusCounts?.submited || 0,
    approved: data?.statusCounts?.approved || 0,
    Draft: data?.statusCounts?.draft || 0,
    Rejected: data?.statusCounts?.rejected || 0,
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
    localStorage.removeItem('listening_test_submitted', false);
    localStorage.removeItem('isSubmitted', false);
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
    navigate(`edit/${topic.ID}`);
  };

  const columns = [
    {
      title: 'Topic Name',
      dataIndex: 'Name',
      key: 'Name',
      render: (text) => (
        <span className='font-medium text-gray-800'>{text}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'Status',
      render: (status) => {
        const cfg = statusTagConfig[status] || {};
        return (
          <Tag
            className={`${cfg.bg} ${cfg.text} font-medium px-3 py-1 rounded-md`}
          >
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: 'Creator',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (text) => (
        <span className='font-medium text-gray-800'>{text}</span>
      ),
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
      title: 'Updator',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      render: (text) => (
        <span className='font-medium text-gray-800'>{text}</span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => {
        const canModify =
          record.Status === 'submited' || record.Status === 'approved';
        return (
          <Space size='middle'>
            <Button
              type='text'
              icon={<EyeOutlined />}
              className='text-[#1890FF]'
              onClick={(e) => {
                e.stopPropagation();
                navigate(`view/${record.ID}`);
              }}
            />
            {!canModify && (
              <>
                <Button
                  type='text'
                  icon={<EditOutlined />}
                  className='text-[#1890FF]'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditTopic(record);
                  }}
                />

                <Button
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
              className='p-0 flex items-center'
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
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
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
              pagination={false}
            />

            {/* Pagination */}
            <div className='flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 p-4 border-t border-gray-100'>
              <Text className='text-gray-500'>
                {totalItems === 0
                  ? 'No data'
                  : `Showing ${(page - 1) * pageSize + 1}–${Math.min(
                      page * pageSize,
                      totalItems
                    )} of ${totalItems}`}
              </Text>

              <div className='flex items-center gap-4 [&_.ant-pagination-item>a]:text-black [&_.ant-pagination-item-active>a]:text-blue-600'>
                <Pagination
                  current={page}
                  total={totalItems}
                  pageSize={pageSize}
                  showSizeChanger={false}
                  onChange={(p) => setPage(p)}
                />

                <Select
                  className='w-[120px]'
                  value={String(pageSize)}
                  onChange={(val) => {
                    setPageSize(Number(val));
                    setPage(1);
                  }}
                >
                  <Option value='5'>5 / page</Option>
                  <Option value='10'>10 / page</Option>
                  <Option value='20'>20 / page</Option>
                </Select>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TopicListPage;
