import React, { useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  useGetAllClass,
  useDeleteClassBulk,
} from '@features/classManagement/hooks';
import CreateClassModal from '@features/classManagement/ui/Modal/CreateClass';
import TableSearch from '@shared/ui/TableSearch';
import { Button, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import UpdateClassModal from '@features/classManagement/ui/Modal/UpdateClass';
import DeleteClassModal from '@features/classManagement/ui/Modal/DeleteClass';
import { useSelector } from 'react-redux';
import PreviewExam from '@shared/ui/PreviewExam';
import BulkActionToolbar from '@shared/ui/BulkActionToolbar';
import { message } from 'antd';
import { useDebouncedValue } from '@shared/hook/useDebounceValue';

const ClassManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState('');
  const [dataClass, setClassData] = useState(null);
  
  // Selection
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchName, setSearchName] = useState('');

  const debouncedSearch = useDebouncedValue(searchName, 500);

  // @ts-ignore
  const { userId, user } = useSelector((state) => state.auth);

  const teacherId = user?.role?.includes('admin') ? null : userId;
  
  const { data: response, isLoading, refetch } = useGetAllClass({
    teacherId,
    page: currentPage,
    limit: pageSize,
    searchName: debouncedSearch || undefined
  });

  const { mutate: deleteBulkClasses } = useDeleteClassBulk();

  const classList = response?.data || [];
  const totalItems = response?.total || 0;

  const handleUpdateClass = (record) => () => {
    setIsOpen('Update');
    setClassData(record);
  };

  const handleDeleteClass = (record) => () => {
    setIsOpen('Delete');
    setClassData(record);
  };

  const onParamsChange = (params) => {
    if (params.search !== undefined) setSearchName(params.search);
    if (params.page !== undefined) setCurrentPage(params.page);
    if (params.pageSize !== undefined) {
      setPageSize(params.pageSize);
      setCurrentPage(1);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    columnWidth: 60,
  };

    const handleBulkDelete = () => {
      const hasSessions = classList.some(cls => 
        selectedRowKeys.includes(cls.ID) && cls.numberOfSessions > 0
      );
      
      if (hasSessions) {
        message.error('Cannot delete class(es) that contain sessions. Please remove all sessions first.');
        return;
      }
      
      deleteBulkClasses(selectedRowKeys, {
        onSuccess: () => {
          message.success(`${selectedRowKeys.length} class(es) deleted successfully`);
          setSelectedRowKeys([]);
        },
        onError: (error) => {
          if (error.response?.data?.message) {
            message.error(error.response.data.message);
          } else {
            message.error('Failed to delete classes');
          }
        }
      });
    };

   const bulkActions = [
     {
       label: 'Delete',
       icon: <DeleteOutlined />,
       onClick: handleBulkDelete,
       danger: true,
     },
   ];

  const columns = [
    {
      title: 'CLASS NAME',
      dataIndex: 'className',
      key: 'className',
      align: 'center',
      render: (text, record) => (
        <Tooltip title={text}>
          <Link to={`/class/${record.ID}`} className='figma-class-link font-medium'>
            {text}
          </Link>
        </Tooltip>
      ),
    },
    {
      title: 'NUMBER OF SESSIONS',
      dataIndex: 'numberOfSessions',
      key: 'numberOfSessions',
      align: 'center',
      render: (text) => <span className='text-[#637381]'>{text}</span>,
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <div className='flex gap-4 justify-center items-center'>
          <Tooltip title="Edit">
            <button 
              className='cursor-pointer border-none bg-transparent hover:opacity-70 transition-all'
              onClick={handleUpdateClass(record)}
            >
              <EditOutlined style={{ fontSize: '20px', color: '#003087' }} />
            </button>
          </Tooltip>
          {record.numberOfSessions <= 0 && (
            <Tooltip title="Delete">
              <button 
                className='cursor-pointer border-none bg-transparent hover:opacity-70 transition-all'
                onClick={handleDeleteClass(record)}
              >
                <DeleteOutlined style={{ fontSize: '20px', color: '#FF4D4F' }} />
              </button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className='figma-page-container'>
      <div className='figma-content-wrapper'>
        <BulkActionToolbar
          visible={selectedRowKeys.length > 0}
          selectedCount={selectedRowKeys.length}
          actions={bulkActions}
          onClearSelection={() => setSelectedRowKeys([])}
        />
        
        <div className='figma-header-section'>
          <div>
            <h1 className='figma-title'>Class Management</h1>
            <p className='figma-subtitle'>Manage and organize both classes and individual sessions.</p>
          </div>
          
          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
            <Button
              className='figma-primary-btn w-full sm:w-auto'
              onClick={() => setIsOpen('Create')}
              icon={<PlusOutlined />}
            >
              Create new class
            </Button>
          </div>
        </div>
      </div>
      
      <div className='figma-content-wrapper'>
        <TableSearch
          data={classList}
          total={totalItems}
          columns={columns}
          isLoading={isLoading}
          placeholder="Search by class name"
          isFigmaRedesign={true}
          serverSide={true}
          onParamsChange={onParamsChange}
          currentPage={currentPage}
          pageSize={pageSize}
          rowSelection={rowSelection}
        />
      </div>
        
      <CreateClassModal
        isOpen={isOpen === 'Create'}
        onClose={() => setIsOpen(null)}
      />
      
      {dataClass && (
        <UpdateClassModal
          isOpen={isOpen === 'Update'}
          onClose={() => {
            setClassData(null);
            setIsOpen(null);
          }}
          data={dataClass}
        />
      )}
      
      <DeleteClassModal
        isOpen={isOpen === 'Delete'}
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
  );
};

export default ClassManagement;
