import { LogoGreen } from '@assets/images';
import { Layout, Menu } from 'antd';
import {
  Outlet,
  useLocation,
  useNavigate,
  matchRoutes,
  Navigate,
} from 'react-router-dom';
import { Breadcrumb } from '../../components/Breadcrumb/Breadcrumb';
import PrivateRoute from '../PrivateRoute';
import ProfileMenu from '@features/auth/ui/ProfileMenu';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Sider from 'antd/es/layout/Sider';
import {
  ContactsOutlined,
  ContainerOutlined,
  DatabaseOutlined,
  HomeOutlined,
  ReadOutlined,
} from '@ant-design/icons';

const { Header, Content } = Layout;

export const ProtectedRoute = () => {
  // @ts-ignore
  const { isAuth, user } = useSelector((state) => state.auth);

  const [currentKey, setCurrentKey] = useState('dashboard');
  const location = useLocation();

  const navigate = useNavigate();

  // Generate breadcrumb paths based on route matches
  const routes = matchRoutes(PrivateRoute, location.pathname) || [];

  const breadcrumbPaths = routes.map(({ pathname, params, route }) => {
    let breadcrumb = route.breadcrumb;

    return {
      name: breadcrumb,
      link: pathname,
      index: route.children
        ? route.children.some((child) => child.index)
        : route.index,
    };
  });

  // Function to handle navigation
  const navigateTo = (key) => {
    setCurrentKey(key);
    navigate(`/${key}`);
  };

  useEffect(() => {
    const path = location.pathname.split('/')[1];

    if (!path) {
      setCurrentKey('dashboard');
    } else {
      setCurrentKey(path);
    }
  }, [location.pathname]);

  const requiredRoles =
    routes.find((route) => route.route?.role)?.route?.role || [];

  if (
    requiredRoles.length > 0 &&
    !requiredRoles.some((item) => user?.role.includes(item))
  ) {
    return <Navigate to='/unauthorized' replace />;
  }

  const items = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: `Dashboard`,
      roles: ['superadmin', 'admin'],
    },
    {
      key: 'teacher',
      icon: <ContactsOutlined />,
      label: `Teacher Management`,
      roles: ['superadmin', 'admin'],
    },
    {
      key: 'questions',
      icon: <DatabaseOutlined />,
      label: `Question Bank`,
      roles: ['superadmin', 'teacher', 'admin'],
    },
    {
      key: 'exam',
      icon: <ReadOutlined />,
      label: `Exam`,
      roles: ['superadmin', 'teacher', 'admin'],
    },
    {
      key: 'class',
      icon: <ContainerOutlined />,
      label: `Class`,
      roles: ['teacher'],
    },
  ];

  const allowedOptions = items.filter((option) =>
    option.roles.some((role) => user?.role.includes(role))
  );

  useEffect(() => {
    if (!isAuth) navigate('/login');
  }, [isAuth, navigate]);

  const siderStyle = {
    overflow: 'auto',
    height: '100vh',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
  };

  return (
    <Layout hasSider>
      <Sider
        className='bg-white shadow-xl min-h-screen'
        breakpoint='lg'
        collapsedWidth='0'
        width={250}
        // style={siderStyle}
      >
        <div className='flex flex-col justify-between h-full'>
          <div className='w-full px-2 flex flex-col justify-start items-center p-4'>
            <img
              src={LogoGreen}
              className='cursor-pointer w-24 pb-8'
              onClick={() => navigate('/')}
            />

            <Menu
              theme='light'
              items={allowedOptions}
              className='!border-none'
              onClick={(e) => navigateTo(e.key)}
              selectedKeys={[currentKey]}
            />
          </div>
          <ProfileMenu />
        </div>
      </Sider>
      <Layout className='p-0'>
        <Header className='bg-white px-4 shadow-md flex justify-start items-end h-10'>
          {location.pathname !== '/' && <Breadcrumb paths={breadcrumbPaths} />}
        </Header>
        <Content className=''>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
