import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Select,
  Pagination,
  Space,
  Button,
  Typography,
  message,
  Row,
  Col,
  Tag,
  Tooltip as AntTooltip,
  ConfigProvider,
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
  PlusCircleOutlined,
  FileTextOutlined,
  FolderAddOutlined,
  CopyOutlined,
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  useGetTopics,
  useDeleteTopic,
  useDeleteTopicSectionByTopicId,
  useUpdateTopic,
  useDuplicateTopic,
  useBulkUpdateTopicsStatus,
  useBulkDeleteTopics,
  useBulkDuplicateTopics,
} from '../../features/topic/hooks';
import useConfirm from '@shared/hook/useConfirm';
import { useDebouncedValue } from '@shared/hook/useDebounceValue';
import { STATUS_CONFIG } from '@shared/lib/constants/examStatus';
import SearchInput from "@/app/components/SearchInput.jsx";
import { StatCard } from "../../features/dashboard/components/StatCard";
import BulkActionToolbar from '@shared/ui/BulkActionToolbar';

const { Text } = Typography;

const TopicListPage = () => {
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);
  
  const isAdmin = Array.isArray(role) 
    ? role.some(r => r.toLowerCase() === 'admin' || r.toLowerCase() === 'superadmin')
    : (typeof role === 'string' && (role.toLowerCase() === 'admin' || role.toLowerCase() === 'superadmin'));
    
  const { openConfirmModal, ModalComponent } = useConfirm();

  // Selection
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const onSearchChange = (event) => {
    const rawValue = event.target.value;
    let cleanValue = rawValue;

    if (/[^a-zA-Z0-9\s]/.test(cleanValue)) {
      message.warning('Special characters and emojis are not allowed in search.');
      cleanValue = cleanValue.replace(/[^a-zA-Z0-9\s]/g, '');
    }

    if (/\s{2,}/.test(cleanValue)) {
      message.info('Multiple spaces are not allowed; collapsed to a single space.');
      cleanValue = cleanValue.replace(/\s{2,}/g, ' ');
    }

    if (cleanValue.length > 50) {
      message.error('Search limit reached (max 50 characters).');
      cleanValue = cleanValue.slice(0, 50);
    }

    cleanValue = cleanValue.replace(/^\s+/, '');
    setSearch(cleanValue);
    setPage(1);
  };

  const debouncedSearch = useDebouncedValue(search, 500);

  // Query topics from backend with params
  const { data, isLoading, refetch } = useGetTopics({
    searchName: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    pageSize,
  });

  const topics = data?.data || [];
  const totalItems = data?.totalItems || 0;

  const deleteTopic = useDeleteTopic();
  const { mutateAsync: updateTopic } = useUpdateTopic();
  const { mutateAsync: duplicateTopic } = useDuplicateTopic();
  const { mutateAsync: bulkUpdateTopics } = useBulkUpdateTopicsStatus();
  const { mutateAsync: bulkDeleteTopics } = useBulkDeleteTopics();
  const { mutateAsync: bulkDuplicateTopics } = useBulkDuplicateTopics();

  const counts = {
    Submited: data?.statusCounts?.submited || 0,
    approved: data?.statusCounts?.approved || 0,
    Draft: data?.statusCounts?.draft || 0,
    Rejected: data?.statusCounts?.rejected || 0,
    Archived: data?.statusCounts?.archived || 0,
  };

  const handleArchiveTopic = (topic) => {
    openConfirmModal({
      title: 'Archive Exam',
      message: `Are you sure you want to archive "${topic.Name}"? Once archived, it cannot be edited.`,
      okText: 'Archive',
      okButtonColor: '#637381',
      onConfirm: async () => {
        try {
          await updateTopic({ id: topic.ID, data: { Status: 'archived' } });
          message.success('Exam archived successfully');
          refetch();
        } catch (error) {
          message.error('Failed to archive exam');
        }
      },
    });
  };

  const handleDuplicateTopic = (topic) => {
    openConfirmModal({
      title: 'Duplicate Exam',
      message: `Are you sure you want to duplicate "${topic.Name}"? This will create a new editable draft.`,
      okText: 'Duplicate',
      okButtonColor: '#003087',
      onConfirm: async () => {
        try {
          await duplicateTopic(topic.ID);
          message.success(`Exam "${topic.Name}" duplicated successfully`);
          refetch();
        } catch (error) {
          // Error message is handled in the hook
        }
      },
    });
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
          refetch();
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
          refetch();
        } catch (error) {
          message.error('Failed to reject exam');
        }
      },
    });
  };

  const handleDeleteTopic = (topic) => {
    openConfirmModal({
      title: 'Are you sure you want to delete this topic?',
      message: `After deleting "${topic.Name}", it will no longer appear in the system.`,
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

          await deleteTopic.mutateAsync(topic.ID);

          message.success(`Exam set "${topic.Name}" deleted successfully`);
          refetch();
        } catch (error) {
          console.error(error);
          message.error(error?.response?.data?.message || `Failed to delete exam set "${topic.Name}"`);
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
    if (['approved', 'submited', 'archived'].includes(topic.Status)) {
      message.error('Cannot edit topic with current status');
      return;
    }
    navigate(`/exam/edit/${topic.ID}`);
  };

  const columns = [
    {
      title: <span className="font-bold text-[#637381]">TOPIC NAME</span>,
      dataIndex: 'Name',
      key: 'Name',
      width: '300px',
      align: 'center',
      ellipsis: true,
      render: (text) => (
        <span className="font-medium text-primaryTextColor">{text}</span>
      ),
    },
    {
      title: <span className="font-bold text-[#637381]">STATUS</span>,
      dataIndex: 'Status',
      key: 'Status',
      width: '120px',
      align: 'center',
      render: (status) => {
        const statusMap = {
          draft: { color: 'orange', label: 'Draft' },
          submited: { color: 'blue', label: 'Submitted' },
          approved: { color: 'green', label: 'Approved' },
          rejected: { color: 'red', label: 'Rejected' },
          archived: { color: 'default', label: 'Archived' },
        };

        const config = statusMap[status] || { color: 'default', label: status };
        return (
          <Tag color={config.color} className="!m-0">
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: <span className="font-bold text-[#637381]">CREATION DAY</span>,
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '150px',
      align: 'center',
      render: (date) => (
        <span className="font-medium text-primaryTextColor">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: <span className="font-bold text-[#637381]">UPDATE DATE</span>,
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: '150px',
      align: 'center',
      render: (date) => (
        <span className="font-medium text-primaryTextColor">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: <span className="font-bold text-[#637381]">ACTIONS</span>,
      key: 'action',
      width: '200px',
      align: 'center',
      render: (_, record) => {
        const isSubmitted = record.Status === 'submited';
        const isApproved = record.Status === 'approved';
        const isRejected = record.Status === 'rejected';
        const isArchived = record.Status === 'archived';
        
        const canEdit = !isSubmitted && !isApproved && !isArchived;
        const canArchive = isApproved || isRejected;
        
        return (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`view/${record.ID}`);
              }}
              className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70"
              title="Review Topic"
            >
              <EyeOutlined style={{ fontSize: "20px", color: "#003087" }} />
            </button>

            {isSubmitted && isAdmin && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApproveTopic(record);
                  }}
                  className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70"
                  title="Approve Topic"
                >
                  <CheckCircleOutlined style={{ fontSize: "20px", color: "#22AD5C" }} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRejectTopic(record);
                  }}
                  className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70"
                  title="Reject Topic"
                >
                  <CloseCircleOutlined style={{ fontSize: "20px", color: "#FF4D4F" }} />
                </button>
              </>
            )}

            {canEdit ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditTopic(record);
                }}
                className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70"
                title="Edit Topic"
              >
                <EditOutlined style={{ fontSize: "20px", color: "#003087" }} />
              </button>
            ) : (
              <span
                className="cursor-not-allowed opacity-40"
                title="Archived or submitted topics cannot be edited"
              >
                <EditOutlined style={{ fontSize: "20px", color: "#003087" }} />
              </span>
            )}

            {canArchive ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleArchiveTopic(record);
                }}
                className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70"
                title="Archive Topic"
              >
                <FolderAddOutlined style={{ fontSize: "20px", color: "#637381" }} />
              </button>
            ) : (
              <span
                className="cursor-not-allowed opacity-40"
                title="Only approved or rejected topics can be archived"
              >
                <FolderAddOutlined style={{ fontSize: "20px", color: "#637381" }} />
              </span>
            )}

            {(canEdit || isArchived || isRejected) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTopic(record);
                }}
                className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70"
                title="Delete Topic"
              >
                <DeleteOutlined style={{ fontSize: "20px", color: "#FF4D4F" }} />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicateTopic(record);
              }}
              className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70"
              title="Duplicate Topic"
            >
              <CopyOutlined style={{ fontSize: "20px", color: "#003087" }} />
            </button>

            <button
              onClick={() => onStartHandler(record)}
              className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70"
              title="Do mock test"
            >
              <PlayCircleOutlined style={{ fontSize: "20px", color: "#003087" }} />
            </button>
          </div>
        );
      },
    },
  ];

  const total = totalItems;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    columnWidth: 60,
  };

  const handleBulkApprove = () => {
    openConfirmModal({
      title: 'Approve Selected Exams',
      message: `Are you sure you want to approve ${selectedRowKeys.length} selected exams?`,
      okText: 'Approve All',
      okButtonColor: '#52c41a',
      onConfirm: async () => {
        try {
          await bulkUpdateTopics({ ids: selectedRowKeys, status: 'approved' });
          message.success(`${selectedRowKeys.length} exams approved successfully`);
          setSelectedRowKeys([]);
          refetch();
        } catch (error) {
          message.error('Failed to approve some exams');
        }
      },
    });
  };

  const handleBulkReject = () => {
    openConfirmModal({
      title: 'Reject Selected Exams',
      message: `Are you sure you want to reject ${selectedRowKeys.length} selected exams?`,
      okText: 'Reject All',
      okButtonColor: '#FF4D4F',
      onConfirm: async () => {
        try {
          await bulkUpdateTopics({ ids: selectedRowKeys, status: 'rejected' });
          message.success(`${selectedRowKeys.length} exams rejected successfully`);
          setSelectedRowKeys([]);
          refetch();
        } catch (error) {
          message.error('Failed to reject some exams');
        }
      },
    });
  };

  const handleBulkDelete = () => {
    openConfirmModal({
      title: 'Delete Selected Exams',
      message: `Are you sure you want to delete ${selectedRowKeys.length} selected exams? This action cannot be undone.`,
      okText: 'Delete All',
      okButtonColor: '#FF4D4F',
      onConfirm: async () => {
        try {
          const response = await bulkDeleteTopics(selectedRowKeys);
          if (response?.data?.partialSuccess) {
            message.warning(response.data.message);
          } else {
            message.success(`${selectedRowKeys.length} exams deleted successfully`);
          }
          setSelectedRowKeys([]);
          refetch();
        } catch (error) {
          message.error(error?.response?.data?.message || 'Failed to delete some exams');
        }
      },
    });
  };

  const handleBulkDuplicate = () => {
    openConfirmModal({
      title: 'Duplicate Selected Exams',
      message: `Are you sure you want to duplicate ${selectedRowKeys.length} selected exams?`,
      okText: 'Duplicate All',
      okButtonColor: '#003087',
      onConfirm: async () => {
        try {
          await bulkDuplicateTopics(selectedRowKeys);
          message.success(`${selectedRowKeys.length} exams duplicated successfully`);
          setSelectedRowKeys([]);
          refetch();
        } catch (error) {
          message.error('Failed to duplicate some exams');
        }
      },
    });
  };

  const bulkActions = [
    {
      label: 'Approve',
      icon: <CheckCircleOutlined />,
      onClick: handleBulkApprove,
      disabled: !isAdmin,
    },
    {
      label: 'Reject',
      icon: <CloseCircleOutlined />,
      onClick: handleBulkReject,
      danger: true,
      disabled: !isAdmin,
    },
    {
      label: 'Duplicate',
      icon: <CopyOutlined />,
      onClick: handleBulkDuplicate,
    },
    {
      label: 'Delete',
      icon: <DeleteOutlined />,
      onClick: handleBulkDelete,
      danger: true,
    },
  ];

  return (
    <div className="figma-page-container">
      <div className="figma-content-wrapper">
        <ModalComponent />
        
        <BulkActionToolbar
          visible={selectedRowKeys.length > 0}
          selectedCount={selectedRowKeys.length}
          actions={bulkActions}
          onClearSelection={() => setSelectedRowKeys([])}
        />

        <div className="py-8">
          <div className="mb-10 flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h4 className="figma-title">Topic List</h4>
              <p className="figma-subtitle">Manage and track all topics</p>
            </div>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={() => navigate('create')}
              className="!h-[50px] !w-[210px] !rounded-[50px] !bg-primaryColor !text-white font-[500] leading-[24px] hover:!opacity-90"
            >
              Create New Topic
            </Button>
          </div>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
              <StatCard
                icon={<ClockCircleOutlined />}
                title="Submitted"
                value={counts.Submited}
                color="#003087"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                icon={<CheckCircleOutlined />}
                title="Approved"
                value={counts.approved}
                color="#22AD5C"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                icon={<ExclamationCircleOutlined />}
                title="Draft"
                value={counts.Draft}
                color="#F2994A"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                icon={<FileTextOutlined />}
                title="Archived"
                value={counts.Archived}
                color="#637381"
              />
            </Col>
          </Row>

          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto'>
              <SearchInput
                placeholder="Search topic name..."
                value={search}
                onSearchChange={onSearchChange}
                isFigmaRedesign={true}
                style={{ margin: 0 }}
              />
              <div className="status-select-wrapper">
                <Select
                  placeholder="Select STATUS"
                  value={statusFilter}
                  onChange={(val) => {
                    setPage(1);
                    setStatusFilter(val);
                  }}
                  className="figma-status-select-sync"
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'submited', label: 'Submited' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                    { value: 'archived', label: 'Archived' },
                  ]}
                />
              </div>
            </div>
          </div>

          <style>{`
            .status-select-wrapper .ant-select-selector {
              height: 48px !important;
              display: flex !important;
              align-items: center !important;
              border: 1px solid #DFE4EA !important;
              border-radius: 6px !important;
              box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1) !important;
              background-color: #ffffff !important;
              padding: 0 12px !important;
            }
            .status-select-wrapper .ant-select-selection-item,
            .status-select-wrapper .ant-select-selection-placeholder {
              line-height: 46px !important;
              display: flex !important;
              align-items: center !important;
            }
            .figma-status-select-sync.ant-select {
              width: 180px !important;
              height: 48px !important;
              margin: 0 !important;
            }
          `}</style>

           <div className="figma-table-card figma-table-overrides w-full">
             <Table
               rowKey='ID'
               columns={columns}
               dataSource={topics}
               loading={isLoading}
               pagination={false}
               rowSelection={rowSelection}
               scroll={{ x: "max-content" }}
             />
           </div>

          <div className="figma-pagination-wrapper">
            <div className="figma-pagination-box">
              <div className="figma-pagination-text whitespace-nowrap">
                {total === 0
                  ? "No entries found"
                  : `Showing ${String(start).padStart(2, "0")}-${String(end).padStart(2, "0")} of ${total}`}
              </div>

              <div className="figma-pagination-nav-group">
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  onChange={(p) => setPage(p)}
                  showSizeChanger={false}
                  itemRender={(pageNumber, type, original) => {
                    if (type === "page") {
                      const isActive = pageNumber === page;
                      return (
                        <button className={`figma-page-btn ${isActive ? "active" : ""}`}>
                          {pageNumber}
                        </button>
                      );
                    }
                    if (type === "prev") {
                      return (
                        <button className="figma-symbol-btn" type="button">
                          {"\u2039"}
                        </button>
                      );
                    }
                    if (type === "next") {
                      return (
                        <button className="figma-symbol-btn" type="button">
                          {"\u203A"}
                        </button>
                      );
                    }
                    if (type === "jump-prev" || type === "jump-next") {
                      return (
                        <span
                          className="text-[#637381] px-1"
                          style={{ fontSize: "16px", lineHeight: "25px" }}
                        >
                          ...
                        </span>
                      );
                    }
                    return original;
                  }}
                />
              </div>

              <div className="figma-page-size-container">
                <Select
                  value={pageSize}
                  onChange={(val) => {
                    setPageSize(val);
                    setPage(1);
                  }}
                  bordered={false}
                  className="figma-page-size-select"
                  options={[
                    { value: 5, label: "05 / pages" },
                    { value: 10, label: "10 / pages" },
                    { value: 20, label: "20 / pages" },
                    { value: 50, label: "50 / pages" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicListPage;
