import React, { useEffect } from "react";
import { Form, Input, Button, Typography, Modal } from "antd";
import { useChangePassword } from "@features/auth/hooks/index";
import { ChangePasswordSchema } from "@features/profile/schema";
import { yupSync } from "@shared/lib/utils";

const ChangePassword = ({ isOpen, onClose }) => {
  const { mutate: changePassword, isPending, isSuccess } = useChangePassword();
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    changePassword(
      {
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
    }
  }, [isSuccess]);

  return (
    <Modal
      open={isOpen}
      footer={null}
      centered
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      width={500}
    >
      <div className="p-2 md:p-4">
        <Typography.Title level={2} className="font-bold mb-1 text-[28px] mt-2">
          Change Password
        </Typography.Title>
        <p className="text-gray-500 mb-6 text-[15px]">
          Secure your account with a new password.
        </p>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className="flex flex-col"
        >
          <Form.Item
            label={
              <span className="font-medium">
                Current password <span className="text-red-500">*</span>
              </span>
            }
            name="currentPassword"
            required={false}
            rules={[yupSync(ChangePasswordSchema)]}
          >
            <Input.Password
              className="h-[46px] rounded-lg"
              placeholder="********"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="font-medium">
                New password <span className="text-red-500">*</span>
              </span>
            }
            name="newPassword"
            required={false}
            rules={[yupSync(ChangePasswordSchema)]}
          >
            <Input.Password
              className="h-[46px] rounded-lg"
              placeholder="********"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="font-medium">
                Confirm new password <span className="text-red-500">*</span>
              </span>
            }
            name="confirmNewPassword"
            required={false}
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              className="h-[46px] rounded-lg"
              placeholder="********"
            />
          </Form.Item>

          <div className="flex justify-center gap-3 mt-4 mb-2">
            <Button
              type="default"
              htmlType="button"
              onClick={() => {
                form.resetFields();
                onClose();
              }}
              className="w-[100px] h-[44px] rounded-full border-primaryColor text-primaryColor"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              className="w-[100px] h-[44px] bg-primaryColor hover:bg-[#002A6B] rounded-full"
            >
              Update
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ChangePassword;
