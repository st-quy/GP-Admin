import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Typography,
  Pagination,
  Select,
  Tooltip,
  Modal,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { useDeleteSection, useGetSections } from '@features/sections/hooks';

const { Text, Title } = Typography;

const SKILL_OPTIONS = [
  { value: '', label: 'All Skills' },
  { value: 'SPEAKING', label: 'Speaking' },
  { value: 'LISTENING', label: 'Listening' },
  { value: 'READING', label: 'Reading' },
  { value: 'WRITING', label: 'Writing' },
  { value: 'GRAMMAR AND VOCABULARY', label: 'Grammar & Vocabulary' },
];

const QuestionBank = () => {
  const navigate = useNavigate();

  // --- Filter & pagination state ---
  const [selectedSkill, setSelectedSkill] = useState('');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // null = bulk, or single record

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSkill, searchText]);

  // --- API ---
  const sectionParams = useMemo(
    () => ({
      skillName: selectedSkill || undefined,
      searchName: searchText || undefined,
      page: currentPage,
      pageSize,
    }),
    [selectedSkill, searchText, currentPage, pageSize]
  );

  const { data: listSectionData, isLoading } = useGetSections(sectionParams);
  const { mutate: deleteSection } = useDeleteSection();

  const listPart = listSectionData?.data ?? [];
  const totalItems = listSectionData?.total ?? 0;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // --- Reset filters ---
  const handleResetFilters = () => {
    setSelectedSkill('');
    setSearchText('');
    setCurrentPage(1);
  };

  // --- Delete ---
  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteSection(deleteTarget.ID);
    } else {
      selectedRowKeys.forEach((id) => deleteSection(id));
    }
    setDeleteModalOpen(false);
    setDeleteTarget(null);
    setSelectedRowKeys([]);
  };

  const openDeleteModal = (record = null) => {
    setDeleteTarget(record);
    setDeleteModalOpen(true);
  };

  // --- Table columns ---
  const columns = [
    {
      title: 'Topic',
      dataIndex: 'Name',
      ellipsis: { showTitle: false },
      render: (text) => (
        <Tooltip title={text}>
          <span className='font-medium text-[#1F2937]'>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Skill',
      dataIndex: 'Skill',
      render: (_, record) => (
        <span className='text-[#4B5563]'>{record?.Skill?.Name || '—'}</span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'SubContent',
      ellipsis: { showTitle: false },
      render: (text) => (
        <span className='text-[#4B5563]'>{text || '—'}</span>
      ),
    },
    {
      title: 'Question Text',
      dataIndex: 'Description',
      ellipsis: { showTitle: false },
      render: (text) => (
        <Tooltip title={text}>
          <span className='text-[#4B5563]'>{text || '—'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      width: 180,
      render: (text) =>
        text ? (
          <span className='text-[#4B5563]'>
            {dayjs(text).format('HH:mm - DD/MM/YYYY')}
          </span>
        ) : (
          '—'
        ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className='flex items-center justify-center gap-2'>
          <Button
            type='text'
            className='!text-blue-600 hover:!bg-blue-50'
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${record.ID}?skillName=${record.Skill.Name}`);
            }}
          />
          <Button
            type='text'
            className='!text-green-600 hover:!bg-green-50'
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`update/${record.ID}?skillName=${record.Skill.Name}`);
            }}
          />
          <Button
            type='text'
            className='!text-red-500 hover:!bg-red-50'
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              openDeleteModal(record);
            }}
          />
        </div>
      ),
    },
  ];

  // --- Row selection ---
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  const deleteCount = deleteTarget ? 1 : selectedRowKeys.length;

  return (
    <div className='w-[90%] max-w-[1476px] mx-auto py-8 space-y-6'>
      {/* ===== HEADER ===== */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <Title level={3} className='!m-0 !font-bold !text-[#111928]'>
            Question Bank
          </Title>
          <Text className='text-[#6B7280] text-[16px]'>
            Manage and organize all your exam questions
          </Text>
        </div>
        <Button
          type='primary'
          size='large'
          onClick={() => navigate('create/speaking')}
          className='!rounded-full !bg-[#003087] hover:!bg-[#002060] !border-none !font-medium !h-[48px] !px-8'
        >
          Create New Question
        </Button>
      </div>

      {/* ===== FILTERS ===== */}
      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end'>
          <div>
            <Text className='block text-[#374151] font-medium mb-2'>Skill</Text>
            <Select
              value={selectedSkill}
              onChange={setSelectedSkill}
              options={SKILL_OPTIONS}
              className='w-full'
              size='large'
            />
          </div>
          <div>
            <Text className='block text-[#374151] font-medium mb-2'>Search</Text>
            <Input
              size='large'
              placeholder='Search question...'
              prefix={<SearchOutlined className='text-gray-400' />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className='flex items-end'>
            <Button
              size='large'
              onClick={handleResetFilters}
              className='!rounded-full !border-gray-300 !text-[#374151] !font-medium !h-[40px] !px-6'
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* ===== TABLE SECTION ===== */}
      <div className='space-y-4'>
        {/* Selection info + Delete Selected */}
        <div className='flex justify-between items-center'>
          <Text className='text-[#4B5563] text-[14px]'>
            {selectedRowKeys.length > 0
              ? `${selectedRowKeys.length} question${selectedRowKeys.length > 1 ? 's' : ''} selected`
              : ''}
          </Text>
          {selectedRowKeys.length > 0 && (
            <Button
              danger
              size='large'
              onClick={() => openDeleteModal(null)}
              className='!rounded-full !font-medium !h-[44px] !px-6'
            >
              Delete Selected
            </Button>
          )}
        </div>

        {/* Table */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <Table
            rowKey='ID'
            columns={columns}
            dataSource={listPart}
            loading={isLoading}
            pagination={false}
            rowSelection={rowSelection}
            rowClassName='hover:bg-gray-50 cursor-pointer'
            scroll={{ x: 900 }}
            onRow={(record) => ({
              onClick: () => {
                setSelectedRowKeys((prev) =>
                  prev.includes(record.ID)
                    ? prev.filter((key) => key !== record.ID)
                    : [...prev, record.ID]
                );
              },
            })}
          />
        </div>

        {/* Pagination */}
        <div className='flex flex-col sm:flex-row justify-between items-center gap-4 pt-2'>
          <Text className='text-[#6B7280] text-[14px]'>
            {totalItems === 0
              ? 'No data found'
              : `Showing ${startItem}-${endItem} of ${totalItems} questions`}
          </Text>
          <Pagination
            current={currentPage}
            total={totalItems}
            pageSize={pageSize}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            itemRender={(page, type, original) => {
              if (type === 'page') {
                const isActive = currentPage === page;
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
            }}
          />
        </div>
      </div>

      {/* ===== DELETE MODAL ===== */}
      <Modal
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        footer={null}
        centered
        closable={false}
        width={480}
      >
        <div className='flex flex-col items-center text-center py-4'>
          <div className='w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4'>
            <ExclamationCircleFilled className='text-red-500 text-3xl' />
          </div>
          <Title level={4} className='!m-0 !mb-2'>
            Delete Question
          </Title>
          <Text className='text-[#6B7280] mb-6'>
            You are about to delete {deleteCount} question
            {deleteCount > 1 ? 's' : ''}. This action cannot be undone.
            <br />
            Do you want to continue?
          </Text>
          <div className='flex gap-4'>
            <Button
              size='large'
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteTarget(null);
              }}
              className='!rounded-full !min-w-[120px] !h-[44px]'
            >
              Cancel
            </Button>
            <Button
              type='primary'
              danger
              size='large'
              onClick={handleDeleteConfirm}
              className='!rounded-full !min-w-[160px] !h-[44px] !font-medium'
            >
              Delete Question
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuestionBank;
