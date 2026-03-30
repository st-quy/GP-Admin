import React, { useState } from "react";
import { Table, Input, Select, message } from "antd";
import { statusOptions } from "@features/classDetail/constant/statusEnum";
import { SearchOutlined } from "@ant-design/icons";

const SessionTable = ({ data, columns, isLoading }) => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSearchChange = (e) => {
    const rawValue = e.target.value;
    let cleanValue = rawValue;

    // 1. Proactively handle special characters/emojis (BUG_CM013)
    if (/[^a-zA-Z0-9\s]/.test(cleanValue)) {
      message.warning('Special characters and emojis are not allowed in search.');
      cleanValue = cleanValue.replace(/[^a-zA-Z0-9\s]/g, '');
    }

    // 2. Proactively handle multiple spaces (BUG_CM014)
    if (/\s{2,}/.test(cleanValue)) {
      message.info('Multiple spaces are not allowed; collapsed to a single space.');
      cleanValue = cleanValue.replace(/\s{2,}/g, ' ');
    }

    // 3. Proactively handle length overflow (BUG_CM012)
    if (cleanValue.length > 50) {
      message.error('Search limit reached (max 50 characters).');
      cleanValue = cleanValue.slice(0, 50);
    }

    // 4. Block leading spaces
    cleanValue = cleanValue.replace(/^\s+/, '');

    setSearchText(cleanValue);
    setCurrentPage(1);
  };

  // Convert statusOptions object to array for Select options
  const statusFilterOptions = Object.entries(statusOptions).map(
    ([value, info]) => ({
      value,
      label: info.label,
    })
  );

  const handleSearch = (value) => {
    const trimmedValue = value.trim();
    if (trimmedValue.length > 50) {
      message.error('Search query is too long');
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
          String(value).toLowerCase().includes(searchValue)
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

  return (
    <div className="mt-4">
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
          scroll={{ x: "max-content" }}
          className="w-full"
          loading={isLoading}
        />
      </div>

      <div className="figma-pagination-wrapper">
        <div className="figma-pagination-box">
          <div className="figma-pagination-text">
            {total > 0
              ? `Showing ${start}-${end} of ${total}`
              : "No entries found"}
          </div>

          <div className="figma-pagination-nav-group">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="figma-page-btn"
            >
              <img src="/src/assets/icons/chevron-left.svg" alt="prev" style={{ display: 'none' }} />
              {"<"}
            </button>

            {[...Array(Math.ceil(total / pageSize))].map((_, i) => {
              const page = i + 1;
              // Simple pagination logic for brevity, can be expanded
              if (
                page === 1 ||
                page === Math.ceil(total / pageSize) ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`figma-page-btn ${currentPage === page ? "active" : ""}`}
                  >
                    {page}
                  </button>
                );
              }
              if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="text-[#637381]">...</span>;
              }
              return null;
            })}

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))
              }
              disabled={currentPage === Math.ceil(total / pageSize)}
              className="figma-page-btn"
            >
              {">"}
            </button>

            <div className="figma-page-size-container">
              <Select
                value={pageSize}
                onChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 5, label: "5 / pages" },
                  { value: 10, label: "10 / pages" },
                  { value: 15, label: "15 / pages" },
                  { value: 20, label: "20 / pages" },
                ]}
                variant="borderless"
                className="figma-page-size-select w-[110px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTable;
