import { Card, Button, Row, Col, Typography } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const StudentInfoCard = ({
  student,
  onPrevious = () => {},
  onNext = () => {},
  onViewList = () => {},
}) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <Title level={2} className="!mb-3 !font-bold">
          Student information
        </Title>
        <div className="text-[18px] text-primaryTextColor">
          View student details.
        </div>
      </div>

      <Row>
        <Col flex={8}>
          {/* Main Card */}
          <Card className="shadow-sm rounded-lg border border-gray-100 py-5 px-8">
            <Row gutter={[36, 16]}>
              {/* Left Column */}
              <Col xs={24} sm={24} md={12}>
                <div className="grid grid-cols-[110px_1fr] gap-y-4 gap-x-4 text-base text-[#374151]">
                  <div>Student name</div>
                  <div className="font-bold">
                    {student.User?.firstName + " " + student.User?.lastName}
                  </div>

                  <div>Student ID</div>
                  <div className="font-bold">{student.User?.studentCode}</div>

                  <div>Class ID</div>
                  <div className="font-bold">{student.User?.class}</div>
                </div>
              </Col>

              {/* Right Column */}
              <Col xs={24} sm={24} md={12}>
                <div className="grid grid-cols-[110px_1fr] gap-y-4 gap-x-4 text-base text-[#374151]">
                  <div>Email</div>
                  <div className="font-bold">{student.User?.email}</div>

                  <div>Phone</div>
                  <div className="font-bold">{student.User?.phone}</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col
          flex={1}
          className="flex mt-4 lg:mt-0 lg:flex-col items-center justify-between"
        >
          <Button
            icon={<UnorderedListOutlined />}
            shape="round"
            size="large"
            className="flex items-center border-primaryColor text-primaryColor w-[200px] h-[50px]"
            onClick={onViewList}
          >
            Student List
          </Button>
          <div className="flex md:flex-auto lg:flex-col justify-end gap-4">
            <Button
              icon={<LeftOutlined />}
              shape="round"
              size="large"
              className="flex items-center border-primaryColor text-primaryColor w-[200px] h-[50px]"
              onClick={onPrevious}
            >
              Previous Student
            </Button>

            <Button
              type="primary"
              shape="round"
              size="large"
              iconPosition="end"
              icon={<RightOutlined />}
              className="flex items-center bg-primaryColor hover:!bg-blue-800 border-primaryColor w-[200px] h-[50px]"
              onClick={onNext}
            >
              Next Student
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default StudentInfoCard;
