import React, { useState } from 'react';
import { Table, Input, Pagination, Card, message } from 'antd';

const { Search } = Input;

const TableSearch = ({ data, columns, isLoading }) => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSearchChange = (e) => {
    const rawValue = e.target.value;
    let cleanValue = rawValue;

    // 1. Proactively handle special characters/emojis
    if (/[^a-zA-Z0-9\s]/.test(cleanValue)) {
      message.warning('Special characters and emojis are not allowed in search.');
      cleanValue = cleanValue.replace(/[^a-zA-Z0-9\s]/g, '');
    }

    // 2. Proactively handle multiple spaces
    if (/\s{2,}/.test(cleanValue)) {
      message.info('Multiple spaces are not allowed; collapsed to a single space.');
      cleanValue = cleanValue.replace(/\s{2,}/g, ' ');
    }

    // 3. Proactively handle length overflow
    if (cleanValue.length > 50) {
      message.error('Search limit reached (max 50 characters).');
      cleanValue = cleanValue.slice(0, 50);
    }

    setSearchText(cleanValue);
    setCurrentPage(1);
  };

  const filteredData = data.filter((item) => {
    const searchValue = searchText.toLowerCase().trim();
    if (!searchValue) return true;
    
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchValue)
    );
  });

  const total = filteredData.length;
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, end);

  return (
    <Card className='mt-4 shadow-sm border-none'>
      <Search
        placeholder={'Search anything...'}
        value={searchText}
        onChange={handleSearchChange}
        className='mb-4 w-full max-w-[300px]'
        allowClear
        enterButton
      />
      <div className='w-full'>
        <Table
          columns={columns}
          dataSource={paginatedData}
          rowKey={(record) => record.ID || record.id}
          pagination={false}
          scroll={{ x: 'max-content' }}
          className='w-full custom-table'
          loading={isLoading}
        />
        {/* BUG_CM071: Standardized Pagination UI */}
        <div className='flex justify-between items-center mt-6 px-4 bg-gray-50 p-4 rounded-lg'>
          <div className='text-gray-600 font-medium'>
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
            pageSizeOptions={['5', '10', '15', '20']}
            className='ant-pagination-custom'
          />
        </div>
      </div>
    </Card>
  );
};

export default TableSearch;
