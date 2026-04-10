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

const trimAndLimit = (value, maxLength) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : value;

const trimStartAndLimit = (value, maxLength) =>
  typeof value === 'string' ? value.trimStart().slice(0, maxLength) : value;

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
    .transform((value) => value?.trim())
    .max(100, 'Email must not exceed 100 characters'),
  teacherCode: Yup.string()
    .required('Teacher Code is required')
    .transform((value) => value?.trim())
    .max(20, 'Teacher Code must not exceed 20 characters')
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
    const trimmed = trimAndLimit(form.getFieldValue(fieldName), 50);
    if (trimmed !== undefined) {
      form.setFieldsValue({ [fieldName]: trimmed });
      form.validateFields([fieldName]);
    }
  };

  const handleNameChange = (e, fieldName) => {
    const trimmed = trimStartAndLimit(e.target.value, 50);
    form.setFieldsValue({ [fieldName]: trimmed });
  };

  const handleEmailChange = (e) => {
    const trimmed = trimStartAndLimit(e.target.value, 100);
    form.setFieldsValue({ email: trimmed });
  };

  const handleEmailBlur = () => {
    const trimmedAndLimited = trimAndLimit(form.getFieldValue('email'), 100);
    if (trimmedAndLimited !== undefined) {
      form.setFieldsValue({ email: trimmedAndLimited });
      form.validateFields(['email']);
    }
  };

  const handleTeacherCodeChange = (e) => {
    const trimmed = trimStartAndLimit(e.target.value, 20);
    form.setFieldsValue({ teacherCode: trimmed });
  };

  const handleTeacherCodeBlur = () => {
    const trimmedAndLimited = trimAndLimit(form.getFieldValue('teacherCode'), 20);
    if (trimmedAndLimited !== undefined) {
      form.setFieldsValue({ teacherCode: trimmedAndLimited });
      form.validateFields(['teacherCode']);
    }
  };

  const handlePhoneChange = (e) => {
    const value = typeof e.target.value === 'string' ? e.target.value.trimStart() : e.target.value;
    form.setFieldsValue({ phone: value });
  };

  const handlePhoneBlur = () => {
    const trimmedPhone = trimAndLimit(form.getFieldValue('phone'), 10);
    if (trimmedPhone !== undefined) {
      form.setFieldsValue({ phone: trimmedPhone });
      form.validateFields(['phone']);
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
        firstName: trimAndLimit(values.firstName, 50),
        lastName: trimAndLimit(values.lastName, 50),
        email: trimAndLimit(values.email, 100),
        teacherCode: trimAndLimit(values.teacherCode, 20),
        password: !isEdit ? passwordValue || `Greenwich@123` : undefined,
        role: 'teacher',
        status: values.status,
        phone: trimAndLimit(values.phone, 10) || undefined,
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
          <button
            onClick={showModal}
            className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70"
          >
            <EditOutlined style={{ fontSize: "20px", color: "#003087" }} />
          </button>
        ) : (
          <Button
            icon={<PlusCircleOutlined />}
            onClick={showModal}
            className="!h-[50px] !w-[236px] !rounded-[50px] !bg-primaryColor !text-white font-[500] leading-[24px] hover:!opacity-90"
          >
            Create new account
          </Button>
        ))}
      <Modal
        open={isModalOpen}
        okText={isEdit ? 'Update' : 'Create'}
        closable={true}
        destroyOnClose
        keyboard={true}
        maskClosable={true}
        onCancel={handleCancel}
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
                  onChange={(e) => handleNameChange(e, 'firstName')}
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
                  onChange={(e) => handleNameChange(e, 'lastName')}
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
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedText = e.clipboardData.getData('text').trimStart().slice(0, 100);
                    const currentValue = form.getFieldValue('email') || '';
                    form.setFieldsValue({ email: currentValue + pastedText });
                  }}
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
                  onChange={handleTeacherCodeChange}
                  onBlur={handleTeacherCodeBlur}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedText = e.clipboardData.getData('text').trimStart().slice(0, 20);
                    const currentValue = form.getFieldValue('teacherCode') || '';
                    form.setFieldsValue({ teacherCode: currentValue + pastedText });
                  }}
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
                <Input
                  className='h-[46px]'
                  placeholder='Phone Number'
                  maxLength={10}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                />
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
