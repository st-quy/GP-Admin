import React, { useState, useMemo, useEffect } from 'react';
import { Table, Input, Pagination, Card, Empty, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const TableSearch = ({ 
  data = [], 
  total: totalProp = 0,
  columns, 
  isLoading, 
  placeholder = "Search anything...",
  isFigmaRedesign = false,
  serverSide = false,
  onParamsChange,
  currentPage: currentPageProp = 1,
  pageSize: pageSizeProp = 10
}) => {
  const [localSearchText, setLocalSearchText] = useState('');
  
  const currentPage = serverSide ? currentPageProp : 1;
  const pageSize = serverSide ? pageSizeProp : 10;

  // Internal state for non-server-side pagination
  const [internalPage, setInternalPage] = useState(1);

  // BUG_CM051: Implement Live Prevention search logic
  const handleSearchChange = (e) => {
    let value = e.target.value;
    if (/[^a-zA-Z0-9 ,.\-_:()"':]/.test(value)) {
      value = value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '');
    }
    if (/\s{2,}/.test(value)) {
      value = value.replace(/\s{2,}/g, ' ');
    }
    const cleanValue = value.replace(/^\s+/, '');
    setLocalSearchText(cleanValue);

    if (serverSide && onParamsChange) {
      onParamsChange({ search: cleanValue });
    } else {
      setInternalPage(1);
    }
  };

  const total = serverSide ? totalProp : data.length;
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);
  
  const displayData = useMemo(() => {
    if (serverSide) return data;
    return data.slice((internalPage - 1) * pageSize, internalPage * pageSize);
  }, [data, internalPage, pageSize, serverSide]);

  return (
    <div className='w-full'>
      {/* 1. Search Bar - Aligned Far Left */}
      <div className={isFigmaRedesign ? 'mb-6 text-left' : 'mb-6 p-6 pb-0'}>
        <Input
          placeholder={placeholder}
          prefix={<SearchOutlined className={isFigmaRedesign ? 'text-[#6B7280] mr-2' : 'text-gray-400 mr-2'} />}
          value={localSearchText}
          onChange={handleSearchChange}
          maxLength={100}
          className={isFigmaRedesign ? 'figma-search-input' : 'h-[44px] w-full max-w-[320px] rounded-lg border-gray-300 focus:border-[#003087] hover:border-[#003087] transition-all bg-[#F9FAFB]'}
          allowClear
        />
      </div>

      {/* 2. Table Card */}
      <Card 
        className={isFigmaRedesign ? 'figma-table-card' : 'shadow-md rounded-xl border border-gray-200 overflow-hidden bg-white'}
        bodyStyle={{ padding: '0' }}
      >
        <div className='w-full'>
          <Table
            columns={columns}
            dataSource={displayData}
            rowKey='ID'
            pagination={false}
            loading={isLoading}
            className={isFigmaRedesign ? 'figma-table-overrides' : 'custom-modern-table'}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <Empty description="No data found." /> }}
          />
        </div>
      </Card>

      {/* 3. Pagination Wrapper - Aligned Far Right */}
      {isFigmaRedesign ? (
        <div className='figma-pagination-wrapper'>
          <div className='figma-pagination-box'>
            <div className='figma-pagination-text whitespace-nowrap'>
              {total === 0
                ? 'No entries found'
                : `Showing ${String(start).padStart(2, '0')}-${String(end).padStart(2, '0')} of ${total}`}
            </div>

            <div className='figma-pagination-nav-group'>
              <Pagination
                current={serverSide ? currentPage : internalPage}
                pageSize={pageSize}
                total={total}
                onChange={(page) => {
                  if (serverSide && onParamsChange) {
                    onParamsChange({ page });
                  } else {
                    setInternalPage(page);
                  }
                }}
                showSizeChanger={false}
                itemRender={(page, type, original) => {
                  if (type === 'page') {
                    const activePage = serverSide ? currentPage : internalPage;
                    const isActive = activePage === page;
                    // Logic: First, Last, and 2 around Current
                    const isVisible = page === 1 || 
                                    page === Math.ceil(total/pageSize) || 
                                    (page >= activePage - 2 && page <= activePage + 2);
                    
                    if (!isVisible) return null;

                    return (
                      <button className={`figma-page-btn ${isActive ? 'active' : ''}`}>
                        {page}
                      </button>
                    );
                  }
                  if (type === 'prev') {
                    return <button className="figma-symbol-btn" type="button">{"\u2039"}</button>;
                  }
                  if (type === 'next') {
                    return <button className="figma-symbol-btn" type="button">{"\u203A"}</button>;
                  }
                  if (type === 'jump-prev' || type === 'jump-next') {
                    return <span className="text-gray-400 px-1">...</span>;
                  }
                  return original;
                }}
              />
            </div>

            <div className="figma-page-size-container">
               <Select
                  value={pageSize}
                  onChange={(val) => {
                    if (serverSide && onParamsChange) {
                      onParamsChange({ pageSize: val, page: 1 });
                    }
                  }}
                  bordered={false}
                  className="figma-page-size-select"
                  options={[
                    { value: 5, label: '05 / pages' },
                    { value: 10, label: '10 / pages' },
                    { value: 20, label: '20 / pages' },
                    { value: 50, label: '50 / pages' },
                  ]}
               />
            </div>
          </div>
        </div>
      ) : (
        <div className='flex flex-col md:flex-row justify-between items-center mt-8 px-2 gap-4'>
          <div className='text-[#6B7280] font-inter font-medium text-[14px]'>
            {total === 0 ? 'No entries found' : `Showing ${start}-${end} of ${total}`}
          </div>
          <div className='flex items-center gap-4'>
            <Pagination
              current={serverSide ? currentPage : internalPage}
              pageSize={pageSize}
              total={total}
              onChange={(page, size) => {
                if (serverSide && onParamsChange) onParamsChange({ page, pageSize: size });
                else { setInternalPage(page); }
              }}
              showSizeChanger={false}
            />
          </div>
        </div>
      )}

      <style>{`
        .ant-pagination {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
        }
        .ant-pagination-item, .ant-pagination-prev, .ant-pagination-next, .ant-pagination-jump-prev, .ant-pagination-jump-next {
          border: none !important;
          background: transparent !important;
          margin: 0 4px !important;
          min-width: auto !important;
          height: auto !important;
          display: flex !important;
          align-items: center !important;
        }
      `}</style>
    </div>
  );
};

export default TableSearch;
