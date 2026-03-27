import { LogoGreen } from '@assets/images';
import { Layout, Button } from 'antd';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  Link,
  Navigate,
} from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@app/providers/reducer/auth/authSlice';
import { LogoutOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

export const GradingLayout = () => {
  const { isAuth, user, role } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { classId, sessionId } = useParams();

  useEffect(() => {
    if (!isAuth) navigate('/login');
  }, [isAuth, navigate]);

  const currentRoles = Array.isArray(user?.role)
    ? user.role
    : Array.isArray(role)
      ? role
      : [];

  const isTeacher = currentRoles.includes('teacher');
  const isAdmin = currentRoles.includes('admin') || currentRoles.includes('superadmin');

  if (!isTeacher && !isAdmin) {
    return <Navigate to='/unauthorized' replace />;
  }



  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    dispatch(logout());
  };

  // Build breadcrumb items
  const breadcrumbItems = [
    {
      title: (
        <Link to='/class'>Class Management</Link>
      ),
    },
    {
      title: (
        <Link to={`/class/${classId}`}>Class Detail</Link>
      ),
    },
    {
      title: (
        <Link to={`/class/${classId}/session/${sessionId}`}>Session Detail</Link>
      ),
    },
    {
      title: <span className='font-semibold text-[#003087]'>Grade</span>,
    },
  ];

  return (
    <Layout className='min-h-screen bg-[#f5f5f5]'>
      {/* Top Navigation Bar */}
      <Header
        className='bg-white shadow-md flex items-center justify-between px-8'
        style={{ height: 64, lineHeight: '64px', padding: '0 32px' }}
      >
        {/* Logo */}
        <div className='flex items-center cursor-pointer' onClick={() => navigate('/')}>
          <img src={LogoGreen} alt='GreenPREP' className='h-10' />
        </div>

        {/* Logout Icon */}
        <Button
          type='text'
          icon={<LogoutOutlined style={{ fontSize: 20 }} />}
          onClick={handleLogout}
          className='flex items-center justify-center'
        />
      </Header>

      {/* Breadcrumb */}
      <div className='px-8 pt-6'>
        <div className='bg-white rounded-xl border border-slate-200 px-6 py-4'>
          <AntBreadcrumb separator='>' items={breadcrumbItems} />
        </div>
      </div>

      {/* Content */}
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};
