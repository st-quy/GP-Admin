import React, { useState } from 'react';
import {
  Table,
  Button,
  Typography,
  Pagination,
  Select,
  Dropdown,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useDeleteSection, useGetSections } from '@features/sections/hooks';
import { useSelector } from 'react-redux';
import { useDebouncedValue } from '@shared/hook/useDebounceValue';
import useConfirm from '@shared/hook/useConfirm';
import SearchInput from '@/app/components/SearchInput.jsx';
import { message } from 'antd';

const { Text, Title } = Typography;

const SKILL_TO_ROUTE = {
  'SPEAKING': 'speaking',
  'LISTENING': 'listening',
  'READING': 'reading',
  'WRITING': 'writing',
  'GRAMMAR AND VOCABULARY': 'grammar',
};

const SKILL_OPTIONS = [
  { value: 'SPEAKING', label: 'Speaking' },
  { value: 'LISTENING', label: 'Listening' },
  { value: 'READING', label: 'Reading' },
  { value: 'WRITING', label: 'Writing' },
  { value: 'GRAMMAR AND VOCABULARY', label: 'Grammar & Vocabulary' },
];

const SKILL_FILTER_OPTIONS = [
  { value: '', label: 'All Skills' },
  ...SKILL_OPTIONS,
];

const validSkills = new Set([
  'SPEAKING',
  'LISTENING',
  'READING',
  'WRITING',
  'GRAMMAR AND VOCABULARY',
]);

const QuestionBank = () => {
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);
    
  const isAdmin = Array.isArray(role) 
    ? role.some(r => r.toLowerCase() === 'admin' || r.toLowerCase() === 'superadmin')
    : (typeof role === 'string' && (role.toLowerCase() === 'admin' || role.toLowerCase() === 'superadmin'));

  const { openConfirmModal, ModalComponent } = useConfirm();

  // Filters
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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

  const sectionParams = {
    skillName: selectedSkill && validSkills.has(selectedSkill) ? selectedSkill : undefined,
    searchName: debouncedSearch || undefined,
    page,
    pageSize,
  };

  const { data: listSectionData, isLoading, refetch } = useGetSections(sectionParams);
  const { mutate: deleteSection } = useDeleteSection();

  const listPart = listSectionData?.data ?? [];
  const totalItems = listSectionData?.total ?? 0;
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const handleDeleteSection = (record) => {
    openConfirmModal({
      title: 'Delete Question',
      message: `Are you sure you want to delete "${record.Name}"? This action cannot be undone.`,
      okText: 'Delete',
      okButtonColor: '#FF4D4F',
      onConfirm: async () => {
        await deleteSection(record.ID);
      },
    });
  };

  const columns = [
    {
      title: <span className="font-bold text-[#637381]">TOPIC NAME</span>,
      dataIndex: 'Name',
      key: 'Name',
      width: '300px',
      ellipsis: true,
      render: (text) => (
        <span className="font-medium text-primaryTextColor">{text}</span>
      ),
    },
    {
      title: <span className="font-bold text-[#637381]">SKILL</span>,
      dataIndex: 'Skill',
      key: 'Skill',
      width: '150px',
      align: 'center',
      render: (_, record) => (
        <span className="font-medium text-primaryTextColor">
          {record?.Skill?.Name || '—'}
        </span>
      ),
    },
    {
      title: <span className="font-bold text-[#637381]">CREATION DAY</span>,
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '150px',
      align: 'center',
      render: (date) => (
        <span className="font-medium text-primaryTextColor">
          {date ? new Date(date).toLocaleDateString() : '—'}
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
          {date ? new Date(date).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      title: <span className="font-bold text-[#637381]">ACTIONS</span>,
      key: 'action',
      width: '200px',
      align: 'center',
      render: (_, record) => {
        const canEdit = !record.Status?.includes('submited') && !record.Status?.includes('approved') && !record.Status?.includes('archived');

        return (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`${record.ID}?skillName=${record.Skill.Name}`);
              }}
              className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70"
              title="Review Question"
            >
              <EyeOutlined style={{ fontSize: "20px", color: "#003087" }} />
            </button>

            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`update/${record.ID}?skillName=${record.Skill.Name}`);
                }}
                className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70"
                title="Edit Question"
              >
                <EditOutlined style={{ fontSize: "20px", color: "#003087" }} />
              </button>
            )}

            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSection(record);
                }}
                className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70"
                title="Delete Question"
              >
                <DeleteOutlined style={{ fontSize: "20px", color: "#FF4D4F" }} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  const createMenuItems = SKILL_OPTIONS.map((skill) => ({
    key: skill.value,
    label: skill.label,
    onClick: () => navigate(`create/${SKILL_TO_ROUTE[skill.value]}`),
  }));

  const CreateButton = () => (
    <Dropdown menu={{ items: createMenuItems }} trigger={['click']}>
      <Button
        type="primary"
        size="large"
        icon={<PlusCircleOutlined />}
        className="!h-[50px] !rounded-[50px] !bg-primaryColor !text-white font-[500] leading-[24px] hover:!opacity-90"
      >
        Create New Question <DownOutlined />
      </Button>
    </Dropdown>
  );

  return (
    <div className="figma-page-container">
      <div className="figma-content-wrapper">
        <ModalComponent />
        
        <div className="py-8">
          <div className="mb-10 flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h4 className="figma-title">Question Bank</h4>
              <p className="figma-subtitle">Manage and organize all your exam questions</p>
            </div>
            <CreateButton />
          </div>

          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SearchInput
                placeholder="Search question..."
                value={search}
                onSearchChange={onSearchChange}
                isFigmaRedesign={true}
                style={{ margin: 0 }}
              />
              <div className="skill-select-wrapper">
                <Select
                  value={selectedSkill}
                  onChange={(val) => {
                    setSelectedSkill(val);
                    setPage(1);
                  }}
                  className="figma-skill-select"
                  options={SKILL_FILTER_OPTIONS}
                />
              </div>
            </div>
          </div>

          <style>{`
            .skill-select-wrapper .ant-select-selector {
              height: 48px !important;
              display: flex !important;
              align-items: center !important;
              border: 1px solid #DFE4EA !important;
              border-radius: 6px !important;
              box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1) !important;
              background-color: #ffffff !important;
              padding: 0 12px !important;
            }
            .skill-select-wrapper .ant-select-selection-item,
            .skill-select-wrapper .ant-select-selection-placeholder {
              line-height: 46px !important;
              display: flex !important;
              align-items: center !important;
            }
            .figma-skill-select.ant-select {
              width: 180px !important;
              height: 48px !important;
              margin: 0 !important;
            }
          `}</style>

          <div className="figma-table-card figma-table-overrides w-full">
            <Table
              rowKey='ID'
              columns={columns}
              dataSource={listPart}
              loading={isLoading}
              pagination={false}
              rowSelection={rowSelection}
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

          <div className="figma-pagination-wrapper">
            <div className="figma-pagination-box">
              <div className="figma-pagination-text whitespace-nowrap">
                {totalItems === 0
                  ? "No entries found"
                  : `Showing ${String(start).padStart(2, "0")}-${String(end).padStart(2, "0")} of ${totalItems}`}
              </div>

              <div className="figma-pagination-nav-group">
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={totalItems}
                  onChange={(p, size) => {
                    setPage(p);
                    setPageSize(size);
                  }}
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

export default QuestionBank;
