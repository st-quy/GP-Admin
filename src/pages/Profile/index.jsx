import React, { useRef, useState } from 'react';
import { Button, Spin, Tag, Typography, message } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import defaultAvatar from '@assets/images/avatar.png';
import ProfileUpdate from '@features/profile/ui/Modal/ProfileUpdate';
import ChangePassword from '@features/profile/ui/Modal/ChangePassword';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { logout } from '@app/providers/reducer/auth/authSlice';
const { Title, Text } = Typography;

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileInputRef = useRef(null);
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [openKey, setOpenKey] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    dispatch(logout());
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        message.error('Image size should be less than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        message.error('Please upload an image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };
  if (!user) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Spin size='large' />
      </div>
    );
  }

  const InfoField = ({ label, value }) => (
    <div>
      <Text className='text-[#374151] text-[16px] font-normal block mb-2'>
        {label}
      </Text>
      <Text
        className={
          value !== 'No information'
            ? 'text-[#1F2A37] text-[16px] font-semibold'
            : 'text-[#6B7280] text-[16px] font-normal'
        }
      >
        {Array.isArray(value)
          ? value.map((item, index) => {
              return <Tag key={index}>{item.toUpperCase()}</Tag>;
            })
          : value || 'No information'}
      </Text>
    </div>
  );

  return (
    <div className='p-8 space-y-6 max-w-[1920px] mx-auto'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div className='w-full sm:w-auto'>
          <Title level={3} className='m-0 font-bold text-black  '>
            My profile
          </Title>
          <Text className='text-primaryTextColor text-[18px]'>
            Summary of personal information.
          </Text>
        </div>
        <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 sm:space-x-0'>
          <Button
            type='default'
            onClick={() => setOpenKey('change-password')}
            className='min-w-[140px] md:min-w-[160px] h-[50px] rounded-full border border-primaryColor text-primaryColor hover:text-[#0066CC] hover:border-[#0066CC] font-medium'
          >
            Change password
          </Button>
          <Button
            type='primary'
            onClick={() => setOpenKey('update-profile')}
            className='min-w-[140px] md:min-w-[160px] h-[50px] rounded-full bg-primaryColor hover:bg-[#002A6B] border-none font-medium'
          >
            Update profile
          </Button>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-lg border border-gray-100 p-6 sm:p-8'>
        <div className='flex items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap'>
          <div
            className='relative group cursor-pointer'
            onClick={handleAvatarClick}
          >
            <div className='w-[114px] h-[122px] relative'>
              <img
                src={avatar}
                alt='Profile'
                className='w-full h-full object-cover bg-blue-100 rounded-lg'
              />
              <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg'>
                <CameraOutlined className='text-white text-xl' />
              </div>
            </div>
            <input
              type='file'
              ref={fileInputRef}
              className='hidden'
              accept='image/*'
              onChange={handleFileChange}
            />
          </div>
          <div>
            <Text className='font-bold text-primaryColor text-[18px] block'>
              {user?.firstName + ' ' + user?.lastName || 'N/A'}
            </Text>
            <Text className='text-[#6B7280] text-[16px] block'>
              {user?.role
                ? String(user?.role).charAt(0).toUpperCase() +
                  String(user?.role).slice(1)
                : 'N/A'}
            </Text>
            <Text className='block text-[#6B7280] text-[16px]'>
              {user?.email}
            </Text>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-[8px] shadow-lg border border-gray-100 w-full mx-auto'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 p-6 sm:p-8'>
          <div className='space-y-1'>
            <InfoField label='First Name' value={user?.firstName} />
          </div>
          <div className='space-y-1'>
            <InfoField label='Last Name' value={user?.lastName} />
          </div>
          <div className='space-y-1'>
            <InfoField label='Email' value={user?.email} />
          </div>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 p-6 sm:p-8 border-t border-gray-100'>
          <div className='space-y-1'>
            <InfoField
              label='DoB'
              value={
                user?.dob
                  ? dayjs(user?.dob).format('DD-MM-YYYY')
                  : 'No information'
              }
            />
          </div>
          <div className='space-y-1'>
            <InfoField
              label='Phone number'
              value={user?.phone || 'No information'}
            />
          </div>
          <div className='space-y-1'>
            <InfoField
              label='Address'
              value={user?.address || 'No information'}
            />
          </div>
        </div>
      </div>

      <div className='bg-white rounded-[8px] shadow-lg border border-gray-100 w-full mx-auto'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 p-6 sm:p-8'>
          <div className='space-y-1'>
            <InfoField
              label='Teacher Code'
              value={user?.teacherCode || 'No information'}
            />
          </div>

          <div className='space-y-1'>
            <InfoField label='Role' value={user?.role || 'No information'} />
          </div>
        </div>
      </div>

      <ProfileUpdate
        isOpen={openKey === 'update-profile'}
        onClose={() => setOpenKey(null)}
        userData={user}
      />

      <ChangePassword
        isOpen={openKey === 'change-password'}
        onClose={() => setOpenKey(null)}
      />
      <Button type='primary' danger className='w-full' onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
};

export default ProfilePage;
