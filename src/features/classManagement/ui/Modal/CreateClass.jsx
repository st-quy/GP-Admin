import React from "react";
import { Form, Input, Button, Typography, Modal } from "antd";
import { yupSync } from "@shared/lib/utils";
import { CreateClassSchema } from "@features/classManagement/shema";
import { useCreateClass } from "@features/classManagement/hooks";

const CreateClassModal = ({ isOpen, onClose }) => {
  const { mutate: createClass, isPending } = useCreateClass();

  const handleFinish = (values) => {
    const trimmedValues = {
      ...values,
      className: values.className.trim(),
    };
    createClass(trimmedValues, {
      onSuccess: () => {
        form.resetFields();
        onClose();
      },
    });
  };

  const [form] = Form.useForm();

  return (
    <Modal open={isOpen} footer={null} centered onCancel={onClose} width={600}>
      <div className="p-4">
        <Typography.Title level={2} className="font-bold mb-1 text-2xl">
          Create new class
        </Typography.Title>
        <p className="text-gray-600 mb-3">Set up and manage a new class.</p>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className=""
        >
          <Form.Item
            label={
              <div className="flex mb-1 font-medium">
                <span>Class Name</span>
                <span className="text-red-500 ml-1">*</span>
              </div>
            }
            name="className"
            required={false}
            rules={[yupSync(CreateClassSchema)]}
            className="w-full"
          >
            <Input size="large" placeholder="Enter class name" />
          </Form.Item>

          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <Button
              type="default"
              htmlType="button"
              onClick={() => {
                onClose();
                form.resetFields();
              }}
              className="w-[100px] h-[50px] rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              className="w-[100px] h-[50px] bg-primaryColor hover:bg-[#002A6B] rounded-full"
            >
              Create
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateClassModal;
