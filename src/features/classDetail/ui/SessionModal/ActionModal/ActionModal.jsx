// @ts-nocheck
import {
  Modal,
  Button,
  DatePicker,
  Select,
  Input,
  message,
  Form,
  Spin,
} from "antd";
import React, { useState } from "react";
import { yupSync } from "@shared/lib/utils";
import { sessionSchema } from "@features/classDetail/validate";
import {
  useCreateSession,
  useGenerateSessionKeyMutation,
  useGetTopics,
  useUpdateSession,
} from "@features/classDetail/hooks/useClassDetail";
import dayjs from "dayjs";
import {
  EditOutlined,
  LoadingOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;

const ActionModal = ({
  initialData = null,
  classId = null,
  isOpen,
  onClose,
}) => {
  const [form] = Form.useForm();

  const isEdit = !!initialData;
  const { data: topics, isLoading: isLoadingTopics } = useGetTopics();
  const { mutateAsync: generateKey, isPending: isGenerating } =
    useGenerateSessionKeyMutation();
  const { mutate: sessionAction, isPending: isLoading } = isEdit
    ? useUpdateSession()
    : useCreateSession();

  const modalTitle = isEdit ? "Update Session" : "Create Session";
  const actionLabel = isEdit ? "Update session" : "Create session";

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  // Add disabledDate function to disable past dates
  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const handleGenerateSessionKey = async () => {
    try {
      const data = await generateKey();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      form.setFieldsValue({ sessionKey: data.key });
    } catch (error) {
      message.error("Failed to generate session key");
    }
  };

  const onAction = async () => {
    try {
      const values = await form.validateFields();
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
          handleCancel();
        },
      });
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Please fill in all fields correctly."
      );
    }
  };

  return (
    <>
      <Modal
        open={isOpen}
        closable={false}
        confirmLoading={isLoading}
        footer={null}
        width="50%"
      >
        <div className="px-6">
          <h4 className="font-bold text-[28px] lg:text-[30px]">{modalTitle}</h4>
          <p className="mb-6 font-medium text-primaryTextColor text-[16px] lg:text-[18px]">
            {isEdit
              ? "Modify and extend the current session."
              : "Set up a new session quickly and easily."}
          </p>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              sessionName: initialData?.sessionName || "",
              sessionKey: initialData?.sessionKey || "",
              examSet: initialData?.examSet || "",
              dateRange:
                initialData?.startTime && initialData?.endTime
                  ? [dayjs(initialData.startTime), dayjs(initialData.endTime)]
                  : undefined,
            }}
          >
            <Form.Item
              name="sessionName"
              label="Session Name"
              rules={[yupSync(sessionSchema)]}
              required
            >
              <Input placeholder="Session Name" className="!h-[46px]" />
            </Form.Item>

            <Form.Item
              name="sessionKey"
              label="Session Key"
              required
              rules={[yupSync(sessionSchema)]}
            >
              <Input
                placeholder="Session Key"
                className="!h-[46px]"
                required
                suffix={
                  <div onClick={handleGenerateSessionKey}>
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
              name="examSet"
              label="Exam Set"
              required
              rules={[yupSync(sessionSchema)]}
            >
              <Select
                placeholder="Select Exam Set"
                loading={isLoadingTopics}
                className="!h-[46px]"
                options={
                  topics?.map((topic) => ({
                    label: topic.Name,
                    value: topic.ID,
                  })) || []
                }
              />
            </Form.Item>

            <Form.Item
              name="dateRange"
              label="Date Range"
              required
              rules={[yupSync(sessionSchema)]}
            >
              <RangePicker
                className="!w-full !h-[46px] py-[12px] pr-[16px] ps-[20px]"
                showTime
                format="DD-MM-YYYY HH:mm:ss"
                disabledDate={disabledDate}
                showNow={false}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[0].isBefore(dayjs(), "day")) {
                    message.warning("Start date cannot be in the past");
                    form.setFieldsValue({ dateRange: null });
                  }
                }}
              />
            </Form.Item>
          </Form>
        </div>

        <div className="flex justify-end gap-4 mt-6 px-6 pb-4">
          <Button
            onClick={handleCancel}
            className="h-[52px] w-[124px] rounded-full border border-primaryColor text-primaryColor"
          >
            Cancel
          </Button>
          <Button
            onClick={onAction}
            loading={isLoading}
            className="h-[52px] w-[124px] rounded-full bg-primaryColor text-white"
          >
            {actionLabel}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ActionModal;
