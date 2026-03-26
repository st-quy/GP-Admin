// QuestionBank.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Typography,
  Space,
  Pagination,
  Card,
  Dropdown,
  Tooltip,
  Tabs,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import HeaderInfo from '@app/components/HeaderInfo';
import useConfirm from '@shared/hook/useConfirm';
import { useDeleteSection, useGetSections } from '@features/sections/hooks';

const { Text } = Typography;

const QuestionBank = () => {
  const navigate = useNavigate();
  const { openConfirmModal, ModalComponent } = useConfirm();

  // --- Filter & pagination state ---
  const [selectedSkill, setSelectedSkill] = useState('SPEAKING');
  const [searchText, setSearchText] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Khi skill hoặc searchText đổi → reset page về 1
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSkill, searchText]);

  /* =========================================================
      LOAD SECTION LIST TỪ API (CÓ PHÂN TRANG)
     ========================================================= */
  const sectionParams = useMemo(
    () => ({
      skillName: selectedSkill || undefined,
      searchName: searchText || undefined,
      page: currentPage,
      pageSize,
    }),
    [selectedSkill, searchText, currentPage, pageSize]
  );

  const { data: listSectionData, isLoading: loadingSections } =
    useGetSections(sectionParams);

  const { mutate: deleteSection } = useDeleteSection();

  const listPart = listSectionData?.data ?? [];
  const pagination = {
    page: listSectionData?.page ?? currentPage,
    pageSize: listSectionData?.pageSize ?? pageSize,
    total: listSectionData?.total ?? 0,
  };

  const totalItems = pagination.total;
  const startItem =
    totalItems === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.page * pagination.pageSize, totalItems);

  /* =========================================================
      TABLE COLUMNS
     ========================================================= */
  const columns = [
    {
      title: 'Section Name',
      dataIndex: 'Name',
      ellipsis: { showTitle: false },
      render: (text) => (
        <Tooltip title={text}>
          <span className='font-semibold text-[#1F2937]'>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'Description',
      align: 'left',
      ellipsis: { showTitle: false },
      render: (text, record) => (
        <Tooltip title={record?.Description || record?.SubContent || '-'}>
          <span className='text-gray-500'>{record?.Description || record?.SubContent || '—'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Skill',
      dataIndex: 'Skill',
      align: 'center',
      render: (_, record) => (
        <span className='text-gray-600 font-medium'>
          {record?.Skill?.Name || '-'}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size='middle'>
          <Tooltip title="View Detail">
            <Button
              type='text'
              className='text-green-600 hover:bg-blue-50 px-2'
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`${record.ID}?skillName=${record.Skill.Name}`);
              }}
            />
          </Tooltip>
          {record.Topics.length === 0 && (
            <Tooltip title="Edit Section">
              <Button
                type='text'
                className='text-blue-600 hover:bg-blue-50 px-2'
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`update/${record.ID}?skillName=${record.Skill.Name}`);
                }}
              />
            </Tooltip>
          )}
          {record.Topics.length === 0 && (
            <Tooltip title="Delete Section">
              <Button
                type='text'
                className='text-red-500 hover:bg-red-50 px-2'
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  openConfirmModal({
                    title: 'Confirm delete',
                    message: 'Do you really want to delete this section?',
                    okText: 'Delete',
                    okButtonColor: '#FF4D4F',
                    onConfirm: () => deleteSection(record.ID),
                  });
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <ModalComponent />

      <HeaderInfo
        title='Question List'
        subtitle='Manage and filter all list section'
        SubAction={
          <Dropdown
            menu={{
              items: [
                { label: 'Speaking', key: 'speaking' },
                { label: 'Reading', key: 'reading' },
                { label: 'Writing', key: 'writing' },
                { label: 'Listening', key: 'listening' },
                { label: 'Grammar And Vocabulary', key: 'grammar' },
              ],
              onClick: (e) => navigate(`create/${e.key}`),
            }}
          >
            <Button
              className='w-full p-5'
              icon={<DownOutlined />}
              iconPosition='end'
            >
              Create Questions
            </Button>
          </Dropdown>
        }
      />

      <div className='p-4'>
        <Card className='shadow-sm rounded-xl h-[calc(100vh-200px)]'>
          {/* ==================== TABS FILTER ==================== */}
          <Tabs
            type='card'
            tabBarGutter={32}
            activeKey={selectedSkill ?? ''}
            onChange={(key) => setSelectedSkill(key)}
            items={[
              { key: 'SPEAKING', label: 'Speaking' },
              { key: 'LISTENING', label: 'Listening' },
              { key: 'READING', label: 'Reading' },
              { key: 'WRITING', label: 'Writing' },
              { key: 'GRAMMAR AND VOCABULARY', label: 'Grammar & Vocabulary' },
            ]}
          />

          {/* ==================== SEARCH BAR ==================== */}
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center py-4'>
            <Input
              maxLength={255}
              size='large'
              placeholder='Search section name...'
              prefix={<SearchOutlined className='text-gray-400' />}
              className='w-full sm:w-[260px] lg:w-[320px]'
              value={searchText}
              onChange={(e) => {
                const sanitized = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '')
                setSearchText(sanitized)
              }
              }
            />
          </div>

          {/* ==================== TABLE ==================== */}
          <div className='w-full'>
            <Table
              rowKey='ID'
              columns={columns}
              dataSource={listPart}
              loading={loadingSections}
              pagination={false}
              rowClassName='hover:bg-gray-50 cursor-pointer'
              scroll={{ y: 'calc(100vh - 500px)' }}
            />
          </div>

          {/* ==================== PAGINATION ==================== */}
          <div className='flex flex-col md:flex-row justify-between items-center mt-6 px-4 bg-gray-50 p-4 rounded-lg shadow-sm gap-4'>
            <div className='text-gray-600 font-medium'>
              {totalItems === 0
                ? 'No entries found'
                : `Showing ${startItem}-${endItem} of ${totalItems} entries`}
            </div>

            <Pagination
              current={pagination.page}
              total={totalItems}
              pageSize={pagination.pageSize}
              showSizeChanger
              pageSizeOptions={['5', '10', '15', '20']}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              className="ant-pagination-custom"
            />
          </div>
        </Card>
      </div>
    </>
  );
};

export default QuestionBank;
