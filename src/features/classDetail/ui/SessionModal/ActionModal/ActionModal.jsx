import {
  Modal,
  Button,
  DatePicker,
  Select,
  Input,
  message,
  Form,
  Spin,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { yupSync } from '@shared/lib/utils';
import { sessionSchema } from '@features/classDetail/validate';
import {
  useCreateSession,
  useGenerateSessionKeyMutation,
  useGetTopics,
  useUpdateSession,
} from '@features/classDetail/hooks/useClassDetail';
import dayjs from 'dayjs';
import {
  EditOutlined,
  LoadingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageSizes } from 'pdf-lib';

const { RangePicker } = DatePicker;

const ActionModal = ({
  initialData = null,
  classId = null,
  isOpen,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [topicList, setTopicList] = useState([]);

  const isEdit = !!initialData;
  const { data, isLoading: isLoadingTopics } = useGetTopics({
    page,
    pageSize,
    searchName: search,
    status: 'approved',
  });

  const topics = data?.data || [];
  const totalItems = data?.totalItems || 0;

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const loadMore = () => {
    if (topicList.length < totalItems) {
      setPage((prev) => prev + 1);
    }
  };

  const { mutateAsync: generateKey, isPending: isGenerating } =
    useGenerateSessionKeyMutation();
  const { mutate: sessionAction, isPending: isLoading } = isEdit
    ? useUpdateSession()
    : useCreateSession();

  const modalTitle = isEdit ? 'Update Session' : 'Create Session';
  const actionLabel = isEdit ? 'Update session' : 'Create session';

  // BUG_CM015: Reset form when initialData or isOpen changes to ensure fresh data
  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        form.setFieldsValue({
          sessionName: initialData.sessionName,
          sessionKey: initialData.sessionKey,
          examSet: initialData.examSet,
          dateRange: initialData.startTime && initialData.endTime
            ? [dayjs(initialData.startTime), dayjs(initialData.endTime)]
            : undefined,
        });
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, initialData, isEdit, form]);

  const handleCancel = () => {
    // BUG_CM014: Unsaved changes warning
    const isDirty = form.isFieldsTouched();
    if (isDirty) {
      Modal.confirm({
        title: 'Unsaved Changes',
        content: 'You have unsaved changes. Are you sure you want to discard this draft?',
        okText: 'Discard',
        cancelText: 'Continue Editing',
        okButtonProps: { danger: true },
        onOk: () => {
          onClose();
          form.resetFields();
        },
      });
    } else {
      onClose();
      form.resetFields();
    }
  };
  const handlePopupScroll = (e) => {
    const target = e.target; // chính xác: lớp scroll của dropdown

    const bottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 5;

    if (bottom && !isLoadingTopics && topicList.length < totalItems) {
      loadMore();
    }
  };

  // Add disabledDate function to disable past dates
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  const handleGenerateSessionKey = async () => {
    try {
      const data = await generateKey();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      form.setFieldsValue({ sessionKey: data.key });
    } catch (error) {
      message.error('Failed to generate session key');
    }
  };

  const onAction = async () => {
    try {
      const values = await form.validateFields();
      
      Modal.confirm({
        title: `Confirm ${isEdit ? 'Update' : 'Creation'}`,
        content: `Are you sure you want to ${isEdit ? 'update' : 'create'} this session with these details?`,
        okText: isEdit ? 'Update' : 'Create',
        cancelText: 'Cancel',
        onOk: () => {
          const sessionData = {
            sessionId: initialData?.ID || null,
            sessionName: values.sessionName?.trim(),
            sessionKey: values.sessionKey?.trim(),
            startTime: values.dateRange?.[0]?.toISOString() || null,
            endTime: values.dateRange?.[1]?.toISOString() || null,
            examSet: values.examSet,
            ClassID: classId,
          };

          sessionAction(sessionData, {
            onSuccess: (data) => {
              const msg = data?.data?.message || `${actionLabel} success!`;
              message.success(msg);
              // BUG FIX: Prevent handleCancel confirmation by resetting manually
              onClose();
              form.resetFields();
            },
          });
        }
      });
    } catch (error) {
      message.error(
        error?.response?.data?.message || 'Please fill in all fields correctly.'
      );
    }
  };

  useEffect(() => {
    if (!data?.data) return;

    if (page === 1) {
      setTopicList(data.data);
    } else {
      setTopicList((prev) => [...prev, ...data.data]);
    }
  }, [data, page]);

  return (
    <>
      <Modal
        open={isOpen}
        closable={false}
        confirmLoading={isLoading}
        footer={null}
        width='50%'
      >
        <div className='px-6'>
          <h4 className='font-bold text-[28px] lg:text-[30px]'>{modalTitle}</h4>
          <p className='mb-6 font-medium text-primaryTextColor text-[16px] lg:text-[18px]'>
            {isEdit
              ? 'Modify and extend the current session.'
              : 'Set up a new session quickly and easily.'}
          </p>

          <Form
            form={form}
            layout='vertical'
          >
            <Form.Item
              name='sessionName'
              label='Session Name'
              rules={[yupSync(sessionSchema)]}
              normalize={(value) => {
                if (!value) return value;
                let cleanValue = value;

                // 1. Proactively handle special characters/emojis
                if (/[^a-zA-Z0-9\s]/.test(cleanValue)) {
                  message.warning('Special characters and emojis are not allowed in Session Name.');
                  cleanValue = cleanValue.replace(/[^a-zA-Z0-9\s]/g, '');
                }

                // 2. Proactively handle multiple spaces
                if (/\s{2,}/.test(cleanValue)) {
                  message.info('Multiple spaces are not allowed; collapsed to a single space.');
                  cleanValue = cleanValue.replace(/\s{2,}/g, ' ');
                }

                // 3. Block leading spaces
                return cleanValue.replace(/^\s+/, '');
              }}
              required
            >
              <Input placeholder='Session Name' className='!h-[46px]' maxLength={100} />
            </Form.Item>

            <Form.Item
              name='sessionKey'
              label='Session Key'
              required
              rules={[yupSync(sessionSchema)]}
              normalize={(value) => value?.trim().toUpperCase()}
            >
              <Input
                placeholder='Session Key'
                className='!h-[46px]'
                maxLength={20}
                required
                suffix={
                  <div className="cursor-pointer" onClick={handleGenerateSessionKey}>
                    {isGenerating ? (
                      <Spin indicator={<LoadingOutlined spin />} />
                    ) : (
                      <ReloadOutlined />
                    )}
                  </div>
                }
              />
            </Form.Item>

            <Form.Item
              name='examSet'
              label='Exam Set'
              required
              rules={[yupSync(sessionSchema)]}
            >
              <Select
                showSearch
                placeholder='Select Exam Set'
                filterOption={false}
                onSearch={handleSearch}
                loading={isLoadingTopics}
                onPopupScroll={handlePopupScroll}
              >
                {topicList.map((t) => (
                  <Select.Option key={t.ID} value={t.ID}>
                    {t.Name}
                  </Select.Option>
                ))}

                {isLoadingTopics && (
                  <Select.Option disabled key='loading'>
                    <Spin size='small' />
                  </Select.Option>
                )}
              </Select>
            </Form.Item>

            <Form.Item
              name='dateRange'
              label='Date Range'
              required
              rules={[yupSync(sessionSchema)]}
            >
              <RangePicker
                className='!w-full !h-[46px] py-[12px] pr-[16px] ps-[20px]'
                showTime
                format='DD-MM-YYYY HH:mm:ss'
                disabledDate={disabledDate}
                showNow={false}
              />
            </Form.Item>
          </Form>
        </div>

        <div className='flex justify-end gap-4 mt-6 px-6 pb-4'>
          <Button
            onClick={handleCancel}
            className='h-[52px] w-[124px] rounded-full border border-primaryColor text-primaryColor'
          >
            Cancel
          </Button>
          <Button
            onClick={onAction}
            loading={isLoading}
            className='h-[52px] w-[124px] rounded-full bg-primaryColor text-white'
          >
            {actionLabel}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ActionModal;
