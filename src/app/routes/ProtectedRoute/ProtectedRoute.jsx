import { LogoGreen } from '@assets/images';
import { Layout, message, Modal } from 'antd';
import {
  Outlet,
  useLocation,
  useNavigate,
  matchRoutes,
  Link,
  Navigate,
} from 'react-router-dom';
import { Breadcrumb } from '../../components/Breadcrumb/Breadcrumb'; // Restored import
import PrivateRoute from '../PrivateRoute';
import { useEffect, useState, useRef, useLayoutEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LogoutOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { logout } from '@app/providers/reducer/auth/authSlice';
import { useGetProfile } from '@features/auth/hooks';

const { Content } = Layout;

export const ProtectedRoute = () => {
  // @ts-ignore
  const { isAuth, user, role, userId } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [currentKey, setCurrentKey] = useState('dashboard');
  const location = useLocation();
  const navigate = useNavigate();

  // Ensure user is loaded if auth exists but state is empty
  useGetProfile(); 

  // Sliding logic refs
  const navRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const path = location.pathname.split('/')[1];
    if (!path) {
      setCurrentKey('dashboard');
    } else {
      setCurrentKey(path);
    }
  }, [location.pathname]);

  const currentRoles = useMemo(() => {
    return Array.isArray(user?.role)
      ? user.role
      : Array.isArray(role)
        ? role
        : [];
  }, [user?.role, role]);

  const navItems = useMemo(() => [
    { key: 'dashboard', label: `Dashboard`, roles: ['superadmin', 'admin'] },
    { key: 'teacher', label: `Teacher`, roles: ['superadmin', 'admin'] },
    { key: 'questions', label: `Question Bank`, roles: ['superadmin', 'teacher', 'admin'] },
    { key: 'exam', label: `Exam`, roles: ['superadmin', 'teacher', 'admin'] },
    { key: 'class', label: `Class`, roles: ['teacher'] },
  ], []);

  const allowedOptions = useMemo(() => 
    navItems.filter((option) =>
      option.roles.some((menuRole) => currentRoles.includes(menuRole))
    ), [navItems, currentRoles]
  );

  // Generate breadcrumb paths
  const routes = matchRoutes(PrivateRoute, location.pathname) || [];
  const breadcrumbPaths = routes.map(({ pathname, route }) => {
    return {
      name: route.breadcrumb,
      link: pathname,
      index: route.children ? route.children.some((child) => child.index) : route.index,
    };
  });

  const requiredRoles = routes.find((route) => route.route?.role)?.route?.role || [];

  // Smooth sliding animation effect
  useLayoutEffect(() => {
    if (navRef.current) {
      const isNavPage = allowedOptions.some(item => item.key === currentKey);
      if (!isNavPage) {
        setSliderStyle(prev => ({ ...prev, opacity: 0 }));
        return;
      }

      const timer = setTimeout(() => {
        const activeItem = navRef.current.querySelector('.figma-navbar-item.active');
        if (activeItem) {
          setSliderStyle({
            left: activeItem.offsetLeft,
            width: activeItem.offsetWidth,
            opacity: 1,
          });
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentKey, allowedOptions]);

  useEffect(() => {
    if (!isAuth) navigate('/login');
  }, [isAuth, navigate]);

  // Role Authorization Check
  if (
    requiredRoles.length > 0 &&
    !requiredRoles.some((item) => currentRoles.includes(item))
  ) {
    return <Navigate to='/unauthorized' replace />;
  }

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
        navigate('/login');
        message.success('Logged out successfully');
      },
    });
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Loading...';

  return (
    <Layout className="figma-main-layout">
      {/* --- APTIS-238: TOP NAVBAR --- */}
      <header className="figma-navbar">
        {/* Left: Logo (2x Size) */}
        <div className="figma-navbar-logo-group" onClick={() => navigate('/')}>
          <img src={LogoGreen} alt="Logo" style={{ height: '100px' }} /> 
        </div>

        {/* Middle: Navigation Pills with Sliding Highlight */}
        <nav className="figma-navbar-nav-group" ref={navRef}>
          <div 
            className="nav-highlight-slider" 
            style={{ 
              left: `${sliderStyle.left}px`, 
              width: `${sliderStyle.width}px`,
              opacity: sliderStyle.opacity 
            }} 
          />
          {allowedOptions.map((item) => (
            <div
              key={item.key}
              className={`figma-navbar-item ${currentKey === item.key ? 'active' : ''}`}
              onClick={() => navigate(`/${item.key}`)}
            >
              {item.label}
            </div>
          ))}
        </nav>

        {/* Right: User & Logout */}
        <div className="figma-navbar-user-group">
          <Link to="/profile" className="figma-navbar-username">
            {fullName}
          </Link>
          <div className="figma-navbar-logout" onClick={showLogoutConfirm} title="Logout">
            <LogoutOutlined style={{ fontSize: '24px' }} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <Content className="figma-content-area">
        {/* --- APTIS-238: GLOBAL BREADCRUMB --- */}
        {location.pathname !== '/' && location.pathname !== '/dashboard' && (
          <Breadcrumb paths={breadcrumbPaths} />
        )}
        <Outlet />
      </Content>
    </Layout>
  );
};
