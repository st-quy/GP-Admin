// Define public routes accessible to all users
import { PublicLayout } from "@app/layout/PublicLayout";
import ForgotPassword from "@pages/ForgotPassword/index";
import LoginPage from "@pages/Login/index";
import ResetPassword from "@pages/ResetPassword/index";
import ResetPasswordSuccess from "@pages/ResetPassword/ResetSuccess";
import Unauthorized from "@pages/Unauthorized";

const PublicRoute = [
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "reset-success",
        element: <ResetPasswordSuccess />,
      },
    ],
  },
  {
    path: "unauthorized",
    element: <Unauthorized />,
  },
];

export default PublicRoute;
