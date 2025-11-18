import { LogoGreen } from "@assets/images";
import { ConfigProvider, Layout, Menu, Segmented } from "antd";
import {
  Outlet,
  useLocation,
  useNavigate,
  matchRoutes,
  Navigate,
} from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb/Breadcrumb";
import PrivateRoute from "../PrivateRoute";
import ProfileMenu from "@features/auth/ui/ProfileMenu";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const { Header, Content } = Layout;

export const ProtectedRoute = () => {
  // @ts-ignore
  const { isAuth, user } = useSelector((state) => state.auth);

  const [currentKey, setCurrentKey] = useState("1");
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
    switch (key) {
      case "1":
        navigate("/");
        break;
      case "2":
        navigate("/class");
        break;
      case "3":
        navigate("/teacher");
        break;
      default:
        setCurrentKey(key);
        break;
    }
  };

  useEffect(() => {
    const path = location.pathname.split("/")[1];
    if (path === "class") {
      setCurrentKey("2");
    } else if (path === "teacher") {
      setCurrentKey("3");
    } else {
      setCurrentKey("1");
    }
  }, [location.pathname]);

  const requiredRoles =
    routes.find((route) => route.route?.role)?.route?.role || [];

  if (
    requiredRoles.length > 0 &&
    !requiredRoles.some((item) => user?.role.includes(item))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  const segmentedOptions = [
    {
      value: "1",
      label: "Dashboard",
      roles: ["admin"],
    },
    {
      value: "2",
      label: "Class Management",
      roles: ["superadmin"],
    },
    {
      value: "3",
      label: "Teacher Management",
      roles: ["admin"],
    },
  ];

  const allowedSegmentedOptions = segmentedOptions.filter((option) =>
    option.roles.some((role) => user?.role.includes(role))
  );

  useEffect(() => {
    if (!isAuth) navigate("/login");
  }, [isAuth, navigate]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Segmented: {
            itemSelectedBg: "#003087",
            itemSelectedColor: "#fff",
          },
        },
      }}
    >
      <Layout className="min-h-screen">
        <Header className="flex items-center justify-between h-28 bg-white shadow-xl">
          <div className="w-[200px] flex items-center h-28">
            <img
              src={LogoGreen}
              className="max-w-40 cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>

          <Segmented
            size="large"
            shape="round"
            className="!p-0"
            options={allowedSegmentedOptions.map(({ value, label }) => ({
              value,
              label,
            }))}
            value={currentKey}
            onChange={(value) => navigateTo(value)}
          />
          <div className="w-[200px]">
            <ProfileMenu />
          </div>
        </Header>
        <Content className="p-10 pt-4">
          {location.pathname !== "/" && <Breadcrumb paths={breadcrumbPaths} />}
          <Outlet />
        </Content>
      </Layout>
    </ConfigProvider>
  );
};
