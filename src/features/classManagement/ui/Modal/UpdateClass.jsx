import React from "react";
import { Form, Input, Button, Typography, Modal } from "antd";
import { yupSync } from "@shared/lib/utils";
import { CreateClassSchema } from "@features/classManagement/shema";
import { useUpdateClass } from "@features/classManagement/hooks";

const UpdateClassModal = ({ data, isOpen, onClose, existingNames = [] }) => {
  const { mutate: updateClass, isPending } = useUpdateClass();

  const handleFinish = (values) => {
    updateClass(
      {
        classId: data?.ID,
        className: values.className,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const [form] = Form.useForm();
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
          onValuesChange={() => {}}
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
            rules={[
              yupSync(CreateClassSchema),
              () => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  const normalized = value.trim().toLowerCase();
                  // Allow keeping the same name, but block duplicates with other classes
                  const current = (data?.className || "").trim().toLowerCase();
                  if (normalized !== current && existingNames.includes(normalized)) {
                    return Promise.reject(new Error("Class name already exists"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
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
