import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RedirectByRole = () => {
  const { user } = useSelector((state) => state.auth);

  if (user?.role?.includes("admin")) {
    return <Navigate to="/dashboard" replace />;
  }

  if (user?.role?.includes("teacher")) {
    return <Navigate to="/class" />;
  }

  // Mặc định fallback nếu role không khớp
  return <Navigate to="/unauthorized" replace />;
};

export default RedirectByRole;
