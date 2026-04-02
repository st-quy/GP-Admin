import React, { useEffect } from "react";
import { Form, Input, Button, Card, Typography, Spin, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { useChangePassword } from "@features/auth/hooks/index";
import { ChangePasswordSchema } from "@features/profile/schema";
import { yupSync } from "@shared/lib/utils";

const ChangePassword = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
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
      onCancel={onClose}
      className="w-[90%] md:w-[500px] lg:w-[500px]"
      width={500}
    >
      <div className="h-full">
        <Typography.Title level={2} className="font-bold mb-1 text-[30px] mt-4">
          Change Password
        </Typography.Title>
        <p className="text-gray-600 mb-3 text-[16px]">
          Secure your account with a new password.
        </p>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className="flex flex-col items-stretch h-full"
        >
          <div className="space-y-4">
            <Form.Item
              label={
                <div className="flex mb-1 font-medium">
                  <span>Current password</span>
                  <span className="text-red-500 ml-1">*</span>
                </div>
              }
              name="currentPassword"
              required={false}
              rules={[yupSync(ChangePasswordSchema)]}
              className="w-full md:max-w-[458px]"
            >
              <Input.Password
                className="h-[46px] w-full max-w-[458px] rounded-lg"
                placeholder="Current password"
              />
            </Form.Item>
            <Form.Item
              label={
                <div className="flex mb-1 font-medium">
                  <span>New password</span>
                  <span className="text-red-500 ml-1">*</span>
                </div>
              }
              name="newPassword"
              required={false}
              rules={[yupSync(ChangePasswordSchema)]}
              className="w-full md:max-w-[458px]"
            >
              <Input.Password
                className="h-[46px] w-full max-w-[458px] rounded-lg"
                placeholder="New password"
              />
            </Form.Item>
            <Form.Item
              label={
                <div className="flex mb-1 font-medium">
                  <span>Confirm new password</span>
                  <span className="text-red-500 ml-1">*</span>
                </div>
              }
              name="confirmNewPassword"
              required={false}
              dependencies={["newPassword"]}
              className="w-full md:max-w-[458px]"
              rules={[
                { required: true, message: "Please confirm your new password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password
                className="h-[46px] w-full max-w-[458px] rounded-lg"
                placeholder="Confirm new password"
              />
            </Form.Item>
          </div>

          <div className="w-full flex justify-end gap-3 mt-6 mb-4">
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

export default ChangePassword;
