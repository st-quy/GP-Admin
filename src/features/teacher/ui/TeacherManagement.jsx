import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Table, Input, Select, Tag, Pagination, Empty, message, Tooltip } from 'antd';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  useDeleteTeacher,
  useFetchTeacherById,
  useFetchTeachers,
} from '../hook/useTeacherQuery';
import TeacherActionModal from './TeacherModal/ActionModal/TeacherActionModal';
import useConfirm from '@shared/hook/useConfirm';
import { useDebouncedValue } from '@shared/hook/useDebounceValue';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const PAGE_SIZE_OPTIONS = [
  { value: 5, label: '05 / pages' },
  { value: 10, label: '10 / pages' },
  { value: 20, label: '20 / pages' },
  { value: 50, label: '50 / pages' },
];

const TeacherManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const { id: editingTeacherId } = useParams();
  const editingTeacherIdNumber =
    typeof editingTeacherId === 'string' ? Number(editingTeacherId) : null;
  const { openConfirmModal, ModalComponent } = useConfirm();
  const { mutateAsync: deleteTeacher } = useDeleteTeacher();

  const escapeSearchTerm = (term) => {
    return term.replace(/([%_\\])/g, '\\$1');
  };

  const debouncedSearchTerm = useDebouncedValue(
    escapeSearchTerm(searchTerm),
    500
  );
  const { data: teachersData, isLoading, refetch } = useFetchTeachers({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchTerm,
    ...(statusFilter !== null && { status: statusFilter }),
  });
  const {
    data: teacherDetailData,
    isLoading: isTeacherDetailLoading,
  } = useFetchTeacherById(editingTeacherId, {
    enabled: Boolean(editingTeacherId),
  });

  const totalItems = teachersData?.data?.pagination?.total || 0;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handleStatusFilter = (value) => {
    if (value == null) {
      setStatusFilter(null);
      return;
    }
    if (value === 'All') {
      setStatusFilter(null);
    } else {
      setStatusFilter(value === 'Active');
    }
    setCurrentPage(1);
  };

  const handleDeleteTeacher = (record) => {
    openConfirmModal({
      title: 'Delete Teacher',
      message: `Are you sure you want to delete teacher "${record.firstName} ${record.lastName}"?`,
      okText: 'Delete',
      okButtonColor: '#ff4d4f',
      onConfirm: async () => {
        try {
          await deleteTeacher(record.ID);
          message.success('Teacher deleted successfully!');
          refetch();
        } catch (error) {
          message.error(
            error?.response?.data?.message ||
              'Failed to delete teacher. Please try again.'
          );
        }
      },
    });
  };

  const columns = [
    {
      title: 'TEACHER NAME',
      dataIndex: ['fullname'],
      key: 'name',
      render: (text, record) => (
        <Link
          to={`/teacher/edit/${record.ID}`}
          className='figma-class-link font-medium'
        >
          {`${record.firstName} ${record.lastName}` || 'Unknown'}
        </Link>
      ),
    },
    {
      title: 'TEACHER ID',
      dataIndex: 'teacherCode',
      key: 'id',
      width: 130,
      render: (text) => <span className='text-[#637381]'>{text}</span>,
    },
    {
      title: 'EMAIL',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
      render: (text) => <span className='text-[#637381]'>{text}</span>,
    },
    {
      title: 'PHONE',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (text) => <span className='text-[#637381]'>{text}</span>,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status) => (
        <Tag
          className={`rounded-3xl font-semibold py-1 px-4 text-center border-none text-sm ${
            status === true
              ? 'bg-[#DAF8E6] text-[#1A8245]'
              : 'bg-[#E5E7EB] text-[#374151]'
          }`}
        >
          {status === true ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className='flex gap-3 justify-center items-center'>
          <TeacherActionModal initialData={record} />
          <Tooltip title='Delete'>
            <button
              className='cursor-pointer border-none bg-transparent hover:opacity-70 transition-all'
              onClick={() => handleDeleteTeacher(record)}
            >
              <DeleteOutlined style={{ fontSize: '20px', color: '#FF4D4F' }} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const selectedTeacher =
    teacherDetailData ||
    teachersData?.data?.teachers?.find(
      (teacher) => teacher.ID === editingTeacherIdNumber
    ) ||
    null;

  const handleCloseEditModal = () => {
    navigate('/teacher');
  };

  return (
    <div className='w-full'>
      <ModalComponent />
      {selectedTeacher && (
        <TeacherActionModal
          initialData={selectedTeacher}
          open
          hideTrigger
          onClose={handleCloseEditModal}
        />
      )}

      {/* Header */}
      <div className='figma-header-section'>
        <div>
          <h1 className='figma-title'>Teacher Account Management</h1>
          <p className='figma-subtitle'>
            Manage and organize teacher accounts
          </p>
        </div>
        <div className='flex items-center gap-3 pt-4'>
          <TeacherActionModal />
        </div>
      </div>

      {/* Filters */}
      <div className='figma-filter-bar'>
        <div className='flex flex-wrap items-center gap-4'>
          <Input
            value={searchTerm}
            placeholder='Search by name, ID'
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className='figma-search-input'
            allowClear
            prefix={<SearchOutlined className='text-[#6B7280] mr-2' />}
          />
          <Select
            placeholder='Select Status'
            onChange={handleStatusFilter}
            style={{ width: 180 }}
            size='large'
            className='figma-filter-select'
            allowClear
          >
            <Option value='All'>All</Option>
            <Option value='Active'>Active</Option>
            <Option value='Inactive'>Inactive</Option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className='figma-table-card'>
        <Table
          columns={columns}
          dataSource={teachersData?.data?.teachers}
          rowKey={(record) => record.ID}
          scroll={{ x: 800 }}
          pagination={false}
          className='figma-table-overrides'
          loading={isLoading || isTeacherDetailLoading || !teachersData}
          locale={{
            emptyText: <Empty description='No teachers found.' />,
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
              current={currentPage}
              pageSize={pageSize}
              total={totalItems}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              itemRender={(page, type, original) => {
                if (type === 'page') {
                  const isActive = currentPage === page;
                  return (
                    <button
                      className={`figma-page-btn ${isActive ? 'active' : ''}`}
                    >
                      {page}
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
                setCurrentPage(1);
              }}
              bordered={false}
              className='figma-page-size-select'
              options={PAGE_SIZE_OPTIONS}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherManagement;
