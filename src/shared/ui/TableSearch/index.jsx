import React, { useState } from 'react';
import { Table, Input, Pagination, Card } from 'antd';

const { Search } = Input;

const TableSearch = ({ data, columns, isLoading }) => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

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
    <Card className='mt-4'>
      <Search
        placeholder={'Search anything...'}
        onChange={(e) => {
          setSearchText(e.target.value);
          setCurrentPage(1);
        }}
        className='mb-4 w-full max-w-[300px]'
        allowClear
      />
      <div className='w-full'>
        <Table
          columns={columns}
          dataSource={paginatedData}
          rowKey='ID'
          pagination={false} // Ẩn pagination mặc định
          scroll={{ x: 'max-content' }}
          className='w-full'
          loading={isLoading}
        />
        <div className='flex justify-between items-center mt-2 px-4'>
          <span className='text-gray-500 text-sm'>{`Showing ${start}-${end} of ${total}`}</span>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      </div>
    </Card>
  );
};

export default TableSearch;
