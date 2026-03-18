import React, { useState } from "react";
import { Table, Input, Pagination, Select, message } from "antd";
import { statusOptions } from "@features/classDetail/constant/statusEnum";

const { Search } = Input;

const SessionTable = ({ data, columns, isLoading }) => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
    const searchValue = searchText.toLowerCase();
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
          onSearch={handleSearch}
          onChange={(e) => {
            if (e.target.value === "") {
              setSearchText("");
              setCurrentPage(1);
            }
          }}
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
