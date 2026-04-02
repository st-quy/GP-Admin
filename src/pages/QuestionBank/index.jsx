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
  message,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  EyeOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

import HeaderInfo from '@app/components/HeaderInfo';
import useConfirm from '@shared/hook/useConfirm';
import BulkActionToolbar from '@shared/components/BulkActionToolbar';
import { useDeleteSection, useGetSections } from '@features/sections/hooks';

const { Text } = Typography;

const QuestionBank = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openConfirmModal, ModalComponent } = useConfirm();

  const queryParams = new URLSearchParams(location.search);
  const skillFromQuery = queryParams.get('skillName')?.trim().toUpperCase();
  const validSkills = new Set([
    'SPEAKING',
    'LISTENING',
    'READING',
    'WRITING',
    'GRAMMAR AND VOCABULARY',
  ]);

  // --- Filter & pagination state ---
  const [selectedSkill, setSelectedSkill] = useState(
    validSkills.has(skillFromQuery) ? skillFromQuery : 'SPEAKING'
  );
  const [searchText, setSearchText] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // --- Row selection state ---
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Khi skill hoặc searchText đổi → reset page về 1
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRowKeys([]);
  }, [selectedSkill, searchText]);

  useEffect(() => {
    if (validSkills.has(skillFromQuery) && skillFromQuery !== selectedSkill) {
      setSelectedSkill(skillFromQuery);
    }
  }, [skillFromQuery, selectedSkill]);

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
      ROW SELECTION
     ========================================================= */
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    columnWidth: 50,
    renderCell: (checked, record, index, originNode) => (
      <div className='flex justify-center'>{originNode}</div>
    ),
  };

  /* =========================================================
      BULK ACTIONS
     ========================================================= */
  const handleBulkDelete = () => {
    const deletableItems = listPart.filter(
      (item) => selectedRowKeys.includes(item.ID) && item.Topics.length === 0
    );
    const skippedCount = selectedRowKeys.length - deletableItems.length;

    openConfirmModal({
      title: 'Confirm bulk delete',
      message: `Delete ${deletableItems.length} section(s)?${
        skippedCount > 0
          ? ` (${skippedCount} section(s) with topics will be skipped)`
          : ''
      }`,
      okText: 'Delete',
      okButtonColor: '#FF4D4F',
      onConfirm: async () => {
        for (const item of deletableItems) {
          deleteSection(item.ID);
        }
        setSelectedRowKeys([]);
        message.success(`Deleted ${deletableItems.length} section(s)`);
      },
    });
  };

  const handleBulkExport = () => {
    const selectedSections = listPart.filter((item) =>
      selectedRowKeys.includes(item.ID)
    );
    const csvContent = [
      ['Section Name', 'Description', 'Skill'].join(','),
      ...selectedSections.map((s) =>
        [
          `"${s.Name || ''}"`,
          `"${s.SubContent || ''}"`,
          `"${s.Skill?.Name || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sections_export_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    message.success(`Exported ${selectedSections.length} section(s)`);
  };

  const bulkActions = [
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: handleBulkDelete,
    },
    {
      key: 'export',
      label: 'Export',
      icon: <ExportOutlined />,
      onClick: handleBulkExport,
    },
  ];

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
      render: (_, record) => {
        const description = record?.Description ?? '—';

        return (
          <Tooltip title={description}>
            <span className='text-gray-500'>{description}</span>
          </Tooltip>
        );
      },
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
          <Tooltip title='Preview Questions'>
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
            <Tooltip title='Edit Questions'>
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
            <Tooltip title='Delete Questions'>
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
            onChange={(key) => {
              setSelectedSkill(key);
              navigate(`/questions?skillName=${encodeURIComponent(key)}`, {
                replace: true,
              });
            }}
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
              }}
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
              rowSelection={rowSelection}
              rowClassName='hover:bg-gray-50 cursor-pointer'
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
                        ${isActive
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
        </Card>
      </div>

      {/* ==================== BULK ACTION TOOLBAR ==================== */}
      <BulkActionToolbar
        selectedCount={selectedRowKeys.length}
        actions={bulkActions}
        onClearSelection={() => setSelectedRowKeys([])}
      />
    </>
  );
};

export default QuestionBank;
