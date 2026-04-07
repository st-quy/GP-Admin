import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Typography,
  Pagination,
  Select,
  Dropdown,
  Tag,
  message,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownOutlined,
  PlusCircleOutlined,
  CloudUploadOutlined,
  FolderAddOutlined,
  CopyOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useDeleteSection, useGetSections, useUpdateSectionStatus, useDuplicateSection } from '@features/sections/hooks';
import { useSelector } from 'react-redux';
import { useDebouncedValue } from '@shared/hook/useDebounceValue';
import useConfirm from '@shared/hook/useConfirm';
import SearchInput from '@/app/components/SearchInput.jsx';
import BulkActionToolbar from '@shared/components/BulkActionToolbar';

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
    setSelectedRowKeys([]);
  };

  const debouncedSearch = useDebouncedValue(search, 500);

  const sectionParams = {
    skillName: selectedSkill && validSkills.has(selectedSkill) ? selectedSkill : undefined,
    searchName: debouncedSearch || undefined,
    page,
    pageSize,
  };

  const { data: listSectionData, isLoading, refetch } = useGetSections(sectionParams);
  const { mutateAsync: deleteSection } = useDeleteSection();
  const { mutateAsync: updateStatus } = useUpdateSectionStatus();
  const { mutateAsync: duplicateSection, isPending: isDuplicating } = useDuplicateSection();

  const listPart = listSectionData?.data ?? [];
  const totalItems = listSectionData?.total ?? 0;
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const handleDeleteSection = (record) => {
    const isPublished = record.Status === 'published';
    const title = isPublished ? 'Delete Published Question' : 'Delete Question';
    const message = isPublished
      ? `Are you sure you want to delete the published question "${record.Name}"? This action cannot be undone.`
      : `Are you sure you want to delete "${record.Name}"? This action cannot be undone.`;

    openConfirmModal({
      title,
      message,
      okText: 'Delete',
      okButtonColor: '#FF4D4F',
      onConfirm: async () => {
        try {
            await deleteSection(record.ID);
            message.success(`Deleted question "${record.Name}" successfully`);
            refetch();
        } catch (error) {
            message.error(`Failed to delete question "${record.Name}"`);
        }
      },
    });
  };

  const handleDuplicateSection = (record) => {
    openConfirmModal({
      title: 'Duplicate Question Bank',
      message: `Are you sure you want to duplicate "${record.Name}"? This will create a new editable draft.`,
      okText: 'Duplicate',
      okButtonColor: '#003087',
      onConfirm: async () => {
        try {
            await duplicateSection(record.ID);
            message.success(`Duplicated question bank "${record.Name}" successfully`);
            refetch();
        } catch (error) {
            message.error(`Failed to duplicate question bank "${record.Name}"`);
        }
      },
    });
  };

  /* =========================================================
      BULK ACTIONS LOGIC
     ========================================================= */
  const handleBulkExport = () => {
    const selectedSections = listPart.filter((item) =>
      selectedRowKeys.includes(item.ID)
    );
    const csvContent = [
      ['Section Name', 'Description', 'Skill', 'Status'].join(','),
      ...selectedSections.map((s) =>
        [
          `"${s.Name || ''}"`,
          `"${s.Description || ''}"`,
          `"${s.Skill?.Name || ''}"`,
          `"${s.Status || ''}"`,
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

  const handleBulkDelete = () => {
    const selected = listPart.filter((item) => selectedRowKeys.includes(item.ID));
    openConfirmModal({
      title: 'Confirm bulk delete',
      message: `Delete ${selected.length} section(s)? This action cannot be undone.`,
      okText: 'Delete',
      okButtonColor: '#FF4D4F',
      onConfirm: async () => {
        try {
          await Promise.all(selected.map((s) => deleteSection(s.ID)));
          setSelectedRowKeys([]);
          message.success(`Deleted ${selected.length} section(s)`);
          refetch();
        } catch {
          message.error('Failed to delete some sections');
        }
      },
    });
  };

  const bulkActions = [
    {
      key: 'export',
      label: 'Export',
      icon: <ExportOutlined />,
      onClick: handleBulkExport,
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: handleBulkDelete,
    },
  ];

  /* =========================================================
      TABLE COLUMNS
     ========================================================= */
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
      title: <span className="font-bold text-[#637381]">STATUS</span>,
      dataIndex: 'Status',
      key: 'Status',
      width: '100px',
      align: 'center',
      render: (status) => {
        if (status === 'archived') {
          return (
            <Tag color="default" className="!m-0">
              Archived
            </Tag>
          );
        }
        const isDraft = status === 'draft';
        return (
          <Tag
            color={isDraft ? 'orange' : 'green'}
            className="!m-0"
          >
            {isDraft ? 'Draft' : 'Published'}
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
      width: '250px',
      align: 'center',
      render: (_, record) => {
        const isDraft = record.Status === 'draft';
        const isPublished = record.Status === 'published';
        const isArchived = record.Status === 'archived';

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

            {isDraft ? (
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
            ) : (
              <span
                className="cursor-not-allowed opacity-40"
                title={isArchived ? "Archived sections are read-only" : "Published sections are read-only"}
              >
                <EditOutlined style={{ fontSize: "20px", color: "#003087" }} />
              </span>
            )}

            {isPublished ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openConfirmModal({
                    title: 'Archive Question',
                    message: `Archive "${record.Name}"? It will be removed from exam selection but can still be viewed or deleted.`,
                    okText: 'Archive',
                    okButtonColor: '#8c8c8c',
                    onConfirm: async () => {
                      await updateStatus({ id: record.ID, Status: 'archived' });
                      refetch();
                    },
                  });
                }}
                className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70"
                title="Archive Question"
              >
                <FolderAddOutlined style={{ fontSize: "20px", color: "#8c8c8c" }} />
              </button>
            ) : (
              <span
                className="cursor-not-allowed opacity-40"
                title={isArchived ? "Already archived" : "Only published sections can be archived"}
              >
                <FolderAddOutlined style={{ fontSize: "20px", color: "#8c8c8c" }} />
              </span>
            )}

            {isDraft ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const parts = record.Parts || [];
                  const skillName = record?.Skill?.Name || '';
                  let hasValidContent = false;

                  if (skillName === 'GRAMMAR AND VOCABULARY') {
                    hasValidContent = parts.some((p) => {
                      const qs = p.Questions || [];
                      return qs.some((q) => {
                        if (q.Content?.trim()) return true;
                        const ac = q.AnswerContent || {};
                        if (ac.options?.some((o) => o.value?.trim())) return true;
                        if (ac.leftItems?.length > 0 && ac.rightItems?.length > 0) return true;
                        return false;
                      });
                    });
                  } else if (skillName === 'WRITING') {
                    hasValidContent = parts.some((p) => {
                      const qs = p.Questions || [];
                      return qs.some((q) => q.Content?.trim());
                    });
                  } else {
                    hasValidContent = parts.some((p) => {
                      const qs = p.Questions || [];
                      return qs.some((q) => q.Content?.trim() || q.Value?.trim());
                    });
                  }

                  if (!hasValidContent) {
                    message.warning('Cannot publish: this section has no valid questions. Please add questions with content before publishing.');
                    return;
                  }
                  openConfirmModal({
                    title: 'Publish Question',
                    message: `Are you sure you want to publish "${record.Name}"? It will be available for exam selection.`,
                    okText: 'Publish',
                    okButtonColor: '#52c41a',
                    onConfirm: async () => {
                      await updateStatus({ id: record.ID, Status: 'published' });
                      refetch();
                    },
                  });
                }}
                className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70"
                title="Publish Question"
              >
                <CloudUploadOutlined style={{ fontSize: "20px", color: "#52c41a" }} />
              </button>
            ) : (
              <span
                className="cursor-not-allowed opacity-40"
                title={isPublished ? "Already published" : "Archived sections cannot be published"}
              >
                <CloudUploadOutlined style={{ fontSize: "20px", color: "#52c41a" }} />
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicateSection(record);
              }}
              disabled={isDuplicating}
              className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70"
              title="Duplicate Question Bank"
            >
              <CopyOutlined style={{ fontSize: "20px", color: "#003087" }} />
            </button>

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
          </div>
        );
      },
    },
  ];

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
                    setSelectedRowKeys([]);
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
              scroll={{ x: 900 }}
              rowSelection={{
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
                columnWidth: 50,
              }}
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
                    setSelectedRowKeys([]);
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
                    setSelectedRowKeys([]);
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
      <BulkActionToolbar
        selectedCount={selectedRowKeys.length}
        actions={bulkActions}
        onClearSelection={() => setSelectedRowKeys([])}
      />
    </div>
  );
};

export default QuestionBank;
