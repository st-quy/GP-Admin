import React, { useEffect, useState } from 'react';
import {
  BookOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  useGetAllClass,
  handleImportClick,
  fileInputRef,
  handleExportExcel,
  handlePreviewFile,
} from '@features/classManagement/hooks';
import CreateClassModal from '@features/classManagement/ui/Modal/CreateClass';
import { Button, Empty, Input, Pagination, Select, Table } from 'antd';
import { Link } from 'react-router-dom';
import UpdateClassModal from '@features/classManagement/ui/Modal/UpdateClass';
import DeleteClassModal from '@features/classManagement/ui/Modal/DeleteClass';
import { useSelector } from 'react-redux';
import PreviewExam from '@shared/ui/PreviewExam';

const ClassManagement = () => {
  const [dataExam, setDataExam] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [isOpen, setIsOpen] = useState('');
  const [dataClass, setClassData] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  // @ts-ignore
  const { userId, user } = useSelector((state) => state.auth);

  const { data: classList, isLoading } = useGetAllClass(
    user?.role.includes('admin') ? null : userId
  );

  const handleExport = async () => {
    setExportLoading(true);
    await handleExportExcel(setExportLoading);
    setExportLoading(false);
  };

  const handleUpdateClass = (record) => () => {
    setIsOpen('Update');
    setClassData(record);
  };

  const handleDeleteClass = (record) => () => {
    setIsOpen('Delete');
    setClassData(record);
  };

  const filteredClasses = (classList || []).filter((item) => {
    const searchValue = searchText.trim().toLowerCase();

    if (!searchValue) {
      return true;
    }

    return String(item.className || '')
      .toLowerCase()
      .includes(searchValue);
  });

  const start = filteredClasses.length ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(start + pageSize - 1, filteredClasses.length);
  const paginatedClasses = filteredClasses.slice(start - 1, end);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredClasses.length / pageSize));

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, filteredClasses.length, pageSize]);

  const columns = [
    {
      title: 'CLASS NAME',
      dataIndex: 'className',
      key: 'className',
      align: 'left',
      render: (text, record) => (
        <Link
          to={`${record.ID}`}
          className='text-[14px] font-medium text-primaryColor underline underline-offset-2'
        >
          {text}
        </Link>
      ),
    },
    {
      title: 'NUMBER OF SESSIONS',
      dataIndex: 'numberOfSessions',
      key: 'numberOfSessions',
      align: 'center',
      render: (text) => (
        <div className='text-center text-[14px] font-medium text-primaryTextColor'>
          {text}
        </div>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <div className='flex items-center justify-center gap-6'>
          <Button
            className='!border-none !bg-transparent !p-0 !text-primaryColor shadow-none hover:!bg-transparent hover:!text-primaryColor'
            type='text'
            icon={<EditOutlined className='text-[20px]' />}
            onClick={handleUpdateClass(record)}
          />
          {record.numberOfSessions <= 0 && (
            <Button
              className='!border-none !bg-transparent !p-0 !text-[#F23030] shadow-none hover:!bg-transparent hover:!text-[#F23030]'
              type='text'
              icon={<DeleteOutlined className='text-[20px]' />}
              onClick={handleDeleteClass(record)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className='min-h-full bg-[#F9F9F9] px-4 py-5 md:px-8 md:py-8'>
      <div className='mx-auto flex w-full max-w-[1476px] flex-col gap-6'>
        <div className='flex min-h-[68px] items-center rounded-[8px] border border-primaryColor bg-white px-5 py-4 shadow-[0px_1px_3px_rgba(166,175,195,0.4)] md:px-[22px]'>
          <div className='flex flex-wrap items-center gap-2 text-[16px] font-medium text-primaryColor'>
            <BookOutlined className='text-[18px]' />
            <span>Class Management</span>
          </div>
        </div>

        <div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
          <div className='space-y-3'>
            <h1 className='m-0 text-[30px] font-bold leading-[38px] text-black'>
              Class Management
            </h1>
            <p className='m-0 text-[18px] font-medium leading-[26px] text-primaryTextColor'>
              Manage and organize both classes and individual sessions.
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <Button
              type='default'
              className='!h-[42px] !rounded-full !border !border-[#D8E4F8] !bg-white !px-5 !text-[14px] !font-medium !text-primaryColor hover:!border-primaryColor hover:!text-primaryColor'
              onClick={handleExport}
              loading={exportLoading}
              icon={<DownloadOutlined />}
            >
              Export
            </Button>
            <Button
              type='default'
              className='!h-[42px] !rounded-full !border !border-[#D8E4F8] !bg-white !px-5 !text-[14px] !font-medium !text-primaryColor hover:!border-primaryColor hover:!text-primaryColor'
              onClick={handleImportClick}
              loading={importLoading}
              icon={<UploadOutlined />}
            >
              Import
            </Button>
            <input
              type='file'
              accept='.xlsx, .xls'
              ref={fileInputRef}
              onChange={(e) => {
                setFileData(e.target.files[0]);
                handlePreviewFile(
                  e.target.files[0],
                  setIsModalOpen,
                  setDataExam
                );
              }}
              style={{ display: 'none' }}
            />
            <Button
              type='primary'
              className='!h-[50px] !min-w-[145px] !rounded-full !border-none !bg-primaryColor !px-7 !text-[16px] !font-medium hover:!bg-[#002A6B]'
              onClick={() => setIsOpen('Create')}
            >
              Create new class
            </Button>
          </div>
        </div>

        <div className='max-w-[250px] drop-shadow-[0px_4px_4px_rgba(0,0,0,0.08)]'>
          <Input
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
            allowClear
            placeholder='Search by class name'
            suffix={<SearchOutlined className='text-[#6B7280]' />}
            className='!h-12 !rounded-[6px] !border-[#DFE4EA] !px-4'
          />
        </div>

        <div className='overflow-hidden rounded-[10px] bg-white shadow-[0px_2px_8px_rgba(17,24,39,0.08)]'>
          <Table
            columns={columns}
            dataSource={paginatedClasses}
            rowKey='ID'
            loading={isLoading}
            pagination={false}
            scroll={{ x: 900 }}
            locale={{
              emptyText: (
                <Empty
                  description='No classes found'
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
            className='class-management-table'
          />

          <div className='flex flex-col gap-4 px-0 py-5 md:flex-row md:items-center md:justify-end'>
            <span className='text-[16px] font-medium text-[#202224]/60'>
              {filteredClasses.length
                ? `Showing ${start.toString().padStart(2, '0')}-${end
                    .toString()
                    .padStart(2, '0')} of ${filteredClasses.length}`
                : 'Showing 00-00 of 0'}
            </span>

            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredClasses.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              itemRender={(page, type, originalElement) => {
                if (type === 'page') {
                  const isActive = page === currentPage;

                  return (
                    <button
                      type='button'
                      className={`flex h-8 min-w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-primaryColor bg-primaryColor text-white'
                          : 'border-[#D8E4F8] bg-white text-primaryTextColor hover:border-primaryColor hover:text-primaryColor'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }

                if (type === 'prev') {
                  return (
                    <button
                      type='button'
                      className='flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent text-primaryTextColor transition-colors hover:border-[#D8E4F8] hover:text-primaryColor'
                    >
                      <LeftOutlined className='text-[12px]' />
                    </button>
                  );
                }

                if (type === 'next') {
                  return (
                    <button
                      type='button'
                      className='flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent text-primaryTextColor transition-colors hover:border-[#D8E4F8] hover:text-primaryColor'
                    >
                      <RightOutlined className='text-[12px]' />
                    </button>
                  );
                }

                return originalElement;
              }}
            />

            <Select
              value={pageSize}
              onChange={(value) => {
                setPageSize(value);
                setCurrentPage(1);
              }}
              options={[
                { value: 5, label: '5 / pages' },
                { value: 10, label: '10 / pages' },
                { value: 20, label: '20 / pages' },
              ]}
              className='class-management-page-size !w-[110px]'
            />
          </div>
        </div>

        <CreateClassModal
          isOpen={isOpen === 'Create' ? true : false}
          onClose={() => setIsOpen(null)}
        />
        {dataClass && (
          <UpdateClassModal
            isOpen={isOpen === 'Update' ? true : false}
            onClose={() => {
              setClassData(null);
              setIsOpen(null);
            }}
            data={dataClass}
          />
        )}
        <DeleteClassModal
          isOpen={isOpen === 'Delete' ? true : false}
          onClose={() => setIsOpen(null)}
          classId={dataClass?.ID}
        />
        {isModalOpen && (
          <PreviewExam
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            dataExam={dataExam}
            fileData={fileData}
            setDataExam={setDataExam}
          />
        )}
      </div>
      <style>
        {`
          .class-management-table .ant-table {
            background: #FFFFFF;
          }

          .class-management-table .ant-table-thead > tr > th {
            background: #E6F0FA !important;
            
            font-size: 16px;
            font-weight: 500;
            line-height: 24px;
            padding-top: 34px !important;
            padding-bottom: 34px !important;
            border-bottom: 1px solid #EEEEEE !important;
          }

          .class-management-table .ant-table-thead > tr > th::before {
            display: none !important;
          }

          .class-management-table .ant-table-tbody > tr > td {
            border-bottom: 1px solid #EEEEEE !important;
            padding-top: 30px !important;
            padding-bottom: 30px !important;
            font-size: 14px;
            line-height: 22px;
          }

          .class-management-table .ant-table-container {
            border: 1px solid #EEEEEE;
            border-radius: 10px;
            overflow: hidden;
          }

          .class-management-table .ant-table-tbody > tr:last-child > td {
            border-bottom: none !important;
          }

          .class-management-table .ant-pagination {
            margin: 0 !important;
            align-items: center;
          }

          .class-management-table .ant-pagination .ant-pagination-item {
            min-width: 32px;
            height: 32px;
            line-height: 30px;
            border-radius: 8px;
            border: 1px solid transparent;
          }

          .class-management-table .ant-pagination .ant-pagination-item a {
            color: #637381;
          }

          .class-management-table .ant-pagination .ant-pagination-item-active {
            border-color: #0A2A79;
            background: #0A2A79;
          }

          .class-management-table .ant-pagination .ant-pagination-item-active a {
            color: #FFFFFF;
          }

          .class-management-page-size .ant-select-selector {
            height: 40px !important;
            border-radius: 8px !important;
            border-color: #CED4DA !important;
            box-shadow: none !important;
          }

          .class-management-page-size .ant-select-selection-item {
            line-height: 38px !important;
            color: #637381;
            font-size: 16px;
          }
        `}
      </style>
    </div>
  );
};

export default ClassManagement;
