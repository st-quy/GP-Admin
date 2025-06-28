import { LogoGreen } from "@assets/images";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";

const { Header, Content } = Layout;

export const PublicLayout = () => {
  return (
    <Layout className="bg-[#FDFEFD] min-h-screen min-w-screen">
      <Header className="flex items-center h-[7rem] bg-[#FDFEFD]">
        <img src={LogoGreen} className="max-w-40" />
      </Header>
      <Content
        className={`px-6 flex-1 w-full bg-[url(@assets/images/bgGreenwich.png)] bg-repeat-round`}
      >
        <Outlet />
      </Content>
    </Layout>
  );
};
