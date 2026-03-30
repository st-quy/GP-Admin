import { Modal, Button, Input, message, Form, Switch } from 'antd';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import {
  useCreateTeacher,
  useUpdateTeacher,
} from '@features/teacher/hook/useTeacherQuery';
import { useFetchTeachers } from '@features/teacher/hook/useTeacherQuery';
import { EditOutlined, PlusCircleOutlined } from '@ant-design/icons';

const yupSync = (schema) => ({
  async validator({ field }, value) {
    try {
      await schema.validateSyncAt(field, { [field]: value });
    } catch (error) {
      throw new Error(error.message);
    }
  },
});

const accountSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First name is required')
    .max(50, 'First name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'First name cannot contain special characters or numbers')
    .transform((value) => value?.trim())
    .test('not-only-spaces', 'First name cannot be only spaces', (value) => {
      return !value || value.trim().length > 0;
    }),
  lastName: Yup.string()
    .required('Last name is required')
    .max(50, 'Last name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Last name cannot contain special characters or numbers')
    .transform((value) => value?.trim())
    .test('not-only-spaces', 'Last name cannot be only spaces', (value) => {
      return !value || value.trim().length > 0;
    }),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required')
    .max(100, 'Email must not exceed 100 characters')
    .transform((value) => value?.trim()),
  teacherCode: Yup.string()
    .required('Teacher Code is required')
    .max(20, 'Teacher Code must not exceed 20 characters')
    .transform((value) => value?.trim())
    .test('not-only-spaces', 'Teacher Code cannot be only spaces', (value) => {
      return !value || value.trim().length > 0;
    }),
  password: Yup.string()
    .transform((value) => (value === '' ? undefined : value))
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must not exceed 50 characters')
    .notRequired(),
  phone: Yup.string()
    .transform((value) => {
      const trimmedValue = value?.trim();
      return trimmedValue === '' ? undefined : trimmedValue;
    })
    .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
    .notRequired(),
});

