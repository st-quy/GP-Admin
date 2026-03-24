import React, { useState } from "react";
import { Table, Input, Pagination, Select, message } from "antd";
import { statusOptions } from "@features/classDetail/constant/statusEnum";

const { Search } = Input;

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
      <div className="flex items-center gap-4 mb-6">
        <Search
          placeholder="Search sessions..."
          value={searchText}
          onChange={handleSearchChange}
          className="w-full max-w-[300px]"
          allowClear
          enterButton
        />
        <Select
          className="w-[180px] h-[40px]"
          placeholder="Filter by status"
          onChange={handleStatusFilterChange}
          allowClear
          options={statusFilterOptions}
        />
      </div>
      <div className="w-full">
        <Table
          columns={columns}
          dataSource={paginatedData}
          rowKey="ID"
          pagination={false}
          scroll={{ x: "max-content" }}
          className="w-full custom-table"
          loading={isLoading}
        />
        <div className="flex justify-between items-center mt-6 px-4 bg-gray-50 p-4 rounded-lg shadow-sm">
          <div className="text-gray-600 font-medium">
            {total > 0 ? `Showing ${start}-${end} of ${total} entries` : 'No entries found'}
          </div>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            showSizeChanger
            pageSizeOptions={["5", "10", "15", "20"]}
            className="ant-pagination-custom"
          />
        </div>
      </div>
    </div>
  );
};

export default SessionTable;
