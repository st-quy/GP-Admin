import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RedirectByRole = () => {
  // @ts-ignore
  const { user, role } = useSelector((state) => state.auth);
  const currentRoles = Array.isArray(user?.role)
    ? user.role
    : Array.isArray(role)
      ? role
      : [];

  if (currentRoles.includes('admin')) {
    return <Navigate to='/dashboard' replace />;
  }

  if (currentRoles.includes('teacher')) {
    return <Navigate to='/class' replace />;
  }

  // Mặc định fallback nếu role không khớp
  return <Navigate to='/unauthorized' replace />;
};

export default RedirectByRole;
