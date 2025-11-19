import { Modal, Button, Input, message, Form, Switch } from "antd";
import React, { useState } from "react";
import * as Yup from "yup";
import {
  useCreateTeacher,
  useUpdateTeacher,
} from "@features/teacher/hook/useTeacherQuery";
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";

const createValidator = (fieldName, schema) => ({
  validator: async (_, value) => {
    if (fieldName === 'password' && (!value || value.trim() === '')) {
      return Promise.resolve();
    }
    
    try {
      await schema.validateSyncAt(fieldName, { [fieldName]: value });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error.message);
    }
  }
});

const baseSchema = Yup.object().shape({
  firstName: Yup.string()
    .transform((value) => (value && typeof value === 'string' && value.trim() ? value.trim() : undefined))
    .required("First name is required"),
  lastName: Yup.string()
    .transform((value) => (value && typeof value === 'string' && value.trim() ? value.trim() : undefined))
    .required("Last name is required"),
  email: Yup.string()
    .transform((value) => (value && typeof value === 'string' && value.trim() ? value.trim() : undefined))
    .email("Invalid email")
    .matches(
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      "Invalid email format"
    )
    .required("Email is required"),
  teacherCode: Yup.string()
    .transform((value) => (value && typeof value === 'string' && value.trim() ? value.trim() : undefined))
    .required("Teacher Code is required"),
});

const accountCreateSchema = baseSchema.concat(
  Yup.object().shape({
    password: Yup.string()
      .transform((value) => (typeof value === "string" && value.trim() === "" ? undefined : value))
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  })
);

const passwordCreateSchema = Yup.object().shape({
  password: Yup.string()
    .transform((value) => (typeof value === "string" && value.trim() === "" ? undefined : value))
    .notRequired()
    .min(6, "Password must be at least 6 characters"),
});

const accountUpdateSchema = baseSchema.concat(
  Yup.object().shape({
    password: Yup.string()
      .transform((value) => (typeof value === "string" && value.trim() === "" ? undefined : value))
      .min(6, "Password must be at least 6 characters")
      .notRequired(),
  })
);

