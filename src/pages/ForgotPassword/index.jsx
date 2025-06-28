import { Form, Input, Button, Card, Row, Col, Typography } from "antd";
import { yupSync } from "@shared/lib/utils";
import { useNavigate } from "react-router-dom";
import { LeftOutlined, MailOutlined } from "@ant-design/icons";
import { useForgotPassword } from "@features/auth/hooks";
import { emailSchema } from "./schema";

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { mutate: forgotPasswordFunc, isPending } = useForgotPassword();
  const onFinish = (values) => {
    forgotPasswordFunc(
      { ...values, host: window.location.origin },
      {
        onSuccess: () => {
          form.resetFields();
        },
      }
    );
  };
  const [form] = Form.useForm();
  return (
    <Row className="!gap-0 ">
      <Col
        xs={24}
        sm={24}
        md={24}
        lg={12}
        xxl={12}
        className="flex items-center lg:items-start lg:justify-end justify-center px-4 py-6 lg:py-8 lg:pr-8"
      >
        <Card className="w-full max-w-[550px] lg:max-w-[600px] shadow-lg pt-[16px] pb-[120px] px-6 lg:pt-[16px] lg:pb-[160px] lg:px-8">
          <div
            className="mb-4 flex items-center cursor-pointer gap-2 text-[#003087] hover:text-[#003087]/90"
            onClick={() => navigate("/login")}
          >
            <LeftOutlined />
            <span>Back to login</span>
          </div>
          <div className="mb-6">
            <Title
              level={1}
              className="!text-[48px] !text-gray-900 !mb-3 !font-['Inter']"
            >
              Forgot password?
            </Title>
            <Text className="text-gray-500 text-lg">
              Don't worry! Enter your email below to recover your password
            </Text>
          </div>

          <Form layout="vertical" onFinish={onFinish} className="space-y-8">
            <Form.Item
              name="email"
              label={
                <span className="text-base mb-2">
                  Email <span className="text-red-500">*</span>
                </span>
              }
              rules={[yupSync(emailSchema)]}
            >
              <Input
                placeholder="Enter your email here"
                size="large"
                className="h-11 text-base rounded-lg"
                suffix={<MailOutlined className="text-[#dadcdf]" />}
              />
            </Form.Item>

            <Form.Item className="mb-8 flex justify-center">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="!w-[250px] !h-[50px] text-base font-medium !bg-[#003087] hover:!bg-[#003087]/90 rounded-full"
                loading={isPending}
              >
                Reset password
              </Button>
            </Form.Item>
            <div className="mb-32"></div>
          </Form>
        </Card>
      </Col>

      <Col
        xs={24}
        sm={24}
        md={24}
        lg={12}
        xxl={12}
        className="flex items-center lg:justify-start justify-center px-4 lg:pt-2 lg:pl-8 mt-8 lg:mt-0"
      >
        {/* <img
          src={ForgotPasswordLion}
          alt="ForgotPassword"
          className="w-full max-w-[500px] lg:max-w-[600px] h-auto object-contain"
        /> */}
      </Col>
    </Row>
  );
};
export default ForgotPassword;
