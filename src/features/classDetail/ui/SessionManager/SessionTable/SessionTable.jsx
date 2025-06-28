import React, { useState } from "react";
import { Table, Input, Pagination, Select } from "antd";
import { statusOptions } from "@features/classDetail/constant/statusEnum";

const { Search } = Input;

const SessionTable = ({ data, columns, isLoading }) => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Convert statusOptions object to array for Select options
  const statusFilterOptions = Object.entries(statusOptions).map(
    ([value, info]) => ({
      value,
      label: info.label,
    })
  );

  // Filter data based on both search text and status
  const filteredData = data.filter((item) => {
    const matchesSearch = searchText
      ? Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchText.toLowerCase())
        )
      : true;

    const matchesStatus = statusFilter ? item.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(start + pageSize - 1, filteredData.length);
  const total = filteredData.length;
  const paginatedData = filteredData.slice(start - 1, end);

  // Handle status filter change
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-4 mb-4">
        <Search
          placeholder="Search anything..."
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full max-w-[300px]"
          allowClear
        />
        <Select
          className="w-[150px]"
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
          className="w-full"
          loading={isLoading}
        />
        <div className="flex justify-between items-center mt-2 px-4">
          <span className="text-gray-500 text-sm">{`Showing ${start}-${end} of ${total}`}</span>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
};

export default SessionTable;
