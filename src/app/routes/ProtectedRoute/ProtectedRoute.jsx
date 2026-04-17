import { LogoGreen } from '@assets/images';
import { Layout, Menu, message, Modal } from 'antd';
import {
  ContactsOutlined,
  ContainerOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  MenuOutlined,
  ReadOutlined,
} from '@ant-design/icons';
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
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@app/providers/reducer/auth/authSlice';
import { useGetProfile } from '@features/auth/hooks';
import Sider from 'antd/es/layout/Sider';

const { Header, Content } = Layout;

export const ProtectedRoute = () => {
  // @ts-ignore
  const { isAuth, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [currentKey, setCurrentKey] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);
  const location = useLocation();
  const navigate = useNavigate();

  // Ensure user is loaded if auth exists but state is empty
  useGetProfile();

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

  // Determine mobile state and collapsed state for sider
  const isMobile = windowWidth < 992;
  const collapsed = isMobile ? !isMobileMenuOpen : false;

  // Function to handle navigation
  const navigateTo = (key) => {
    setCurrentKey(key);
    navigate(`/${key}`);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const path = location.pathname.split('/')[1];
    if (!path) {
      setCurrentKey('dashboard');
    } else {
      setCurrentKey(path);
    }
  }, [location.pathname]);

  const currentRoles = useMemo(() => {
    return Array.isArray(user?.role) ? user.role : [];
  }, [user?.role]);

  const requiredRoles =
    routes.find((route) => route.route?.role)?.route?.role || [];

  // Role Authorization Check
  if (
    requiredRoles.length > 0 &&
    !requiredRoles.some((item) => currentRoles.includes(item))
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
    option.roles.some((role) => user?.role?.includes(role))
  );

  useEffect(() => {
    if (!isAuth) navigate('/login');
  }, [isAuth, navigate]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width >= 992) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Body scroll lock when mobile menu open - preserves scroll position
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      document.body.classList.add('menu-open');
      // Fix body position to prevent jump
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.dataset.scrollLockY = scrollY;
    } else {
      document.body.classList.remove('menu-open');
      // Restore scroll position
      const scrollY = parseInt(document.body.dataset.scrollLockY || '0', 10);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      delete document.body.dataset.scrollLockY;
      window.scrollTo(0, scrollY);
    }
    return () => {
      document.body.classList.remove('menu-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on overlay click
  const handleOverlayClick = () => {
    setIsMobileMenuOpen(false);
  };

  const showLogoutConfirm = () => {
    Modal.confirm({
      title: 'Logout Confirmation',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to log out?',
      okText: 'Logout',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        localStorage.clear();
        dispatch(logout());
        window.location.href = '/login';
        message.success('Logged out successfully');
      },
    });
  };

  // Base sider style (desktop)
  const baseSiderStyle = {
    overflow: 'auto',
    height: '100vh',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
  };

  // Mobile-specific sider style overrides (position fixed)
  const siderStyle = isMobile
    ? {
        ...baseSiderStyle,
        position: 'fixed',
        left: 0,
        top: 0,
        insetInlineStart: 0,
      }
    : baseSiderStyle;

  return (
    <>
      <Layout hasSider>
        <Sider
          className={`bg-white shadow-xl min-h-screen ${isMobile ? 'mobile-sider' : ''}`}
          collapsed={collapsed}
          collapsedWidth={0}
          width={250}
          style={siderStyle}
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
          <Header className='bg-white px-4 shadow-md flex items-center h-10'>
            {location.pathname !== '/' && <Breadcrumb paths={breadcrumbPaths} />}
          </Header>
          <Content className=''>
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      {/* Mobile overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className='mobile-sidebar-overlay active' onClick={handleOverlayClick} />
      )}

      {/* Mobile menu toggle button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
          aria-label='Toggle menu'
        >
          <MenuOutlined />
        </button>
      )}
    </>
  );
};
