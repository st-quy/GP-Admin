import React, { useEffect, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  useGetSections,
  useDeleteSection,
} from '@features/questions/hooks';
import CreateReading from './components/CreateSkills/CreateReading';
import CreateListening from './components/CreateSkills/CreateListening';
import CreateGrammarVocab from './components/CreateSkills/CreateGrammarVocab';
import CreateWriting from './components/CreateSkills/CreateWriting';
import CreateSpeaking from './components/CreateSkills/CreateSpeaking';
import { Button, Input, Table, Tooltip, Card, Tabs, message, Modal } from 'antd';
import UpdateReading from './components/UpdateSkills/UpdateReading';
import UpdateListening from './components/UpdateSkills/UpdateListening';
import UpdateGrammarVocab from './components/UpdateSkills/UpdateGrammarVocab';
import UpdateWriting from './components/UpdateSkills/UpdateWriting';
import UpdateSpeaking from './components/UpdateSkills/UpdateSpeaking';
import useConfirm from '@shared/hook/useConfirm';

const QuestionBank = () => {
  const [activeTab, setActiveTab] = useState('SPEAKING');
  const [searchText, setSearchText] = useState('');
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  
  const { data: listPart, isLoading: loadingSections } = useGetSections(
    activeTab,
    searchText
  );

  const { mutate: deleteSection } = useDeleteSection();
  const { openConfirmModal, ModalComponent } = useConfirm();

  const handleEdit = (record) => (e) => {
    e.stopPropagation();
    setEditingSection(record);
  };

  const columns = [
    {
      title: 'Section Name',
      dataIndex: 'Name',
      key: 'Name',
      render: (text) => <span className='font-medium'>{text}</span>,
    },
    {
      title: 'Number of Parts',
      dataIndex: 'Parts',
      key: 'Parts',
      align: 'center',
      render: (parts) => <span>{parts?.length || 0}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <div className='flex gap-2 justify-center'>
          <Tooltip title="Edit Section">
            <Button
              type='text'
              className='text-primaryColor hover:bg-blue-50 px-2'
              icon={<EditOutlined />}
              onClick={handleEdit(record)}
            />
          </Tooltip>
          {record.Topics.length === 0 && (
            <Tooltip title="Delete Section">
              <Button
                type='text'
                className='text-red-500 hover:bg-red-50 px-2'
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  openConfirmModal({
                    title: 'Confirm delete',
                    message: 'Do you really want to delete this section?',
                    okText: 'Delete',
                    okButtonColor: '#FF4D4F',
                    onConfirm: () => deleteSection(record.ID),
                  });
                }}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const renderCreateModal = () => {
    switch (activeTab) {
      case 'READING':
        return (
          <CreateReading
            isOpen={openCreateModal}
            onClose={() => setOpenCreateModal(false)}
          />
        );
      case 'LISTENING':
        return (
          <CreateListening
            isOpen={openCreateModal}
            onClose={() => setOpenCreateModal(false)}
          />
        );
      case 'GRAMMAR AND VOCABULARY':
        return (
          <CreateGrammarVocab
            isOpen={openCreateModal}
            onClose={() => setOpenCreateModal(false)}
          />
        );
      case 'WRITING':
        return (
          <CreateWriting
            isOpen={openCreateModal}
            onClose={() => setOpenCreateModal(false)}
          />
        );
      case 'SPEAKING':
        return (
          <CreateSpeaking
            isOpen={openCreateModal}
            onClose={() => setOpenCreateModal(false)}
          />
        );
      default:
        return null;
    }
  };

  const renderUpdateModal = () => {
    if (!editingSection) return null;
    switch (activeTab) {
      case 'READING':
        return (
          <UpdateReading
            isOpen={!!editingSection}
            onClose={() => setEditingSection(null)}
            data={editingSection}
          />
        );
      case 'LISTENING':
        return (
          <UpdateListening
            isOpen={!!editingSection}
            onClose={() => setEditingSection(null)}
            data={editingSection}
          />
        );
      case 'GRAMMAR AND VOCABULARY':
        return (
          <UpdateGrammarVocab
            isOpen={!!editingSection}
            onClose={() => setEditingSection(null)}
            data={editingSection}
          />
        );
      case 'WRITING':
        return (
          <UpdateWriting
            isOpen={!!editingSection}
            onClose={() => setEditingSection(null)}
            data={editingSection}
          />
        );
      case 'SPEAKING':
        return (
          <UpdateSpeaking
            isOpen={!!editingSection}
            onClose={() => setEditingSection(null)}
            data={editingSection}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className='p-6 min-h-screen bg-gray-50'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>Question Bank</h1>
            <p className='text-gray-500'>Manage exam sections and questions by skill.</p>
          </div>
          <Button
            type='primary'
            size='large'
            icon={<PlusOutlined />}
            className='bg-primaryColor h-12 px-6'
            onClick={() => setOpenCreateModal(true)}
          >
            Create Section
          </Button>
        </div>

        <Card className='shadow-sm rounded-xl'>
          {/* ==================== SKILL TABS ==================== */}
          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              setSearchText('');
            }}
            centered
            size='large'
            items={[
              { key: 'SPEAKING', label: 'Speaking' },
              { key: 'LISTENING', label: 'Listening' },
              { key: 'READING', label: 'Reading' },
              { key: 'WRITING', label: 'Writing' },
              { key: 'GRAMMAR AND VOCABULARY', label: 'Grammar & Vocabulary' },
            ]}
          />

          {/* ==================== SEARCH BAR ==================== */}
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center py-4'>
            <Input
              maxLength={255}
              size='large'
              placeholder='Search section name...'
              prefix={<SearchOutlined className='text-gray-400' />}
              className='w-full sm:w-[260px] lg:w-[320px]'
              value={searchText}
              onChange={(e) => {
                const sanitized = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '')
                setSearchText(sanitized)
              }}
            />
          </div>

          {/* ==================== TABLE ==================== */}
          <div className='w-full'>
            <Table
              rowKey='ID'
              columns={columns}
              dataSource={listPart}
              loading={loadingSections}
              pagination={false}
              rowClassName='hover:bg-gray-50 cursor-pointer'
              scroll={{ y: 'calc(100vh - 500px)' }}
            />
          </div>
        </Card>

        {renderCreateModal()}
        {renderUpdateModal()}
        <ModalComponent />
      </div>
    </>
  );
};

export default QuestionBank;
