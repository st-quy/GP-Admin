import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Row, Col, Typography, Alert } from "antd";
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  EyeOutlined,
  EyeInvisibleOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { yupSync } from "@shared/lib/utils";
import { useLogin } from "../../features/auth/hooks";
import { useSelector } from "react-redux";
import { loginSchema } from "./loginSchema";
import LoginHappyStudent from "@assets/images/login-happy-student.png";

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
    <Row className="min-h-screen !gap-0 overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(2,132,199,0.18),_transparent_28%),linear-gradient(135deg,_#f5f9ff_0%,_#eef4ff_48%,_#f8fbff_100%)]">
      <Col xs={24} sm={24} md={24} lg={12} xxl={12} className="relative hidden lg:flex">
        <div className="flex w-full flex-col justify-between bg-[#003087] px-8 py-10 text-white xl:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.25),_transparent_30%)]" />
          <div className="relative z-10 max-w-[540px]">
            <div className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium uppercase tracking-[0.18em] text-white/90 backdrop-blur">
              GP Admin Portal
            </div>
            <Title
              level={1}
              className="!mb-5 !font-['Inter'] !text-[42px] !font-semibold !leading-tight !text-white xl:!text-[52px]"
            >
              Quay lai bang dieu khien voi moi thu ban can trong mot noi.
            </Title>
            <Text className="block max-w-[480px] text-lg text-white/80">
              Theo doi lop hoc, quan ly hoc vien va xu ly cong viec hang ngay voi trai nghiem dang nhap gon gang hon.
            </Text>
          </div>

          <div className="relative z-10 overflow-hidden rounded-[32px] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <Text className="block text-sm uppercase tracking-[0.18em] text-white/70">
                  Better flow
                </Text>
                <Text className="text-xl font-semibold text-white">
                  Faster sign-in, clearer next step
                </Text>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <ArrowRightOutlined className="text-lg text-white" />
              </div>
            </div>
            <div className="grid gap-3 pb-5">
              {[
                "Truy cap nhanh vao dashboard va bao cao can theo doi.",
                "Bieu mau gon hon, tap trung vao thao tac dang nhap chinh.",
                "Khung hien thi ro rang de giam cam giac trong va tang do tin cay.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-white/8 px-4 py-3"
                >
                  <CheckCircleFilled className="mt-1 text-[#86efac]" />
                  <Text className="text-base text-white/85">{item}</Text>
                </div>
              ))}
            </div>
            <div className="overflow-hidden rounded-[24px] bg-white/95 p-3">
              <img
                src={LoginHappyStudent}
                alt="GreenPrep admin login"
                className="h-[280px] w-full rounded-[18px] object-cover"
              />
            </div>
          </div>
        </div>
      </Col>

      <Col
        xs={24}
        sm={24}
        md={24}
        lg={12}
        xxl={12}
        className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10 xl:px-14"
      >
        <Card className="w-full max-w-[560px] rounded-[28px] border-0 !bg-white/88 !p-2 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="mb-8 rounded-[24px] bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)] px-6 py-6 sm:px-8">
            <div className="mb-3 inline-flex rounded-full bg-[#003087]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#003087]">
              Welcome back
            </div>
            <Title
              level={1}
              className="!mb-3 !font-['Inter'] !text-[34px] !font-semibold !leading-tight !text-slate-900 sm:!text-[42px]"
            >
              Dang nhap de tiep tuc quan tri GreenPREP
            </Title>
            <Text className="text-base text-slate-500 sm:text-lg">
              Nhap email va mat khau de vao he thong. Giao dien moi uu tien doc nhanh va thao tac it phan tan hon.
            </Text>
          </div>

          {errorMessage && (
            <Alert
              message={errorMessage}
              type="error"
              className="mx-4 mb-6 rounded-2xl sm:mx-6"
              showIcon
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            className="space-y-6 px-4 pb-4 sm:px-6 sm:pb-6"
          >
            <Form.Item
              name="email"
              label={
                <span className="mb-2 text-base font-medium text-slate-700">
                  Email <span className="text-red-500">*</span>
                </span>
              }
              rules={[yupSync(loginSchema)]}
            >
              <Input
                suffix={<MailOutlined className="text-slate-400" />}
                placeholder="Enter your email here"
                size="large"
                className="!h-12 !rounded-2xl !border-slate-200 !bg-slate-50 !px-4 text-base"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="mb-2 text-base font-medium text-slate-700">
                  Password <span className="text-red-500">*</span>
                </span>
              }
              rules={[yupSync(loginSchema)]}
            >
              <Input.Password
                placeholder="********"
                size="large"
                className="!h-12 !rounded-2xl !border-slate-200 !bg-slate-50 !px-4 text-base"
                iconRender={(visible) =>
                  visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <div className="flex items-center justify-between gap-3">
              <Text className="text-sm text-slate-400">
                Secure access for internal operations
              </Text>
              <Link
                to="/forgot-password"
                className="text-base font-medium text-[#003087] hover:text-[#0f4db8]"
              >
                Forgot password?
              </Link>
            </div>

            <Form.Item className="!mb-0 pt-2">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="!h-[54px] !w-full !rounded-2xl !bg-[#003087] text-base font-semibold shadow-[0_18px_40px_rgba(0,48,135,0.22)] hover:!bg-[#0f4db8]"
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
