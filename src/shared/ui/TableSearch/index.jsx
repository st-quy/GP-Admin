import React, { useState } from "react";
import { Table, Input, Pagination } from "antd";

const { Search } = Input;

const TableSearch = ({ data, columns, isLoading }) => {
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredData = data.filter((item) => {
    const searchValue = searchText.toLowerCase();
    
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchValue)
    );
  });
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(start + pageSize - 1, filteredData.length);
  const total = filteredData.length;
  const paginatedData = filteredData.slice(start - 1, end);

  return (
    <div className="mt-4">
      <Search
        placeholder={"Search anything..."}
        onChange={(e) => {
          setSearchText(e.target.value);
          setCurrentPage(1);
        }}
        className="mb-4 w-full max-w-[300px]"
        allowClear
      />
      <div className="w-full">
        <Table
          columns={columns}
          dataSource={paginatedData}
          rowKey="ID"   
          scroll={{ x: "max-content" }}
          className="w-full"
          loading={isLoading}
          pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "15", "20"],
          showTotal: (total, range) =>
            `Showing ${range[0]}-${range[1]} of ${total}`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
        />
       
      </div>
    </div>
  );
};

export default TableSearch;
