import React, { useState, useMemo } from 'react';
import { Table, Input, Pagination, Card, Empty, Select, message } from 'antd';
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
  
  // Internal state for non-server-side pagination
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(10);

  const currentPage = serverSide ? currentPageProp : internalPage;
  const pageSize = serverSide ? pageSizeProp : internalPageSize;

  // BUG_CM051: Implement Live Prevention search logic
  const handleSearchChange = (e) => {
    const rawValue = e.target.value;
    let cleanValue = rawValue;

    // 1. Proactively handle special characters/emojis
    if (/[^a-zA-Z0-9 ,.\-_:()"':]/.test(cleanValue)) {
      cleanValue = cleanValue.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '');
    }

    // 2. Proactively handle multiple spaces
    if (/\s{2,}/.test(cleanValue)) {
      cleanValue = cleanValue.replace(/\s{2,}/g, ' ');
    }

    // 3. Proactively handle length overflow
    if (cleanValue.length > 50) {
      message.error('Search limit reached (max 50 characters).');
      cleanValue = cleanValue.slice(0, 50);
    }

    // 4. Block leading spaces
    cleanValue = cleanValue.replace(/^\s+/, '');
    
    setLocalSearchText(cleanValue);

    if (serverSide && onParamsChange) {
      onParamsChange({ search: cleanValue, page: 1 });
    } else {
      setInternalPage(1);
    }
  };

  const filteredData = useMemo(() => {
    if (serverSide) return data;
    if (!localSearchText) return data;
    const searchValue = localSearchText.toLowerCase();
    return data.filter((item) => {
      return Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchValue)
      );
    });
  }, [data, localSearchText, serverSide]);

  const total = totalProp > 0 ? totalProp : (serverSide ? totalProp : filteredData.length);
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);
  
  const displayData = useMemo(() => {
    if (serverSide) return data;
    return filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredData, currentPage, pageSize, serverSide, data]);

  return (
    <div className={isFigmaRedesign ? 'flex flex-col items-center w-full' : ''}>
      {/* 1. Search Bar Wrapper */}
      <div className={isFigmaRedesign ? 'w-full mb-6 text-left' : 'mb-6 p-6 pb-0'}>
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
            locale={{
              emptyText: <Empty description="No data found." />
            }}
          />
        </div>
      </Card>

      {/* 3. Pagination Redesign (Right Anchored Group) */}
      {isFigmaRedesign ? (
        <div className='figma-pagination-wrapper'>
          <div className='figma-pagination-box'>
            {/* Left: Showing text */}
            <div className='figma-pagination-text whitespace-nowrap'>
              {total === 0
                ? 'No entries found'
                : `Showing ${String(start).padStart(2, '0')}-${String(end).padStart(2, '0')} of ${total}`}
            </div>

            {/* Middle: Navigation Symbols + Numbers */}
            <div className='figma-pagination-nav-group'>
              <Pagination
                current={currentPage}
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
                    const isActive = currentPage === page;
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
                    return <span className="text-[#637381] px-1" style={{ fontSize: '16px', lineHeight: '25px' }}>...</span>;
                  }
                  return original;
                }}
              />
            </div>

            {/* Right: Page Size Dropdown */}
            <div className="figma-page-size-container">
               <Select
                  value={pageSize}
                  onChange={(val) => {
                    if (serverSide && onParamsChange) {
                      onParamsChange({ pageSize: val, page: 1 });
                    } else {
                      setInternalPageSize(val);
                      setInternalPage(1);
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
        /* STANDARD PAGINATION (fallback) */
        <div className='flex flex-col md:flex-row justify-between items-center mt-8 px-2 gap-4'>
          <div className='text-[#6B7280] font-inter font-medium text-[14px]'>
            {total === 0 ? 'No entries found' : `Showing ${start}-${end} of ${total}`}
          </div>
          <div className='flex items-center gap-4'>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}
              onChange={(page, size) => {
                if (serverSide && onParamsChange) onParamsChange({ page, pageSize: size });
                else { setInternalPage(page); setInternalPageSize(size); }
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
          flex-wrap: nowrap !important;
        }
        .ant-pagination-item, .ant-pagination-prev, .ant-pagination-next, .ant-pagination-jump-prev, .ant-pagination-jump-next {
          border: none !important;
          background: transparent !important;
          margin: 0 4px !important;
          min-width: auto !important;
          height: auto !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
      `}</style>
    </div>
  );
};

export default TableSearch;
