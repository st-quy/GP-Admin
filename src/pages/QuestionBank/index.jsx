import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Tooltip,
  Modal,
  Pagination,
  Empty,
  Dropdown,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleFilled,
  ReloadOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDeleteSection, useGetSections } from '@features/sections/hooks';

const SKILL_OPTIONS = [
  { value: '', label: 'All Skills' },
  { value: 'SPEAKING', label: 'Speaking' },
  { value: 'LISTENING', label: 'Listening' },
  { value: 'READING', label: 'Reading' },
  { value: 'WRITING', label: 'Writing' },
  { value: 'GRAMMAR AND VOCABULARY', label: 'Grammar & Vocabulary' },
];

const validSkills = new Set([
  'SPEAKING',
  'LISTENING',
  'READING',
  'WRITING',
  'GRAMMAR AND VOCABULARY',
]);

const PAGE_SIZE_OPTIONS = [
  { value: 5, label: '05 / pages' },
  { value: 10, label: '10 / pages' },
  { value: 20, label: '20 / pages' },
  { value: 50, label: '50 / pages' },
];

const QuestionBank = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const skillFromQuery = queryParams.get('skillName')?.trim().toUpperCase();

  const [selectedSkill, setSelectedSkill] = useState(
    validSkills.has(skillFromQuery) ? skillFromQuery : ''
  );
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSkill, searchText]);

  useEffect(() => {
    if (validSkills.has(skillFromQuery) && skillFromQuery !== selectedSkill) {
      setSelectedSkill(skillFromQuery);
    }
  }, [skillFromQuery, selectedSkill]);

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

  const handleResetFilters = () => {
    setSelectedSkill('');
    setSearchText('');
    setCurrentPage(1);
  };

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

  const createMenuItems = [
    { key: 'speaking', label: 'Speaking' },
    { key: 'reading', label: 'Reading' },
    { key: 'writing', label: 'Writing' },
    { key: 'listening', label: 'Listening' },
    { key: 'grammar', label: 'Grammar And Vocabulary' },
  ];

  const handleCreateClick = ({ key }) => {
    navigate(`create/${key}`);
  };

  const columns = [
    {
      title: 'SECTION NAME',
      dataIndex: 'Name',
      ellipsis: { showTitle: false },
      render: (text) => (
        <Tooltip title={text}>
          <span className='font-semibold text-[#111827]'>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'DESCRIPTION',
      dataIndex: 'Description',
      ellipsis: { showTitle: false },
      render: (text) => (
        <Tooltip title={text}>
          <span className='text-[#637381]'>{text || '—'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'SKILL',
      dataIndex: 'Skill',
      width: 200,
      render: (_, record) => (
        <span className='text-[#637381]'>{record?.Skill?.Name || '—'}</span>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <div className='flex items-center justify-center gap-3'>
          <Tooltip title='View'>
            <button
              className='cursor-pointer border-none bg-transparent hover:opacity-70 transition-all'
              onClick={(e) => {
                e.stopPropagation();
                navigate(`${record.ID}?skillName=${record.Skill.Name}`);
              }}
            >
              <EyeOutlined style={{ fontSize: '20px', color: '#003087' }} />
            </button>
          </Tooltip>
          <Tooltip title='Edit'>
            <button
              className='cursor-pointer border-none bg-transparent hover:opacity-70 transition-all'
              onClick={(e) => {
                e.stopPropagation();
                navigate(`update/${record.ID}?skillName=${record.Skill.Name}`);
              }}
            >
              <EditOutlined style={{ fontSize: '20px', color: '#13C296' }} />
            </button>
          </Tooltip>
          <Tooltip title='Delete'>
            <button
              className='cursor-pointer border-none bg-transparent hover:opacity-70 transition-all'
              onClick={(e) => {
                e.stopPropagation();
                openDeleteModal(record);
              }}
            >
              <DeleteOutlined style={{ fontSize: '20px', color: '#FF4D4F' }} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  const deleteCount = deleteTarget ? 1 : selectedRowKeys.length;

  return (
    <div className='figma-page-container'>
      <div className='figma-content-wrapper'>
        {/* Header */}
        <div className='figma-header-section'>
          <div>
            <h1 className='figma-title'>Question Bank</h1>
            <p className='figma-subtitle'>
              Manage and organize all your exam questions
            </p>
          </div>
          <div className='flex items-center gap-3 pt-4'>
            <Dropdown
              menu={{ items: createMenuItems, onClick: handleCreateClick }}
              trigger={['click']}
              placement='bottomRight'
            >
              <Button className='figma-outline-btn'>
                Create Questions <DownOutlined />
              </Button>
            </Dropdown>
          </div>
        </div>

        {/* Filters */}
        <div className='figma-filter-bar'>
          <div className='flex flex-wrap items-center gap-4'>
            <Select
              value={selectedSkill}
              onChange={setSelectedSkill}
              options={SKILL_OPTIONS}
              className='figma-filter-select'
              style={{ width: 200 }}
              size='large'
            />
            <Input
              maxLength={255}
              size='large'
              placeholder='Search question...'
              prefix={<SearchOutlined className='text-[#6B7280] mr-2' />}
              value={searchText}
              onChange={(e) => {
                const sanitized = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '');
                setSearchText(sanitized);
              }}
              className='figma-search-input'
              allowClear
            />
            <Button
              className='figma-outline-btn'
              onClick={handleResetFilters}
              icon={<ReloadOutlined />}
            >
              Reset Filters
            </Button>
          </div>

          {selectedRowKeys.length > 0 && (
            <div className='flex items-center gap-4'>
              <span className='text-[#637381] font-medium'>
                {selectedRowKeys.length} selected
              </span>
              <Button
                danger
                className='figma-outline-btn !border-[#FF4D4F] !text-[#FF4D4F]'
                onClick={() => openDeleteModal(null)}
                icon={<DeleteOutlined />}
              >
                Delete Selected
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className='figma-table-card'>
          <Table
            rowKey='ID'
            columns={columns}
            dataSource={listPart}
            loading={isLoading}
            pagination={false}
            rowSelection={rowSelection}
            className='figma-table-overrides'
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
            locale={{
              emptyText: <Empty description='No questions found.' />,
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
                      <button className={`figma-page-btn ${isActive ? 'active' : ''}`}>
                        {page}
                      </button>
                    );
                  }
                  if (type === 'prev') {
                    return <button className='figma-symbol-btn' type='button'>{'\u2039'}</button>;
                  }
                  if (type === 'next') {
                    return <button className='figma-symbol-btn' type='button'>{'\u203A'}</button>;
                  }
                  if (type === 'jump-prev' || type === 'jump-next') {
                    return (
                      <span className='text-[#637381] px-1' style={{ fontSize: '16px', lineHeight: '25px' }}>
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

      {/* Delete Modal */}
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
        <div className='flex flex-col items-center text-center py-6'>
          <div className='w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4'>
            <ExclamationCircleFilled className='text-red-500 text-3xl' />
          </div>
          <h3 className='text-xl font-bold text-[#111827] mb-2'>
            Delete Question
          </h3>
          <p className='text-[#637381] mb-6'>
            You are about to delete {deleteCount} question
            {deleteCount > 1 ? 's' : ''}. This action cannot be undone.
            <br />
            Do you want to continue?
          </p>
          <div className='flex gap-4'>
            <Button
              className='figma-outline-btn'
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className='figma-primary-btn !bg-[#FF4D4F]'
              onClick={handleDeleteConfirm}
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
