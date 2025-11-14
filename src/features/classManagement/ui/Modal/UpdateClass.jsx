import React from "react";
import { Form, Input, Button, Typography, Modal } from "antd";
import { yupSync } from "@shared/lib/utils";
import { CreateClassSchema } from "@features/classManagement/shema";
import { useUpdateClass, useGetAllClass } from "@features/classManagement/hooks";
import { useSelector } from "react-redux";

const UpdateClassModal = ({ data, isOpen, onClose }) => {
  const { mutate: updateClass, isPending } = useUpdateClass();
  const [form] = Form.useForm();
  // @ts-ignore
  const { userId, user } = useSelector((state) => state.auth);
  const { data: classList } = useGetAllClass(user?.role?.includes("admin") ? null : userId);

  const handleFinish = (values) => {
    form.setFields([{ name: "className", errors: [] }]);

    const trimmed = values.className ? values.className.trim() : "";
    if (!trimmed) {
      form.setFields([{ name: "className", errors: ["Class name is required"] }]);
      return;
    }

    const duplicated =
      Array.isArray(classList) &&
      classList.some(
        (c) =>
          String(c?.className || "").toLowerCase() === trimmed.toLowerCase() &&
          c?.ID !== data?.ID
      );
    if (duplicated) {
      form.setFields([{ name: "className", errors: ["Class name already exists"] }]);
      return;
    }

    updateClass(
      // @ts-ignore
      {
        classId: data?.ID,
        className: trimmed,
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (error) => {
          const hasResp = typeof error === "object" && error !== null && "response" in error;
          let statusCode;
          let messageText = "";
          if (hasResp) {
            // @ts-ignore
            statusCode = error.response?.status;
            // @ts-ignore
            messageText = typeof error.response?.data?.message === "string" ? error.response.data.message : "";
          }
          const isDuplicate =
            statusCode === 409 || /exist|duplicate|đã tồn tại/i.test(messageText || "");
          if (isDuplicate) {
            form.setFields([{ name: "className", errors: ["Class name already exists"] }]);
            return;
          }
        },
      }
    );
  };
  const initialValues = {
    className: data?.className || "",
  };

  return (
    <Modal open={isOpen} footer={null} centered onCancel={onClose} width={600}>
      <div className="p-4">
        <Typography.Title level={2} className="font-bold mb-1 text-2xl">
          Update class
        </Typography.Title>
        <p className="text-gray-600 mb-3">Modify class details.</p>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className=""
          initialValues={initialValues}
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
              Update
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default UpdateClassModal;
