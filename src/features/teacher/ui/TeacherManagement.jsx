import React, { useState } from 'react';
import { Table, Input, Select, Space, Tag, message } from 'antd';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { useFetchTeachers } from '../hook/useTeacherQuery';
import TeacherActionModal from './TeacherModal/ActionModal/TeacherActionModal';
import useConfirm from '@shared/hook/useConfirm';
import { useDebouncedValue } from '@shared/hook/useDebounceValue';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteTeachers } from '../api/teacherAPI';
const { Option } = Select;

const TeacherManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const navigate = useNavigate();
  const { id: editingTeacherId } = useParams();
  const { openConfirmModal, ModalComponent } = useConfirm();
  
  // Escape special SQL-like characters for search
  const escapeSearchTerm = (term) => {
    return term.replace(/([%_\\])/g, '\\$1');
  };
  
  const debouncedSearchTerm = useDebouncedValue(escapeSearchTerm(searchTerm), 500);
  const { data: teachersData, isLoading, refetch } = useFetchTeachers({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchTerm,
    ...(statusFilter !== null && { status: statusFilter }),
  });

  const handleStatusFilter = (value) => {
    // When Select is cleared (allowClear), AntD passes undefined/null -> reset filter
    if (value == null) {
      setStatusFilter(null);
      return;
    }

    if (value === 'All') {
      setStatusFilter(null);
    } else {
      const fil = value === 'Active' ? true : false;
      setStatusFilter(fil);
    }
  };

  const handleDeleteTeacher = (record) => {
    openConfirmModal({
      title: 'Delete Teacher',
      message: `Are you sure you want to delete teacher "${record.firstName} ${record.lastName}"?`,
      okText: 'Delete',
      okButtonColor: '#ff4d4f',
      onConfirm: async () => {
        try {
          await deleteTeachers(record.ID);
          message.success('Teacher deleted successfully!');
          refetch();
        } catch (error) {
          message.error(
            error?.response?.data?.message || 'Failed to delete teacher. Please try again.'
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
      width: '200px',
      render: (text, record) => (
        <div className='overflow-hidden text-ellipsis whitespace-nowrap'>
          <button
            type='button'
            className='bg-transparent border-none p-0 cursor-pointer text-[10px] md:text-[14px] underline hover:opacity-80'
            onClick={() => navigate(`/teacher/edit/${record.ID}`)}
          >
            {`${record.firstName} ${record.lastName}` || 'Unknown'}
          </button>
        </div>
      ),
    },
    {
      title: 'TEACHER ID',
      dataIndex: 'teacherCode',
      key: 'id',
      width: '100px',
    },
    {
      title: 'EMAIL',
      dataIndex: 'email',
      key: 'email',
      width: '200px',
      ellipsis: true,
    },
    {
      title: 'PHONE',
      dataIndex: 'phone',
      key: 'phone',
      width: '100px',
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: '120px',
      align: 'center',
      render: (status) => (
        <Tag
          className={`rounded-3xl font-[600] py-1 text-center ${
            status === true
              ? 'bg-[#DAF8E6] text-[#1A8245]'
              : 'bg-[#E5E7EB] text-[#374151]'
          } border-none text-[10px] md:text-[14px]`}
        >
          {status === true ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: '150px',
      // fixed: "right",
      render: (_, record) => (
        <Space size='small' className='bg-white rounded-lg px-1'>
          <TeacherActionModal initialData={record} />
          <DeleteOutlined
            onClick={() => handleDeleteTeacher(record)}
            className='text-red-500 text-[18px] cursor-pointer hover:opacity-80'
          />
        </Space>
      ),
    },
  ];

  const tableComponents = {
    header: {
      cell: (props) => (
        <th
          {...props}
          style={{
            ...props.style,
            backgroundColor: '#E6F0FA',
            textAlign: 'center',
          }}
          className='text-primaryTextColor px-0 font-medium text-[10px] md:text-[14px] border-none'
        />
      ),
    },
    body: {
      cell: (props) => (
        <td
          {...props}
          style={{
            ...props.style,
            borderRightStyle: 'none',
            textAlign: 'center',
          }}
          className='text-primaryTextColor px-0 font-medium text-[10px] md:text-[14px] border-none'
        />
      ),
      row: (props) => (
        <tr {...props} style={{ ...props.style, border: 'none' }} />
      ),
    },
  };

  const selectedTeacher =
    teachersData?.data?.teachers?.find(
      (teacher) => teacher.ID === editingTeacherId
    ) || null;

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
      <div className='flex justify-between items-center mb-4'>
        <div className='flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0'>
          <Input
            value={searchTerm}
            placeholder='Search by name, ID'
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className='w-full md:w-[200px]'
            allowClear
            suffix={<SearchOutlined className='text-[#9CA3AF]' />}
          />
          <Select
            placeholder='Select STATUS'
            onChange={(value) => handleStatusFilter(value)}
            className='w-full md:w-[150px]'
            allowClear
          >
            <Option value='All'>All</Option>
            <Option value='Active'>Active</Option>
            <Option value='Inactive'>Inactive</Option>
          </Select>
        </div>
        <TeacherActionModal />
      </div>
      <Table
        // @ts-ignore
        columns={columns}
        dataSource={teachersData?.data?.teachers}
        rowKey={(record) => record.ID}
        scroll={{ x: 600 }}
        className='mb-4'
        components={tableComponents}
        loading={isLoading || !teachersData}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: teachersData?.data?.pagination?.total,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '15', '20'],
          showTotal: (total, range) =>
            `Showing ${range[0]}-${range[1]} of ${total}`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          itemRender: (page, type, original) => {
            if (type === 'page') {
              const isActive = currentPage === page; // FIX: phải dùng currentPage, không dùng pagination.page

              return (
                <button
                  className={`cursor-pointer min-w-[36px] h-[36px] flex items-center justify-center rounded-md border transition-all
            ${
              isActive
                ? 'bg-[#003087] text-white border-[#003087]'
                : 'bg-white text-gray-700 border-gray-300 hover:border-[#003087] hover:text-[#003087]'
            }
          `}
                >
                  {page}
                </button>
              );
            }

            return original;
          },
        }}
      />
    </div>
  );
};

export default TeacherManagement;
