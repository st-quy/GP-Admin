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
  const [form] = Form.useForm();

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : user?.firstName || user?.lastName || "";

  const initialValues = {
    fullName,
    email: user?.email,
    teacherCode: user?.teacherCode,
    phone: user?.phone,
    dob: user?.dob ? dayjs(user.dob) : null,
    address: user?.address,
  };

  const handleFinish = (values) => {
    const nameParts = (values.fullName || "").trim().split(/\s+/);
    const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0] || "";
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

    updateProfile(
      {
        firstName,
        lastName,
        teacherCode: values.teacherCode,
        dob: values.dob,
        email: values.email,
        phone: values.phone,
        address: values.address,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      open={isOpen}
      footer={null}
      centered
      width={800}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      className="w-[90%] md:w-[80%] lg:w-[800px] max-w-[800px]"
    >
      <div className="p-4 md:p-6">
        <Typography.Title
          level={2}
          className="font-bold mb-1 text-2xl md:text-3xl"
        >
          Update profile
        </Typography.Title>
        <p className="text-gray-500 mb-6">
          Keep your profile up to date by editing your personal information.
        </p>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={initialValues}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1"
        >
          <Form.Item
            label={
              <span className="font-medium">
                Full name <span className="text-red-500">*</span>
              </span>
            }
            name="fullName"
            required={false}
            rules={[yupSync(UpdateProfileSchema)]}
          >
            <Input className="h-[46px] rounded-lg" />
          </Form.Item>

          <Form.Item
            label={
              <span className="font-medium">
                Email <span className="text-red-500">*</span>
              </span>
            }
            name="email"
            required={false}
            rules={[yupSync(UpdateProfileSchema)]}
          >
            <Input className="h-[46px] rounded-lg" disabled />
          </Form.Item>

          <Form.Item
            label={
              <span className="font-medium">
                Code <span className="text-red-500">*</span>
              </span>
            }
            name="teacherCode"
            required={false}
            rules={[yupSync(UpdateProfileSchema)]}
          >
            <Input className="h-[46px] rounded-lg" disabled />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium">Phone number</span>}
            name="phone"
            rules={[yupSync(UpdateProfileSchema)]}
          >
            <Input className="h-[46px] rounded-lg" />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium">BOD</span>}
            name="dob"
            rules={[yupSync(UpdateProfileSchema)]}
          >
            <DatePicker
              className="w-full h-[46px] rounded-lg"
              format="DD/MM/YYYY"
              disabledDate={(current) =>
                current && current.valueOf() > Date.now()
              }
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium">Address</span>}
            name="address"
          >
            <Input
              className="h-[46px] rounded-lg"
              placeholder="Enter your address"
            />
          </Form.Item>

          <div className="md:col-span-2 flex justify-end gap-3 mt-4">
            <Button
              type="default"
              htmlType="button"
              onClick={() => {
                onClose();
                form.resetFields();
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

export default ProfileUpdate;