const TeacherActionModal = ({
  initialData = null,
  open: controlledOpen,
  onClose,
  hideTrigger = false,
}) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const isEdit = initialData !== null;
  const isControlled = typeof controlledOpen === 'boolean';
  const isModalOpen = isControlled ? controlledOpen : open;
  // @ts-ignore
  const { mutate: teacherAction, isPending: isOnAction } = isEdit
    ? useUpdateTeacher()
    : useCreateTeacher();

  // Fetch all teachers for unique validation
  const { data: allTeachersData } = useFetchTeachers({ page: 1, limit: 1000 });
  const allTeachers = allTeachersData?.data?.teachers || [];

  const handleNameBlur = (fieldName) => {
    const value = form.getFieldValue(fieldName);
    if (value) {
      form.setFieldsValue({ [fieldName]: value.trim() });
      form.validateFields([fieldName]);
    }
  };

  const handleEmailBlur = () => {
    const email = form.getFieldValue('email');
    if (email) {
      form.setFieldsValue({ email: email.trim() });
      form.validateFields(['email']);
    }
  };

  const handleTeacherCodeBlur = () => {
    const teacherCode = form.getFieldValue('teacherCode');
    if (teacherCode) {
      form.setFieldsValue({ teacherCode: teacherCode.trim() });
      form.validateFields(['teacherCode']);
    }
  };

  const applyBackendFieldErrors = (messages = []) => {
    const normalizedMessages = messages
      .filter(Boolean)
      .map((backendMessage) =>
        String(backendMessage)
          .replace(/^Error updating user:\s*/i, '')
          .replace(/^Validation Error:\s*/i, '')
          .trim()
      );
    const fieldErrorMap = {
      email: [],
      teacherCode: [],
      phone: [],
    };

    normalizedMessages.forEach((backendMessage) => {
      const messageText = backendMessage.toLowerCase();

      if (messageText.includes('email')) {
        fieldErrorMap.email.push(backendMessage);
      } else if (messageText.includes('teacher code')) {
        fieldErrorMap.teacherCode.push(backendMessage);
      } else if (messageText.includes('phone')) {
        fieldErrorMap.phone.push(backendMessage);
      }
    });

    const fields = Object.entries(fieldErrorMap)
      .filter(([, errors]) => errors.length > 0)
      .map(([name, errors]) => ({
        name,
        errors,
      }));

    if (fields.length > 0) {
      form.setFields(fields);
      return true;
    }

    return false;
  };

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      firstName: isEdit ? initialData?.firstName : '',
      lastName: isEdit ? initialData?.lastName : '',
      email: isEdit ? initialData?.email : '',
      teacherCode: isEdit ? initialData?.teacherCode : '',
      password: '',
      status: isEdit ? initialData?.status : true,
      phone: isEdit ? initialData?.phone : '',
    });
    setPasswordValue('');
  }, [form, initialData, isEdit, isModalOpen]);

  const showModal = () => {
    if (!isControlled) {
      setOpen(true);
    }
  };

  const handleCancel = () => {
    if (!isControlled) {
      setOpen(false);
    }
    onClose?.();
    form.resetFields();
    setPasswordValue('');
  };

  const validateUniqueEmailAndTeacherCode = (email, teacherCode, currentId) => {
    const emailExists = allTeachers.some(
      (t) => t.email.toLowerCase() === email.toLowerCase() && t.ID !== currentId
    );
    const teacherCodeExists = allTeachers.some(
      (t) => t.teacherCode.toLowerCase() === teacherCode.toLowerCase() && t.ID !== currentId
    );

    const errors = [];
    if (emailExists) {
      errors.push({ name: 'email', errors: ['Email already exists'] });
    }
    if (teacherCodeExists) {
      errors.push({ name: 'teacherCode', errors: ['Teacher Code already exists'] });
    }

    if (errors.length > 0) {
      form.setFields(errors);
      return false;
    }
    return true;
  };

  // @ts-ignore
  const onAction = async (values) => {
    try {
      form.setFields([
        { name: 'email', errors: [] },
        { name: 'teacherCode', errors: [] },
        { name: 'phone', errors: [] },
      ]);

      // Validate unique email and teacher code
      if (isEdit) {
        const isValid = validateUniqueEmailAndTeacherCode(
          values.email?.trim(),
          values.teacherCode?.trim(),
          initialData?.ID
        );
        if (!isValid) {
          return;
        }
      } else {
        // For create, also check uniqueness
        const isValid = validateUniqueEmailAndTeacherCode(
          values.email?.trim(),
          values.teacherCode?.trim(),
          null
        );
        if (!isValid) {
          return;
        }
      }

      const data = {
        ID: isEdit ? initialData?.ID : undefined,
        firstName: values.firstName?.trim(),
        lastName: values.lastName?.trim(),
        email: values.email?.trim(),
        teacherCode: values.teacherCode?.trim(),
        password: !isEdit ? passwordValue || `Greenwich@123` : undefined,
        role: 'teacher',
        status: values.status,
        phone: values.phone?.trim() || undefined,
      };
      // @ts-ignore
      teacherAction(data, {
        onSuccess: (data) => {
          message.success(
            data.data.message || `${isEdit ? 'Update' : 'Create'} success!`
          );
          handleCancel();
        },
        onError: (error) => {
          const backendErrors = error?.response?.data?.errors;
          // @ts-ignore
          const backendMessage = error?.response?.data?.message;
          const normalizedMessages = Array.isArray(backendErrors)
            ? backendErrors
            : backendMessage
              ? [backendMessage]
              : [];

          const hasInlineFieldError = applyBackendFieldErrors(
            normalizedMessages
          );

          const fallbackMessage =
            normalizedMessages.length > 0
              ? normalizedMessages
                  .map((item) =>
                    String(item)
                      .replace(/^Error updating user:\s*/i, '')
                      .replace(/^Validation Error:\s*/i, '')
                      .trim()
                  )
                  .join(', ')
              : `Failed to ${isEdit ? 'update' : 'create'} account.`;

          message.error(fallbackMessage);

          if (!hasInlineFieldError) {
            form.setFields([
              {
                name: 'email',
                errors: [fallbackMessage],
              },
            ]);
          }
        },
      });
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          'Failed to send request account. Please try again.'
      );
    }
  };

  return (
    <>
      {!hideTrigger &&
        (isEdit ? (
          <EditOutlined
            onClick={showModal}
            className='text-primaryColor text-[20px]'
          />
        ) : (
          <Button
            icon={<PlusCircleOutlined />}
            onClick={showModal}
            className='bg-primaryColor text-white py-6 rounded-full px-4 text-base border-none'
          >
            Create new account
          </Button>
        ))}
      <Modal
        open={isModalOpen}
        okText={isEdit ? 'Update' : 'Create'}
        // onOk={onAction}
        closable={true}
        destroyOnClose
        keyboard={true}
        maskClosable={true}
        confirmLoading={isOnAction}
        width={{
          xs: '90%',
          sm: '80%',
          md: '70%',
          lg: '60%',
          xl: '50%',
          xxl: '40%',
        }}
        footer={null}
      >
        <div className='px-6 pt-4'>
          <div className='font-bold text-[26px] md:text-[30px]'>
            {isEdit ? 'Update an account' : 'Create an account'}
          </div>
          <p className='mb-8 text-primaryTextColor text-[16px]'>
            {isEdit ? 'Update a teacher account.' : 'Create a teacher account.'}
          </p>
          <Form
            onFinish={onAction}
            form={form}
            layout='vertical'
            initialValues={{
              firstName: isEdit ? initialData?.firstName : '',
              lastName: isEdit ? initialData?.lastName : '',
              email: isEdit ? initialData?.email : '',
              teacherCode: isEdit ? initialData?.teacherCode : '',
              password: '',
              status: isEdit ? initialData?.status : true,
              phone: isEdit ? initialData?.phone : '',
            }}
          >
            <div className='grid grid-cols-2 gap-4'>
              <Form.Item
                label={
                  <span className='text-[16px]'>
                    First name
                    <span className='text-red-500'>*</span>
                  </span>
                }
                // @ts-ignore
                rules={[yupSync(accountSchema)]}
                name='firstName'
              >
                <Input 
                  className='h-[46px]' 
                  placeholder='First name' 
                  maxLength={50}
                  onBlur={() => handleNameBlur('firstName')}
                />
              </Form.Item>
              <Form.Item
                label={
                  <span className='text-[16px]'>
                    Last name <span className='text-red-500'>*</span>
                  </span>
                }
                // @ts-ignore
                rules={[yupSync(accountSchema)]}
                name='lastName'
              >
                <Input 
                  className='h-[46px]' 
                  placeholder='Last name' 
                  maxLength={50}
                  onBlur={() => handleNameBlur('lastName')}
                />
              </Form.Item>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <Form.Item
                label={
                  <span className='text-[16px]'>
                    Email <span className='text-red-500'>*</span>
                  </span>
                }
                // @ts-ignore
                rules={[yupSync(accountSchema)]}
                name='email'
              >
                <Input 
                  className='h-[46px]' 
                  placeholder='Email' 
                  maxLength={100}
                  onBlur={handleEmailBlur}
                />
              </Form.Item>
              <Form.Item
                label={
                  <span className='text-[16px]'>
                    Teacher Code <span className='text-red-500'>*</span>
                  </span>
                }
                // @ts-ignore
                rules={[yupSync(accountSchema)]}
                name='teacherCode'
              >
                <Input 
                  className='h-[46px]' 
                  placeholder='Teacher Code' 
                  maxLength={20}
                  onBlur={handleTeacherCodeBlur}
                />
              </Form.Item>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              {!isEdit && (
                <Form.Item
                  label={<span className='text-[16px]'>Password</span>}
                  // @ts-ignore
                  rules={[yupSync(accountSchema)]}
                  name='password'
                >
                  <Input.Password
                    className='h-[46px]'
                    placeholder='Password'
                    onChange={(e) => setPasswordValue(e.target.value)}
                  />
                  <div className='text-[14px] text-[#b3b0a5] mt-2'>
                    Default Password: Greenwich@123
                  </div>
                </Form.Item>
              )}
              <Form.Item
                label={<span className='text-[16px]'>Phone Number</span>}
                // @ts-ignore
                name='phone'
                rules={[yupSync(accountSchema)]}
              >
                <Input className='h-[46px]' placeholder='Phone Number' />
              </Form.Item>
            </div>
            <div className='flex flex-row items-center'>
              <div className='w-1/2'>
                <Form.Item
                  label={<span className='text-[16px]'>Status</span>}
                  className='flex self-center mt-6'
                  layout='horizontal'
                  // @ts-ignore
                  name='status'
                >
                  <Switch className='ml-2' />
                </Form.Item>
              </div>
              <div className='flex justify-start w-1/2'>
                <Button
                  onClick={handleCancel}
                  className='h-[50px] w-[100px] md:h-[52px] md:w-[124px] rounded-[50px] border-[1px] border-primaryColor text-primaryColor lg:text-[16px] md:text-[14px] mr-4'
                >
                  Cancel
                </Button>
                <Button
                  // @ts-ignore
                  loading={isOnAction}
                  htmlType='submit'
                  className='h-[50px] w-[100px] md:h-[52px] md:w-[124px] rounded-[50px] bg-primaryColor text-white text-[14px] md:text-[16px] '
                >
                  {isEdit ? 'Update' : 'Create'}
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
