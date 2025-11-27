// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Typography,
  Space,
  Pagination,
  Card,
  Dropdown,
} from 'antd';
import {
  FileExcelOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import HeaderInfo from '@app/components/HeaderInfo';
import useConfirm from '@shared/hook/useConfirm';
import { useGetQuestions } from '@features/questions/hooks';
import { useGetPartsBySkillName } from '@features/parts/hooks';

const { Text } = Typography;
const { Option } = Select;

const QuestionBank = () => {
  const navigate = useNavigate();
  const { openConfirmModal, ModalComponent } = useConfirm();

  // --- Filter & pagination state ---
  const [selectedSkill, setSelectedSkill] = useState();
  const [selectedPart, setSelectedPart] = useState();
  const [searchText, setSearchText] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: listPart = [], isLoading: loadingParts } =
    useGetPartsBySkillName();

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSkill, selectedPart, searchText]);

  // Build params gửi BE
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      pageSize,
      search: searchText.trim() || undefined,
      skillName: selectedSkill ?? undefined,
      partId: selectedPart ?? undefined,
    }),
    [currentPage, pageSize, selectedSkill, selectedPart, searchText]
  );

  const { data, isLoading, isFetching } = useGetQuestions(queryParams);

  // data từ BE: { items, pagination }
  const items = data?.items ?? [];
  const pagination = data?.pagination ?? {
    page: currentPage,
    pageSize,
    total: 0,
  };

  const totalItems = pagination.total ?? 0;
  const startItem =
    totalItems === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.page * pagination.pageSize, totalItems);

  const handleDeleteQuestion = (record) => {
    openConfirmModal({
      title: 'Are you sure you want to delete this question?',
      message: 'After deleting this question it will no longer appear.',
      okText: 'Delete',
      okButtonColor: '#FF4D4F',
      onConfirm: () => {
        console.log(`Deleting question ID: ${record.ID}`);
      },
    });
  };

  const columns = [
    {
      title: 'Question Text',
      dataIndex: 'Content',
      key: 'Content',
      width: '30%',
      render: (text) => (
        <span className='font-semibold text-[#1F2937]'>{text}</span>
      ),
    },
    {
      title: 'Part',
      dataIndex: 'Part',
      key: 'Part',
      align: 'center',
      render: (_, record) => (
        <span className='text-gray-500'>
          {record?.Part?.Content || record?.Part?.SubContent || '-'}
        </span>
      ),
    },
    {
      title: 'Skills',
      dataIndex: 'Skill',
      key: 'Skill',
      align: 'center',
      render: (_, record) => (
        <span className='text-gray-500'>
          {record?.Skill?.Name || record?.Part?.Skill?.Name || '-'}
        </span>
      ),
    },
    {
      title: 'Creator',
      dataIndex: 'createdBy',
      key: 'creator',
      render: (_, record) => (
        <span className='text-gray-500'>
          {record?.creator
            ? record?.creator?.firstName + ' ' + record?.creator?.lastName
            : '-'}
        </span>
      ),
    },
    {
      title: 'Creation Day',
      dataIndex: 'createdAt',
      key: 'creationDay',
      render: (value) => (
        <span className='text-gray-500'>
          {value ? new Date(value).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      title: 'Update Date',
      dataIndex: 'updatedAt',
      key: 'updateDate',
      render: (value) => (
        <span className='text-gray-500'>
          {value ? new Date(value).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      title: 'Updater',
      dataIndex: 'updatedBy',
      key: 'updater',
      render: (_, record) => (
        <span className='text-gray-500'>
          {record?.updater
            ? record?.updater?.firstName + ' ' + record?.updater?.lastName
            : '-'}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size='middle'>
          <Button
            type='text'
            className='text-[#1890FF] hover:bg-blue-50 px-2'
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              // navigate(`${record.ID}`); // route detail/edit
            }}
          />
          <Button
            type='text'
            className='text-[#FF4D4F] hover:bg-red-50 px-2'
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteQuestion(record);
            }}
          />
        </Space>
      ),
    },
  ];

  // Style header table
  const tableComponents = {
    header: {
      cell: (props) => (
        <th
          {...props}
          className='bg-white text-[#111827] font-bold border-b border-gray-200 py-4'
        />
      ),
    },
  };

  const itemsMenu = [
    { label: 'Speaking', key: 'speaking' },
    { label: 'Reading', key: 'reading' },
    { label: 'Writing', key: 'writing' },
    { label: 'Listening', key: 'listening' },
    { label: 'Grammar And Vocabulary', key: 'grammar' },
  ];

  return (
    <>
      <ModalComponent />
      <HeaderInfo
        title='Question List'
        subtitle='View Question Information'
        // btnText='Add questions from Excel'
        // btnIcon={<FileExcelOutlined />}
        SubAction={
          <Dropdown
            menu={{
              items: itemsMenu,
              onClick: (e) => navigate(`create/${e.key}`),
            }}
          >
            <Button
              className='w-full p-5'
              icon={<DownOutlined />}
              iconPosition='end'
            >
              Create Question
            </Button>
          </Dropdown>
        }
      />
      <div className='p-4'>
        <Card className='shadow-sm rounded-xl '>
          {/* Filter Bar */}
          <div className='py-4 flex flex-col lg:flex-row justify-between gap-4'>
            <div className='flex flex-wrap gap-4'>
              <Select
                size='large'
                className='w-[160px]'
                value={selectedSkill}
                allowClear
                onChange={(val) => setSelectedSkill(val)}
                placeholder='All Skills'
              >
                <Option value='Listening'>Listening</Option>
                <Option value='Reading'>Reading</Option>
                <Option value='Writing'>Writing</Option>
                <Option value='Speaking'>Speaking</Option>
                <Option value='Grammar And Vocabulary'>
                  Grammar And Vocabulary
                </Option>
              </Select>

              {/* Tạm thời Part filter chưa map với BE (partId), nên chỉ là UI.
                  Sau này khi có list Part + ID, mình sẽ dùng dropdown dynamic và gửi partId lên BE. */}
              <Select
                size='large'
                className='w-[20rem]'
                value={selectedPart}
                options={
                  listPart?.map((part) => ({
                    value: part.ID,
                    label: part.Content,
                  })) ?? []
                }
                onChange={(val) => setSelectedPart(val)}
                allowClear
                placeholder='All Part'
              />
            </div>

            <div className='w-full lg:w-[300px]'>
              <Input
                size='large'
                placeholder='Search question...'
                prefix={<SearchOutlined className='text-gray-400' />}
                className='rounded-lg'
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>

          <Table
            rowKey='ID'
            columns={columns}
            dataSource={items}
            components={tableComponents}
            pagination={false}
            loading={isLoading || isFetching}
            rowClassName='hover:bg-gray-50 cursor-pointer'
            onRow={(record) => ({
              onClick: () => navigate(`${record.ID}`),
            })}
          />

          {/* Custom Pagination Footer */}
          <div className='flex flex-col md:flex-row justify-between items-center p-6 border-t border-gray-100'>
            <Text className='text-gray-500'>
              {totalItems === 0
                ? 'No data'
                : `Showing ${startItem}–${endItem} of ${totalItems}`}
            </Text>

            <div className='flex items-center gap-4 mt-4 md:mt-0'>
              <Pagination
                current={pagination.page}
                total={totalItems}
                pageSize={pagination.pageSize}
                showSizeChanger={false}
                onChange={(page) => setCurrentPage(page)}
                itemRender={(page, type, originalElement) => {
                  if (type === 'page') {
                    const isActive = pagination.page === page;

                    return React.cloneElement(originalElement, {
                      className: `flex items-center justify-center min-w-[32px] h-[32px] rounded border ${
                        isActive
                          ? 'bg-[#003087] text-white border-[#003087]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#003087] hover:text-[#003087]'
                      }`,
                    });
                  }
                  return originalElement;
                }}
              />

              <Select
                className='w-[120px]'
                value={String(pageSize)}
                onChange={(val) => {
                  const size = parseInt(val, 10);
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              >
                <Option value='10'>10 / pages</Option>
                <Option value='20'>20 / pages</Option>
                <Option value='50'>50 / pages</Option>
              </Select>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default QuestionBank;
