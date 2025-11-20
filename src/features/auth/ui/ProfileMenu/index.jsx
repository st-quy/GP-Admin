import { RightOutlined, UserOutlined } from '@ant-design/icons';
import { logout } from '@app/providers/reducer/auth/authSlice';
import { Button, Divider, Dropdown, Space, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ProfileMenu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onClick = ({ key }) => {
    switch (key) {
      case 'logout':
        localStorage.clear();
        navigate('/login');
        dispatch(logout());
        break;
      default:
        navigate(key);
        break;
    }
  };

  return (
    <div className='w-full pb-4'>
      {user && (
        <Space
          direction='vertical'
          className='w-full'
          split={<Divider type='horizontal' className='my-4' />}
          size={-20}
        >
          <Button
            icon={<UserOutlined className='text-lg' />}
            type='text'
            onClick={(e) => {
              e.preventDefault();
              navigate('/profile');
            }}
            className='w-full'
          >
            <div className='w-full text-[14px] font-semibold !text-[#121212] hover:!text-[#4d4d4d] flex justify-between items-center'>
              {user.firstName + ' ' + user.lastName}
              <RightOutlined />
            </div>
          </Button>
        </Space>
      )}
    </div>
  );
};
export default ProfileMenu;
