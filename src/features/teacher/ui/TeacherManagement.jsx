import React, { useState } from 'react';
import { Table, Input, Select, Space, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useFetchTeachers } from '../hook/useTeacherQuery';
import TeacherActionModal from './TeacherModal/ActionModal/TeacherActionModal';
import useConfirm from '@shared/hook/useConfirm';
import { useDebouncedValue } from '@shared/hook/useDebounceValue';
const { Option } = Select;

const TeacherManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const { openConfirmModal, ModalComponent } = useConfirm();
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 500);
  const { data: teachersData, isLoading } = useFetchTeachers({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchTerm,
    ...(statusFilter !== null && { status: statusFilter }),
  });

  const handleStatusFilter = (value) => {
    if (value === 'All') {
      setStatusFilter(null);
    } else {
      const fil = value === 'Active' ? true : false;
      setStatusFilter(fil);
    }
  };

  const columns = [
    {
      title: 'TEACHER NAME',
      dataIndex: ['fullname'],
      key: 'name',
      width: '200px',
      render: (text, record) => (
        <div className='overflow-hidden text-ellipsis whitespace-nowrap'>
          <a className='cursor-pointer text-[10px] md:text-[14px] underline hover:opacity-80'>
            {`${record.firstName} ${record.lastName}` || 'Unknown'}
          </a>
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
          {status === true ? 'Active' : 'Deactive'}
        </Tag>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: '100px',
      // fixed: "right",
      render: (_, record) => (
        <Space size='small' className='bg-white rounded-lg px-1'>
          <TeacherActionModal initialData={record} />
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

  return (
    <div className='w-full'>
      <ModalComponent />
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
            <Option value='Deactive'>Deactive</Option>
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
