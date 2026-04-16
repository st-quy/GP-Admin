import React, { useState } from "react";
import { Table, Input, Select, message, Pagination } from "antd";
import { statusOptions } from "@features/classDetail/constant/statusEnum";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons";
import BulkActionToolbar from "@shared/ui/BulkActionToolbar";

const SessionTable = ({ data, columns, isLoading, onBulkDelete, selectedRowKeys, setSelectedRowKeys }) => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedSessions, setSelectedSessions] = useState([]);

  const handleSearchChange = (e) => {
    const rawValue = e.target.value;
    let cleanValue = rawValue;

    // 1. Proactively handle special characters/emojis (BUG_CM013)
    if (/[^a-zA-Z0-9\s]/.test(cleanValue)) {
      message.warning(
        "Special characters and emojis are not allowed in search.",
      );
      cleanValue = cleanValue.replace(/[^a-zA-Z0-9\s]/g, "");
    }

    // 2. Proactively handle multiple spaces (BUG_CM014)
    if (/\s{2,}/.test(cleanValue)) {
      message.info(
        "Multiple spaces are not allowed; collapsed to a single space.",
      );
      cleanValue = cleanValue.replace(/\s{2,}/g, " ");
    }

    // 3. Proactively handle length overflow (BUG_CM012)
    if (cleanValue.length > 50) {
      message.error("Search limit reached (max 50 characters).");
      cleanValue = cleanValue.slice(0, 50);
    }

    // 4. Block leading spaces
    cleanValue = cleanValue.replace(/^\s+/, "");

    setSearchText(cleanValue);
    setCurrentPage(1);
  };

  // Convert statusOptions object to array for Select options
  const statusFilterOptions = Object.entries(statusOptions).map(
    ([value, info]) => ({
      value,
      label: info.label,
    }),
  );

  const handleSearch = (value) => {
    const trimmedValue = value.trim();
    if (trimmedValue.length > 50) {
      message.error("Search query is too long");
      return;
    }
    setSearchText(trimmedValue);
    setCurrentPage(1);
  };

  // Filter data based on both search text and status
  const filteredData = data.filter((item) => {
    const searchValue = searchText.toLowerCase().trim();
    const matchesSearch = searchValue
      ? Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchValue),
        )
      : true;

    const matchesStatus = statusFilter ? item.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  const total = filteredData.length;
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, end);

  // Handle status filter change
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSelectionChange = (keys, records) => {
    setSelectedRowKeys(keys);
    setSelectedSessions(records);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: handleSelectionChange,
    columnWidth: 60,
  };

  const handleBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(selectedSessions);
    }
  };

  const bulkActions = [
    {
      label: 'Delete',
      icon: <DeleteOutlined />,
      onClick: handleBulkDelete,
      danger: true,
    },
  ];

  return (
    <div className="mt-4">
      <BulkActionToolbar
        visible={selectedRowKeys.length > 0}
        selectedCount={selectedRowKeys.length}
        actions={bulkActions}
        onClearSelection={() => {
          setSelectedRowKeys([]);
          setSelectedSessions([]);
        }}
      />
      <div className="mb-6 flex items-center gap-4">
        <Input
          placeholder="Search sessions..."
          value={searchText}
          onChange={handleSearchChange}
          className="figma-search-input"
          prefix={<SearchOutlined className="text-[#9CA3AF]" />}
          allowClear
        />
        <Select
          className="h-[48px] w-[180px] !border-[#DFE4EA] !shadow-[0px_4px_4px_rgba(0,0,0,0.1)]"
          placeholder="Filter by status"
          onChange={handleStatusFilterChange}
          allowClear
          options={statusFilterOptions}
        />
      </div>
       <div className="figma-table-card figma-table-overrides w-full">
         <Table
           columns={columns}
           dataSource={paginatedData}
           rowKey="ID"
           pagination={false}
           className="w-full"
           loading={isLoading}
           rowSelection={rowSelection}
           scroll={{ x: "max-content" }}
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
                { value: 15, label: "15 / pages" },
                { value: 20, label: "20 / pages" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTable;
