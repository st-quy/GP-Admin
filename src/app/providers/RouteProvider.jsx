import PublicRoute from "@app/routes/PublicRoute";
import PrivateRoute from "@app/routes/PrivateRoute";
import { Outlet, createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import NotFound from "@pages/NotFoundPage";
import { useGetProfile } from "@features/auth/hooks";
import { Spin } from "antd";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Outlet />,
      errorElement: <NotFound />,
      children: [...PublicRoute, ...PrivateRoute],
    },
  ],
  {
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

const RouteProvider = () => {
  const { isLoading } = useGetProfile();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <RouterProvider
      future={{
        v7_startTransition: true,
      }}
      router={router}
    />
  );
};

export default RouteProvider;
