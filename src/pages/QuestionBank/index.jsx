import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Typography,
  Space,
  Pagination,
  Card,
  Dropdown,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import HeaderInfo from '@app/components/HeaderInfo';
import useConfirm from '@shared/hook/useConfirm';
import { useDeleteSection, useGetSections } from '@features/sections/hooks';

const { Text } = Typography;
const { Option } = Select;

const QuestionBank = () => {
  const navigate = useNavigate();
  const { openConfirmModal, ModalComponent } = useConfirm();

  // --- Filter & pagination state ---
  const [selectedSkill, setSelectedSkill] = useState();
  const [searchText, setSearchText] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Khi skill hoặc searchText đổi -> reset page về 1
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSkill, searchText]);

  /* =========================================================
      LOAD PART LIST TỪ API (CÓ PHÂN TRANG)
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

  // BE trả về: { status, message, page, pageSize, total, totalPages, data: [] }
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
      render: (_, record) => (
        <Tooltip title={record?.SubContent || '-'}>
          <span className='text-gray-500'>{record?.SubContent || '—'}</span>
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
          <Button
            type='text'
            className='text-blue-600 hover:bg-blue-50 px-2'
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${record.ID}`);
            }}
          />
          <Button
            type='text'
            className='text-red-500 hover:bg-red-50 px-2'
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              openConfirmModal({
                title: 'Confirm delete',
                message: 'Do you really want to delete this part?',
                okText: 'Delete',
                okButtonColor: '#FF4D4F',
                onConfirm: () => deleteSection(record.ID),
              });
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <ModalComponent />

      <HeaderInfo
        title='Question List'
        subtitle='Manage and filter all list question'
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
          {/* ==================== FILTER BAR ==================== */}
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center py-4'>
            {/* Left: Search */}
            <Input
              size='large'
              placeholder='Search section name...'
              prefix={<SearchOutlined className='text-gray-400' />}
              className='w-full sm:w-[260px] lg:w-[320px]'
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            {/* Right: Skill Filter */}
            <Select
              size='large'
              className='w-full sm:w-[220px] lg:w-[240px]'
              value={selectedSkill}
              allowClear
              onChange={setSelectedSkill}
              placeholder='All Skills'
            >
              <Option value='LISTENING'>Listening</Option>
              <Option value='READING'>Reading</Option>
              <Option value='WRITING'>Writing</Option>
              <Option value='SPEAKING'>Speaking</Option>
              <Option value='GRAMMAR AND VOCABULARY'>
                Grammar And Vocabulary
              </Option>
            </Select>
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
              onRow={(record) => ({
                onClick: () => navigate(`${record.ID}`),
              })}
              scroll={{ y: 'calc(100vh - 500px)' }}
            />
          </div>

          {/* ==================== PAGINATION ==================== */}
          <div className='flex flex-col md:flex-row justify-between items-center p-6 border-t border-gray-100 gap-4'>
            <Text className='text-gray-500'>
              {totalItems === 0
                ? 'No data found'
                : `Showing ${startItem}–${endItem} of ${totalItems} items`}
            </Text>

            <Pagination
              current={pagination.page}
              total={totalItems}
              pageSize={pagination.pageSize}
              showSizeChanger
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              itemRender={(page, type, original) => {
                if (type === 'page') {
                  const isActive = pagination.page === page;

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

                return original; // giữ Prev / Next của AntD
              }}
            />
          </div>
        </Card>
      </div>
    </>
  );
};

export default QuestionBank;
