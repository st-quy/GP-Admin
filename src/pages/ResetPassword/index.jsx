import { Form, Input, Button, Card, Row, Col, Typography, Layout } from "antd";
import { yupSync } from "@shared/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ForgotPasswordImg } from "@assets/images";
import { useResetPassword } from "@features/auth/hooks";
import { ResetPasswordSchema } from "./schema";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import toast, { Toaster } from "react-hot-toast";

const { Title, Text } = Typography;

const ResetPassword = () => {
  const navigate = useNavigate();
  const { mutate: resetPasswordFunc, isPending } = useResetPassword();
  const [searchParams, setSearchParams] = useSearchParams();

  const onFinish = (values) => {
    if (searchParams.get("token")) {
      resetPasswordFunc(
        {
          token: searchParams.get("token"),
          newPassword: values.password,
        },
        {
          onSuccess: () => {
            toast.success("Password reset successfully!");
            setTimeout(() => {
              navigate("/reset-success");
            }, 2000);
          },
          onError: () => {
            toast.error("Failed to reset password. Please try again.");
          },
        }
      );
    }
  };

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      toast.error("Token not found, please try again");
      navigate("/login");
    }

    const tokenExpiration = jwtDecode(token)?.exp;
    const currentTime = Math.floor(Date.now() / 1000);
    const isTokenExpired = tokenExpiration < currentTime;

    if (!token || isTokenExpired) {
      toast.error("Token expired, please try again");
      navigate("/login");
    }
  }, [searchParams.get("token"), navigate]);

  return (
    <Layout className="bg-[#f9f9f9]">
      <Toaster />
      <Layout.Content className="max-w-[1200px] mx-auto w-full">
        <Row gutter={0} className="h-full">
          <Col
            xs={{ span: 24 }}
            md={{ span: 12 }}
            className="flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-xl shadow-lg p-4 sm:p-8 min-h-[600px]">
              <div className="mt-[30px] w-full">
                <Title
                  level={2}
                  className="font-bold text-4xl lg:text-5xl text-[#111928] mb-2 text-center sm:text-left"
                >
                  Create new password
                </Title>
                <Text className="font-normal text-base text-primaryTextColor block text-center sm:text-left mt-4 mb-8">
                  Your previous password has been reseted. Please set a new
                  password for your account.
                </Text>

                <Form layout="vertical" onFinish={onFinish} className="w-full">
                  <div className="grid grid-cols-1 gap-4 w-full">
                    <Form.Item
                      name="password"
                      label={
                        <span className="text-base lg:text-lg font-medium">
                          Password <span className="text-red-500">*</span>
                        </span>
                      }
                      required={false}
                      rules={[yupSync(ResetPasswordSchema)]}
                    >
                      <Input.Password
                        placeholder="Password"
                        size="large"
                        className="h-12 text-base rounded-lg placeholder:text-[#9CA3AF]"
                        iconRender={(visible) =>
                          visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                        }
                        onCopy={(e) => e.preventDefault()}
                      />
                    </Form.Item>

                    <Form.Item
                      name="passwordConfirmation"
                      label={
                        <span className="text-base lg:text-lg font-medium">
                          Confirm Password{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      }
                      dependencies={["password"]}
                      required={false}
                      rules={[
                        {
                          required: true,
                          message: "Please confirm your password",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("The two passwords do not match")
                            );
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        placeholder="Confirm password"
                        size="large"
                        className="h-12 text-base rounded-lg placeholder:text-[#9CA3AF]"
                        iconRender={(visible) =>
                          visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                        }
                        onCopy={(e) => e.preventDefault()}
                      />
                    </Form.Item>

                    <Form.Item className="mt-2">
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        className="w-full max-w-[250px] h-[50px] rounded-full px-7 py-3 bg-primaryColor mx-auto flex items-center justify-center"
                        loading={isPending}
                      >
                        Submit
                      </Button>
                    </Form.Item>
                  </div>
                </Form>
              </div>
            </Card>
          </Col>

          <Col
            xs={{ span: 0 }}
            md={{ span: 12 }}
            className="flex items-center justify-center"
          >
            <div className="text-center p-4">
              <img
                src={ForgotPasswordImg}
                alt="ResetPassword"
                className="max-w-full h-auto"
              />
            </div>
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  );
};

export default ResetPassword;
