import React, { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Table, Input, Select, Space, Tag, message, Pagination } from 'antd';
import {
  SearchOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ExportOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import {
  useDeleteTeacher,
  useFetchTeacherById,
  useFetchTeachers,
  useUpdateTeacher,
} from '../hook/useTeacherQuery';
import TeacherActionModal from './TeacherModal/ActionModal/TeacherActionModal';
import useConfirm from '@shared/hook/useConfirm';
import BulkActionToolbar from '@shared/components/BulkActionToolbar';
import { useDebouncedValue } from '@shared/hook/useDebounceValue';
import SearchInput from "@/app/components/SearchInput.jsx";

const TeacherManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const navigate = useNavigate();
  const { id: editingTeacherId } = useParams();
  const { openConfirmModal, ModalComponent } = useConfirm();
  
  const { mutateAsync: deleteTeacher } = useDeleteTeacher();
  const updateTeacher = useUpdateTeacher();

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
    setSearchTerm(cleanValue);
    setCurrentPage(1);
    setSelectedRowKeys([]);
  };

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 500);
  
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

  const teachers = teachersData?.data?.teachers || [];

  const handleStatusFilter = (value) => {
    if (value == null || value === 'All') {
      setStatusFilter(null);
    } else {
      setStatusFilter(value === 'Active');
    }
    setCurrentPage(1);
    setSelectedRowKeys([]);
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
            error?.response?.data?.message || 'Failed to delete teacher. Please try again.'
          );
        }
      },
    });
  };

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
  const getSelectedTeachers = () =>
    teachers.filter((t) => selectedRowKeys.includes(t.ID));

  const handleBulkStatusChange = (newStatus) => {
    const selected = getSelectedTeachers();
    const statusLabel = newStatus ? 'Active' : 'Deactive';

    openConfirmModal({
      title: `Change status to "${statusLabel}"`,
      message: `Update ${selected.length} teacher(s) to "${statusLabel}"?`,
      okText: 'Update',
      okButtonColor: '#003087',
      onConfirm: async () => {
        try {
          await Promise.all(
            selected.map((t) =>
              updateTeacher.mutateAsync({ ...t, status: newStatus })
            )
          );
          setSelectedRowKeys([]);
          message.success(
            `Updated ${selected.length} teacher(s) to "${statusLabel}"`
          );
          refetch();
        } catch {
          message.error('Failed to update some teachers');
        }
      },
    });
  };

  const handleBulkExport = () => {
    const selected = getSelectedTeachers();
    const csvContent = [
      ['Teacher Name', 'Teacher ID', 'Email', 'Phone', 'Status'].join(','),
      ...selected.map((t) =>
        [
          `"${t.firstName || ''} ${t.lastName || ''}"`,
          `"${t.teacherCode || ''}"`,
          `"${t.email || ''}"`,
          `"${t.phone || ''}"`,
          `"${t.status ? 'Active' : 'Deactive'}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `teachers_export_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    message.success(`Exported ${selected.length} teacher(s)`);
  };

  const bulkActions = [
    {
      key: 'activate',
      label: 'Activate',
      icon: <CheckCircleOutlined />,
      onClick: () => handleBulkStatusChange(true),
      className: 'text-green-600 border-green-300 hover:!text-green-700 hover:!border-green-400',
    },
    {
      key: 'deactivate',
      label: 'Deactivate',
      icon: <StopOutlined />,
      onClick: () => handleBulkStatusChange(false),
      className: 'text-gray-600 border-gray-300',
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
      title: <span className="font-bold text-[#637381]">TEACHER NAME</span>,
      dataIndex: 'fullname',
      key: 'name',
      width: '200px',
      render: (text, record) => (
        <div className='overflow-hidden text-ellipsis whitespace-nowrap'>
          <Link
            to={`/teacher/edit/${record.ID}`}
            className='bg-transparent border-none p-0 cursor-pointer font-medium text-primaryColor underline underline-offset-4 hover:opacity-80'
          >
            {`${record.firstName} ${record.lastName}` || 'Unknown'}
          </Link>
        </div>
      ),
    },
    {
      title: <span className="font-bold text-[#637381]">TEACHER ID</span>,
      dataIndex: 'teacherCode',
      key: 'id',
      width: '120px',
      align: 'center',
      render: (text) => <span className="font-medium text-primaryTextColor">{text}</span>
    },
    {
      title: <span className="font-bold text-[#637381]">EMAIL</span>,
      dataIndex: 'email',
      key: 'email',
      width: '200px',
      ellipsis: true,
      render: (text) => <span className="font-medium text-primaryTextColor">{text}</span>
    },
    {
      title: <span className="font-bold text-[#637381]">PHONE</span>,
      dataIndex: 'phone',
      key: 'phone',
      width: '120px',
      align: 'center',
      render: (text) => <span className="font-medium text-primaryTextColor">{text || '---'}</span>
    },
    {
      title: <span className="font-bold text-[#637381]">STATUS</span>,
      dataIndex: 'status',
      key: 'status',
      width: '120px',
      align: 'center',
      render: (status) => (
        <Tag
          className={`rounded-full font-semibold px-3 py-1 text-center border-none ${
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
      title: <span className="font-bold text-[#637381]">ACTIONS</span>,
      key: 'actions',
      width: '150px',
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-4">
          <TeacherActionModal initialData={record} />
          <button
            onClick={() => handleDeleteTeacher(record)}
            className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70"
          >
            <DeleteOutlined style={{ fontSize: "20px", color: "#FF4D4F" }} />
          </button>
        </div>
      ),
    },
  ];

  const total = teachersData?.data?.pagination?.total || 0;
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  const selectedTeacher =
    teacherDetailData ||
    teachersData?.data?.teachers?.find(
      (teacher) => teacher.ID === editingTeacherId
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
      
      <div className='flex items-center justify-between mb-10'>
        <div className='flex items-center gap-4'>
          <SearchInput
            placeholder="Search by name, ID"
            value={searchTerm}
            onSearchChange={onSearchChange}
            isFigmaRedesign={true}
            style={{ margin: 0 }}
          />
          <Select
            placeholder="Select STATUS"
            onChange={handleStatusFilter}
            className="figma-status-select-sync"
            options={[
              { value: 'All', label: 'All' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
            allowClear
          />
        </div>
        <TeacherActionModal />
      </div>

      <style>{`
        /* --- HIGH SPECIFICITY ALIGNMENT FIX --- */
        
        /* 1. Force the Select to match the Search bar height exactly */
        .figma-status-select-sync.ant-select {
          width: 180px !important;
          height: 48px !important;
          margin: 0 !important;
          display: flex !important;
          align-items: center !important;
        }

        /* 2. Target the internal AntD selector which actually has the border/shadow */
        .figma-status-select-sync.ant-select .ant-select-selector {
          height: 48px !important;
          min-height: 48px !important;
          display: flex !important;
          align-items: center !important;
          border: 1px solid #DFE4EA !important;
          border-radius: 6px !important;
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1) !important;
          background-color: #ffffff !important;
          padding: 0 12px !important;
        }

        /* 3. Center the placeholder and selected text vertically */
        .figma-status-select-sync.ant-select .ant-select-selection-search,
        .figma-status-select-sync.ant-select .ant-select-selection-item,
        .figma-status-select-sync.ant-select .ant-select-selection-placeholder {
          display: flex !important;
          align-items: center !important;
          height: 100% !important;
          line-height: 1 !important;
          inset-inline-start: 12px !important;
        }

        /* 4. Ensure the Search bar also has no extra margins that could cause offsets */
        .figma-search-input {
          margin: 0 !important;
          vertical-align: middle !important;
        }
      `}</style>

      <div className="figma-table-card figma-table-overrides w-full">
        <Table
          columns={columns}
          dataSource={teachers}
          rowKey={(record) => record.ID}
          scroll={{ x: "max-content" }}
          pagination={false}
          loading={isLoading || isTeacherDetailLoading || !teachersData}
          rowSelection={rowSelection}
        />
      </div>

      <div className="figma-pagination-wrapper">
        <div className="figma-pagination-box">
          <div className="figma-pagination-text whitespace-nowrap">
            {total === 0
              ? "No entries found"
              : `Showing ${String(start).padStart(2, "0")}-${String(end).padStart(2, "0")} of ${total}`}
          </div>

          <div className="figma-pagination-nav-group">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              itemRender={(page, type, original) => {
                if (type === "page") {
                  const isActive = currentPage === page;
                  return (
                    <button className={`figma-page-btn ${isActive ? "active" : ""}`}>
                      {page}
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
                setCurrentPage(1);
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

      {/* ==================== BULK ACTION TOOLBAR ==================== */}
      <BulkActionToolbar
        selectedCount={selectedRowKeys.length}
        actions={bulkActions}
        onClearSelection={() => setSelectedRowKeys([])}
      />
    </div>
  );
};

export default TeacherManagement;