const TeacherActionModal = ({ initialData = null }) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const isEdit = initialData !== null;
  // @ts-ignore
  const { mutate: teacherAction, isPending: isOnAction } = isEdit
    ? useUpdateTeacher()
    : useCreateTeacher();

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
  };

  // @ts-ignore
  const onAction = async (values) => {
    try {
      const pwd = form.getFieldValue("password");
      
      const data = {
        ID: isEdit ? initialData?.ID : undefined,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        teacherCode: values.teacherCode,
        password: !isEdit ? pwd || passwordValue || `Greenwich@123` : undefined,
        roleIDs: ["teacher"],
        status: values.status,
        phone: values.phone ? values.phone : undefined,
      };
      // @ts-ignore
      teacherAction(data, {
        onSuccess: (data) => {
          message.success(
            data.data.message || `${isEdit ? "Update" : "Create"} success!`
          );
          handleCancel();
        },
        onError: (error) => {
          // @ts-ignore
          const apiMsg = error?.response?.data?.message;
          // @ts-ignore
          const apiErrors = error?.response?.data?.errors;
          if (Array.isArray(apiErrors) && apiErrors.length > 0) {
            message.error(apiErrors[0]);
          } else if (apiMsg) {
            message.error(apiMsg);
          } else {
            message.error(
              `Failed to ${isEdit ? "update" : "create"} account.`
            );
          }
        },
      });
    } catch (error) {
      if (error?.errorFields?.length > 0) {
         return;
      }
      
      const apiMsg = error?.response?.data?.message;
      const apiErrors = error?.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        message.error(apiErrors[0]);
      } else if (apiMsg) {
        message.error(apiMsg);
      } else {
        message.error("Failed to send request account. Please try again.");
      }
    }
  };

  return (
    <>
      {isEdit ? (
        <EditOutlined
          onClick={showModal}
          className="text-primaryColor text-[20px]"
        />
      ) : (
        <Button
          icon={<PlusCircleOutlined />}
          onClick={showModal}
          className="bg-primaryColor text-white py-6 rounded-full px-4 text-base border-none"
        >
          Create new account
        </Button>
      )}
      <Modal
        open={open}
        okText={isEdit ? "Update" : "Create"}
        closable={false}
        confirmLoading={isOnAction}
        width={{
          xs: "90%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}
        footer={null}
      >
        <div className="px-6 pt-4">
          <div className="font-bold text-[26px] md:text-[30px]">
            {isEdit ? "Update an account" : "Create an account"}
          </div>
          <p className="mb-8 text-primaryTextColor text-[16px]">
            {isEdit ? "Update a teacher account." : "Create a teacher account."}
          </p>
            <Form
              onFinish={onAction}
              form={form}
              layout="vertical"
              initialValues={{
                firstName: isEdit ? initialData?.firstName : "",
                lastName: isEdit ? initialData?.lastName : "",
                email: isEdit ? initialData?.email : "",
                teacherCode: isEdit ? initialData?.teacherCode : "",
                password: "",
                status: isEdit ? initialData?.status : true,
                phone: isEdit ? initialData?.phone : "",
              }}
            >
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={
                  <span className="text-[16px]">
                    First name
                    <span className="text-red-500">*</span>
                  </span>
                }
                // @ts-ignore
                rules={[createValidator("firstName", baseSchema)]}
                name="firstName"
              >
                <Input className="h-[46px]" placeholder="First name" />
              </Form.Item>
              <Form.Item
                label={
                  <span className="text-[16px]">
                    Last name <span className="text-red-500">*</span>
                  </span>
                }
                // @ts-ignore
                rules={[createValidator("lastName", baseSchema)]}
                name="lastName"
              >
                <Input className="h-[46px]" placeholder="Last name" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={
                  <span className="text-[16px]">
                    Email <span className="text-red-500">*</span>
                  </span>
                }
                // @ts-ignore
                rules={[createValidator("email", baseSchema)]}
                name="email"
              >
                <Input className="h-[46px]" placeholder="Email" />
              </Form.Item>
              <Form.Item
                label={
                  <span className="text-[16px]">
                    Teacher Code <span className="text-red-500">*</span>
                  </span>
                }
                // @ts-ignore
                rules={[createValidator("teacherCode", baseSchema)]}
                name="teacherCode"
              >
                <Input className="h-[46px]" placeholder="Teacher Code" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {!isEdit && (
                <Form.Item
                  label={<span className="text-[16px]">Password</span>}
                  name="password"
                  rules={[createValidator("password", accountCreateSchema)]}
                >
                  <Input.Password
                    className="h-[46px]"
                    placeholder="Password"
                  />
                  <div className="text-[14px] text-[#b3b0a5] mt-2">
                    Default Password: Greenwich@123
                  </div>
                </Form.Item>
              )}
              <Form.Item
                label={<span className="text-[16px]">Phone Number</span>}
                // @ts-ignore
                name="phone"
              >
                <Input className="h-[46px]" placeholder="Phone Number" />
              </Form.Item>
            </div>
            <div className="flex flex-row items-center">
              <div className="w-1/2">
                <Form.Item
                  label={<span className="text-[16px]">Status</span>}
                  className="flex self-center mt-6"
                  layout="horizontal"
                  // @ts-ignore
                  name="status"
                  valuePropName="checked"
                >
                  <Switch className="ml-2" />
                </Form.Item>
              </div>
              <div className="flex justify-start w-1/2">
                <Button
                  onClick={handleCancel}
                  className="h-[50px] w-[100px] md:h-[52px] md:w-[124px] rounded-[50px] border-[1px] border-primaryColor text-primaryColor lg:text-[16px] md:text-[14px] mr-4"
                >
                  Cancel
                </Button>
                <Button
                  // @ts-ignore
                  loading={isOnAction}
                  htmlType="submit"
                  className="h-[50px] w-[100px] md:h-[52px] md:w-[124px] rounded-[50px] bg-primaryColor text-white text-[14px] md:text-[16px] "
                >
                  {isEdit ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default TeacherActionModal;