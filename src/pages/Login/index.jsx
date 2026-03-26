import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Row, Col, Typography, Alert } from "antd";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { yupSync } from "@shared/lib/utils";
import { useLogin } from "../../features/auth/hooks";
import { useSelector } from "react-redux";
import { loginSchema } from "./loginSchema";

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const { mutate: loginFunc, isPending } = useLogin();
  const { isAuth } = useSelector((state) => state.auth);
  const [errorMessage, setErrorMessage] = useState("");
  const [form] = Form.useForm();

  const onSubmit = async (values) => {
    try {
      loginFunc(values);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    if (isAuth) navigate("/");
  }, [isAuth, navigate]);

  return (
    <Row className="!gap-0">
      <Col
        xs={24}
        sm={24}
        md={24}
        lg={12}
        xxl={12}
        className="flex items-start lg:justify-end justify-center px-4 py-6 lg:py-8 lg:pr-8"
      >
        <Card className="w-full max-w-[550px] lg:max-w-[600px] shadow-lg pt-[16px] pb-8 px-6 lg:pb-12 lg:px-8">
          <div className="mb-8">
            <Title
              level={1}
              className="!text-[48px] !text-gray-900 !mb-6 !font-['Inter']"
            >
              Welcome back!
            </Title>
            <Text className="text-gray-500 text-lg">
              Welcome back! Please enter your details.
            </Text>
          </div>

          {errorMessage && (
            <Alert
              message={errorMessage}
              type="error"
              className="mb-6"
              showIcon
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            className="space-y-6"
          >
            <Form.Item
              name="email"
              label={
                <span className="text-base mb-2">
                  Email <span className="text-red-500">*</span>
                </span>
              }
              rules={[yupSync(loginSchema)]}
            >
              <Input
                suffix={<MailOutlined className="text-gray-400" />}
                placeholder="Enter your email here"
                size="large"
                className="h-11 text-base rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-base mb-2">
                  Password <span className="text-red-500">*</span>
                </span>
              }
              rules={[yupSync(loginSchema)]}
            >
              <Input.Password
                placeholder="********"
                size="large"
                className="h-11 text-base rounded-lg"
                iconRender={(visible) =>
                  visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-[#003087] hover:text-[#003087]/90 text-base"
              >
                Forgot password?
              </Link>
            </div>

            <Form.Item className="mb-10 flex justify-center">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="!w-[250px] !h-[50px] text-base font-medium !bg-[#003087] hover:!bg-[#003087]/90 rounded-full"
                loading={isPending}
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;
