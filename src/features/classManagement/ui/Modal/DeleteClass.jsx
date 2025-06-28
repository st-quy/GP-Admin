import React from "react";
import { Form, Input, Button, Typography, Modal } from "antd";
import { yupSync } from "@shared/lib/utils";
import { CreateClassSchema } from "@features/classManagement/shema";
import { useDeleteClass } from "@features/classManagement/hooks";
import { WarningOutlined } from "@ant-design/icons";

const DeleteClassModal = ({ classId, isOpen, onClose }) => {
  const { mutate: deleteClass, isPending } = useDeleteClass();

  const handleFinish = () => {
    deleteClass(classId, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const [form] = Form.useForm();

  return (
    <Modal open={isOpen} footer={null} centered onCancel={onClose} width={600}>
      <div className="p-4">
        <Typography.Title
          level={4}
          className="font-bold mb-1 text-2xl flex items-center gap-3 "
        >
          <WarningOutlined className="text-red-500 bg-red-100 p-2 rounded-full" />
          <span className="">Are you sure you want to delete this class?</span>
        </Typography.Title>
        <p className="text-gray-600 mb-3 px-12 py-2">
          After you delete this class, you cannot view this class again.
        </p>

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
            onClick={handleFinish}
            loading={isPending}
            className="w-[100px] h-[50px] bg-red-500 hover:bg-red-700 rounded-full"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteClassModal;
