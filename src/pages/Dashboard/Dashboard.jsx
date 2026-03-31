import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Spin,
  Typography,
  Tabs,
  Select,
  Descriptions,
  Tag,
  Dropdown,
  Space,
  Button,
  Empty,
  Table,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { StatCard } from "../../features/dashboard/components/StatCard";
import { RecentActivities } from "../../features/dashboard/components/RecentActivities";
import { SessionChart } from "../../features/dashboard/components/SessionChart";
import { fetchStudents } from "../../features/dashboard/services/userService";

const { Title, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    totalStudents: 0,
    ongoingSessions: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    totalSubmissions: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchSessions(), fetchStudentsData()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch(
        "https://dev-api-greenprep.onrender.com/api/sessions/all"
      );
      const data = await response.json();
      if (data.status === 200) {
        setSessions(data.data);
        if (data.data.length > 0) {
          setSelectedSession(data.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchStudentsData = async () => {
    try {
      const studentsData = await fetchStudents();
      if (Array.isArray(studentsData)) {
        setStudents(studentsData);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    if (selectedSession) {
      calculateSessionStats();
    }
  }, [selectedSession, sessions]);

  const calculateSessionStats = () => {
    const sessionsByStatus = sessions.reduce((acc, session) => {
      acc[session.status] = (acc[session.status] || 0) + 1;
      return acc;
    }, {});

    setSessionStats({
      totalStudents: students.length,
      ongoingSessions: sessionsByStatus["ON_GOING"] || 0,
      upcomingSessions: sessionsByStatus["NOT_STARTED"] || 0,
      completedSessions: sessionsByStatus["COMPLETE"] || 0,
      totalSubmissions: Math.floor(Math.random() * 100) + 50,
      pendingRequests: Math.floor(Math.random() * 10) + 1,
    });
  };

  const handleSessionChange = (sessionId) => {
    const session = sessions.find((s) => s.ID === sessionId);
    setSelectedSession(session);
  };

  const dropdownItems = sessions.map((session) => ({
    key: session.ID,
    label: (
      <div className="py-2 px-4 hover:bg-gray-100">
        <div className="font-medium">{session.sessionName}</div>
        <div className="text-sm text-gray-500">{session.Classes?.className}</div>
      </div>
    ),
    onClick: () => handleSessionChange(session.ID),
  }));

  const selectedSessionLabel = selectedSession ? (
    <Space>
      <div>
        <div className="font-medium">{selectedSession.sessionName}</div>
        <div className="text-sm text-gray-500">
          {selectedSession.Classes?.className}
        </div>
      </div>
    </Space>
  ) : (
    "Select a session"
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "NOT_STARTED":
        return "blue";
      case "ON_GOING":
        return "green";
      case "COMPLETE":
        return "purple";
      default:
        return "default";
    }
  };

  const sessionChartData = React.useMemo(() => {
    if (!sessions || !Array.isArray(sessions)) return [];

    const counts = {
      Ongoing: 0,
      "Not Started": 0,
      Completed: 0,
    };

    sessions.forEach((session) => {
      switch (session.status) {
        case "ON_GOING":
          counts["Ongoing"]++;
          break;
        case "NOT_STARTED":
          counts["Not Started"]++;
          break;
        case "COMPLETE":
          counts["Completed"]++;
          break;
      }
    });

    return Object.entries(counts)
      .map(([type, value]) => ({
        type,
        value,
      }))
      .filter((item) => item.value > 0);
  }, [sessions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="figma-page-container">
      <div className="figma-content-wrapper">
        <div className="py-8">
          <div className="mb-10 flex justify-between items-start">
            <div>
              <h4 className="figma-title">Dashboard</h4>
              <p className="figma-subtitle">Monitor and organize both classes and individual sessions.</p>
            </div>
            <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
              <Button
                style={{
                  width: "300px",
                  height: "auto",
                  padding: "8px 12px",
                  textAlign: "left",
                  whiteSpace: "normal",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: "8px",
                  border: "1px solid #DFE4EA",
                  boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)"
                }}
              >
                {selectedSessionLabel}
                <DownOutlined />
              </Button>
            </Dropdown>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[30, 30]} className="mb-10">
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<TeamOutlined />}
                title="Total Students"
                value={students.length}
                subtitle="Total registered"
                color="#003087"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<BookOutlined />}
                title="Session Status"
                value={selectedSession?.status || "N/A"}
                subtitle="Current Status"
                color="#22AD5C"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<ClockCircleOutlined />}
                title="Total Sessions"
                value={sessions.length}
                subtitle={`${sessionChartData.find(d => d.type === 'Ongoing')?.value || 0} Ongoing`}
                color="#F2994A"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<FileTextOutlined />}
                title="Completed"
                value={sessionChartData.find(d => d.type === 'Completed')?.value || 0}
                subtitle="Sessions finished"
                color="#9B51E0"
              />
            </Col>
          </Row>

          {/* Charts and Activity Sections */}
          <Row gutter={[30, 30]}>
            <Col xs={24} lg={16}>
              <Card 
                className="h-full rounded-[5px] border-none shadow-[0px_1px_3px_rgba(166,175,195,0.4)]"
                bodyStyle={{ padding: '20px' }}
              >
                <Tabs
                  defaultActiveKey="1"
                  className="figma-custom-tabs"
                  items={[
                    {
                      key: "1",
                      label: "Session Overview",
                      children: (
                        <div className="p-4 flex justify-center">
                          <SessionChart data={sessionChartData} />
                        </div>
                      ),
                    },
                    {
                      key: "2",
                      label: "Recent Activities",
                      children: (
                        <RecentActivities sessionId={selectedSession?.ID} />
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card 
                title={<span className="text-[18px] font-bold">Session Details</span>} 
                className="h-full rounded-[5px] border-none shadow-[0px_1px_3px_rgba(166,175,195,0.4)]"
                bodyStyle={{ padding: '20px' }}
              >
                {selectedSession ? (
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Topic">
                      {selectedSession.Topic?.Name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Session Key">
                      {selectedSession.sessionKey}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={getStatusColor(selectedSession.status)}>
                        {selectedSession.status}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Start">
                      {new Date(selectedSession.startTime).toLocaleDateString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="End">
                      {new Date(selectedSession.endTime).toLocaleDateString()}
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Empty description="Select a session" />
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
