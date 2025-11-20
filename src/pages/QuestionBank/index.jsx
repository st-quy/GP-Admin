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

const { Text } = Typography;
const { Option } = Select;

const QuestionBank = () => {
  const navigate = useNavigate();
  const { openConfirmModal, ModalComponent } = useConfirm();

  const dataSource = [
    {
      key: '1',
      questionText: 'Academic Listening Test Section 1...',
      part: 'Part 1',
      skills: 'Listening',
      topic: 'Session1',
      creator: 'John Smith',
      creationDay: '2024-01-15',
      updateDate: '2024-01-20',
      updater: 'Jane Doe',
    },
    {
      key: '2',
      questionText: 'Reading Comprehension Exercise...',
      part: 'Part 2',
      skills: 'Reading',
      topic: 'Session2',
      creator: 'Sarah Wilson',
      creationDay: '2024-01-14',
      updateDate: '2024-01-19',
      updater: 'Mike Johnson',
    },
    {
      key: '3',
      questionText: 'Grammar Focus: Present Perfect...',
      part: 'Part 1',
      skills: 'Grammar',
      topic: 'Session3',
      creator: 'Emily Davis',
      creationDay: '2024-01-13',
      updateDate: '2024-01-18',
      updater: 'Tom Brown',
    },
    {
      key: '4',
      questionText: 'Speaking Task: Describe a Picture...',
      part: 'Part 3',
      skills: 'Speaking',
      topic: 'Session4',
      creator: 'Alex Chen',
      creationDay: '2024-01-12',
      updateDate: '2024-01-17',
      updater: 'Lisa Wang',
    },
    {
      key: '5',
      questionText: 'Writing Exercise: Essay Structure...',
      part: 'Part 2',
      skills: 'Writing',
      topic: 'Session5',
      creator: 'David Miller',
      creationDay: '2024-01-11',
      updateDate: '2024-01-16',
      updater: 'Anna Taylor',
    },
    {
      key: '6',
      questionText: 'Listening Practice: Daily Conversations...',
      part: 'Part 2',
      skills: 'Listening',
      topic: 'Session6',
      creator: 'Chris Evans',
      creationDay: '2024-01-10',
      updateDate: '2024-01-15',
      updater: 'Maria Lopez',
    },
    {
      key: '7',
      questionText: 'Reading Passage: Climate Change Impact...',
      part: 'Part 3',
      skills: 'Reading',
      topic: 'Session7',
      creator: 'Sophia Turner',
      creationDay: '2024-01-09',
      updateDate: '2024-01-14',
      updater: 'Daniel White',
    },
    {
      key: '8',
      questionText: 'Grammar Exercise: Passive Voice...',
      part: 'Part 1',
      skills: 'Grammar',
      topic: 'Session8',
      creator: 'Mark Robinson',
      creationDay: '2024-01-08',
      updateDate: '2024-01-13',
      updater: 'Olivia Green',
    },
    {
      key: '9',
      questionText: 'Speaking Test: Describe a Person...',
      part: 'Part 2',
      skills: 'Speaking',
      topic: 'Session9',
      creator: 'Henry Carter',
      creationDay: '2024-01-07',
      updateDate: '2024-01-12',
      updater: 'Emma Clark',
    },
    {
      key: '10',
      questionText: 'Writing Task: Opinion Essay...',
      part: 'Part 3',
      skills: 'Writing',
      topic: 'Session10',
      creator: 'Natalie Cooper',
      creationDay: '2024-01-06',
      updateDate: '2024-01-11',
      updater: 'Lucas Scott',
    },
    {
      key: '11',
      questionText: 'Listening Quiz: Short Talks...',
      part: 'Part 1',
      skills: 'Listening',
      topic: 'Session11',
      creator: 'Brian Kelly',
      creationDay: '2024-01-05',
      updateDate: '2024-01-10',
      updater: 'Sophia Martinez',
    },
    {
      key: '12',
      questionText: 'Reading Challenge: Technology & Future...',
      part: 'Part 2',
      skills: 'Reading',
      topic: 'Session12',
      creator: 'Victoria Reed',
      creationDay: '2024-01-04',
      updateDate: '2024-01-09',
      updater: 'Kevin Lee',
    },
    {
      key: '13',
      questionText: 'Grammar Drill: Modal Verbs...',
      part: 'Part 3',
      skills: 'Grammar',
      topic: 'Session13',
      creator: 'Andrew Price',
      creationDay: '2024-01-03',
      updateDate: '2024-01-08',
      updater: 'Diana Foster',
    },
    {
      key: '14',
      questionText: 'Speaking Practice: Storytelling...',
      part: 'Part 1',
      skills: 'Speaking',
      topic: 'Session14',
      creator: 'Isabella Diaz',
      creationDay: '2024-01-02',
      updateDate: '2024-01-07',
      updater: 'George Hudson',
    },
    {
      key: '15',
      questionText: 'Writing Workshop: Reports & Summaries...',
      part: 'Part 2',
      skills: 'Writing',
      topic: 'Session15',
      creator: 'Samuel Adams',
      creationDay: '2024-01-01',
      updateDate: '2024-01-06',
      updater: 'Grace Ward',
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleDeleteQuestion = (record) => {
    openConfirmModal({
      title: 'Are you sure you want to delete this question?',
      message: 'After deleting this question it will no longer appear.',
      okText: 'Delete',
      okButtonColor: '#FF4D4F',
      onConfirm: () => {
        console.log(`Deleting question with key: ${record.key}`);
      },
    });
  };

  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [selectedSkill, setSelectedSkill] = useState('All Skills');
  const [selectedPart, setSelectedPart] = useState('All Part');
  const [searchText, setSearchText] = useState('');

  // Reset về page 1 khi filter/search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTopic, selectedSkill, selectedPart, searchText]);

  // --- Filter + Search ---
  const filteredData = useMemo(() => {
    return dataSource.filter((item) => {
      const matchSkill =
        selectedSkill === 'All Skills' || item.skills === selectedSkill;

      const matchPart =
        selectedPart === 'All Part' || item.part === selectedPart;

      const search = searchText.trim().toLowerCase();
      const matchSearch =
        !search ||
        item.questionText.toLowerCase().includes(search) ||
        item.creator.toLowerCase().includes(search);

      return matchSkill && matchPart && matchSearch;
    });
  }, [dataSource, selectedTopic, selectedSkill, selectedPart, searchText]);

  // --- Phân trang thủ công ---
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const totalItems = filteredData.length;
  const startItem = totalItems === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(startIndex + pageSize, totalItems);

  // 2. Columns
  const columns = [
    {
      title: 'Question Text',
      dataIndex: 'questionText',
      key: 'questionText',
      width: '30%',
      render: (text) => (
        <span className='font-semibold text-[#1F2937]'>{text}</span>
      ),
    },
    {
      title: 'Part',
      dataIndex: 'part',
      key: 'part',
      align: 'center',
      render: (text) => <span className='text-gray-500'>{text}</span>,
    },
    {
      title: 'Skills',
      dataIndex: 'skills',
      key: 'skills',
      align: 'center',
      render: (text) => <span className='text-gray-500'>{text}</span>,
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      key: 'creator',
      render: (text) => <span className='text-gray-500'>{text}</span>,
    },
    {
      title: 'Creation Day',
      dataIndex: 'creationDay',
      key: 'creationDay',
      render: (text) => <span className='text-gray-500'>{text}</span>,
    },
    {
      title: 'Update Date',
      dataIndex: 'updateDate',
      key: 'updateDate',
      render: (text) => <span className='text-gray-500'>{text}</span>,
    },
    {
      title: 'Updater',
      dataIndex: 'updater',
      key: 'updater',
      render: (text) => <span className='text-gray-500'>{text}</span>,
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
          />
          <Button
            type='text'
            className='text-[#FF4D4F] hover:bg-red-50 px-2'
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteQuestion(record)}
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

  const items = [
    { label: 'Speaking', key: 'speaking' },
    { label: 'Reading', key: 'reading' },
    { label: 'Writing', key: 'writing' },
    { label: 'Listening', key: 'listening' },
    { label: 'Grammar', key: 'grammar' },
  ];

  return (
    <>
      <ModalComponent />
      <HeaderInfo
        title='Question List'
        subtitle='View Question Information'
        btnText='Add questions from Excel'
        btnIcon={<FileExcelOutlined />}
        SubAction={
          <Dropdown
            menu={{ items, onClick: (e) => navigate(`create/${e.key}`) }}
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
                onChange={(val) => setSelectedSkill(val)}
              >
                <Option value='All Skills'>All Skills</Option>
                <Option value='Listening'>Listening</Option>
                <Option value='Reading'>Reading</Option>
                <Option value='Writing'>Writing</Option>
                <Option value='Speaking'>Speaking</Option>
                <Option value='Grammar'>Grammar</Option>
              </Select>

              <Select
                size='large'
                className='w-[160px]'
                value={selectedPart}
                onChange={(val) => setSelectedPart(val)}
              >
                <Option value='All Part'>All Part</Option>
                <Option value='Part 1'>Part 1</Option>
                <Option value='Part 2'>Part 2</Option>
                <Option value='Part 3'>Part 3</Option>
              </Select>
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
            columns={columns}
            dataSource={paginatedData}
            components={tableComponents}
            pagination={false}
            rowClassName='hover:bg-gray-50 cursor-pointer'
            onRow={(record) => ({
              onClick: () => navigate(`${record.key}`),
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
                current={currentPage}
                total={totalItems}
                pageSize={pageSize}
                showSizeChanger={false}
                onChange={(page) => setCurrentPage(page)}
                itemRender={(page, type, originalElement) => {
                  if (type === 'page') {
                    const isActive = currentPage === page;

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
                  setPageSize(parseInt(val));
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
