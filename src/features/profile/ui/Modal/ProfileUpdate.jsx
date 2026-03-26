import React from "react";
import { Form, Input, Button, Typography, Modal, DatePicker } from "antd";
import { useUpdateProfile } from "@features/auth/hooks/index";
import { UpdateProfileSchema } from "@features/profile/schema";
import { yupSync } from "@shared/lib/utils";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

const ProfileUpdate = ({ isOpen, onClose }) => {
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { user } = useSelector((state) => state.auth);

  const handleFinish = (values) => {
    updateProfile(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const [form] = Form.useForm();

  const initialValues = {
    firstName: user?.firstName,
    lastName: user?.lastName,
    dob: dayjs(user?.dob),
    teacherCode: user?.teacherCode,
    email: user?.email,
    phone: user?.phone,
    address: user?.address,
  };

  return (
    <Modal
      open={isOpen}
      footer={null}
      centered
      width="70%"
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      className="w-[90%] md:w-[80%] lg:w-[1242px] max-w-[1242px]"
    >
      <div className="p-4 md:p-6 lg:p-8">
        <Typography.Title
          level={2}
          className="font-bold mb-1 text-2xl md:text-3xl"
        >
          Update Profile
        </Typography.Title>
        <p className="text-gray-600 mb-3">
          Keep your profile up to date by editing your personal information.
        </p>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={initialValues}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
        >
          <Form.Item
            label={
              <div className="flex mb-1 font-medium">
                <span>First name</span>
                <span className="text-red-500 ml-1">*</span>
              </div>
            }
            name="firstName"
            required={false}
            rules={[yupSync(UpdateProfileSchema)]}
            className="w-full"
          >
            <Input className="h-[46px] w-full max-w-[458px] rounded-lg" />
          </Form.Item>
          <Form.Item
            label={
              <div className="flex mb-1 font-medium">
                <span>Last name</span>
                <span className="text-red-500 ml-1">*</span>
              </div>
            }
            name="lastName"
            required={false}
            rules={[yupSync(UpdateProfileSchema)]}
            className="w-full"
          >
            <Input className="h-[46px] w-full max-w-[458px] rounded-lg" />
          </Form.Item>
          <Form.Item
            label={
              <div className="flex font-medium">
                <span>Code</span>
                <span className="text-red-500 ml-1">*</span>
              </div>
            }
            name="teacherCode"
            required={false}
            rules={[yupSync(UpdateProfileSchema)]}
            className="w-full"
          >
            <Input
              className="h-[46px] w-full max-w-[458px] rounded-lg"
              disabled
            />
          </Form.Item>

          <Form.Item
            label={
              <div className="flex font-medium">
                <span>DoB</span>
              </div>
            }
            name="dob"
            required={false}
            rules={[yupSync(UpdateProfileSchema)]}
            className="w-full"
          >
            <DatePicker
              className="w-full h-[46px]"
              format={"DD-MM-YYYY"}
              disabledDate={(current) =>
                current && current.valueOf() > Date.now()
              }
            />
          </Form.Item>

          <Form.Item
            label={
              <div className="flex font-medium">
                <span>Email</span>
                <span className="text-red-500 ml-1">*</span>
              </div>
            }
            name="email"
            required={false}
            rules={[yupSync(UpdateProfileSchema)]}
            className="w-full md:max-w-[458px]"
          >
            <Input
              className="h-[46px] w-full max-w-[458px] rounded-lg"
              disabled
            />
          </Form.Item>

          <Form.Item
            label={
              <div className="flex font-medium">
                <span>Phone number</span>
              </div>
            }
            name="phone"
            rules={[yupSync(UpdateProfileSchema)]}
            className="w-full md:max-w-[458px]"
          >
            <Input className="h-[46px] w-full max-w-[458px] rounded-lg" />
          </Form.Item>

          <Form.Item
            label={
              <div className="flex font-medium">
                <span>Address</span>
              </div>
            }
            name="address"
            className="w-full md:max-w-[458px]"
          >
            <Input className="h-[46px] w-full max-w-[458px] rounded-lg" />
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

export default ProfileUpdate;
