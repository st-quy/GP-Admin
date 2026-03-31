import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Spin,
  Typography,
  Tabs,
  Tag,
  Dropdown,
  Space,
  Button,
  Empty,
  Descriptions,
  message,
} from "antd";
import {
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
import axiosInstance from "@shared/config/axios";
import { statusOptions } from "@features/classDetail/constant/statusEnum";

const { Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, studentsData] = await Promise.all([
        axiosInstance.get("/sessions/all"),
        fetchStudents()
      ]);

      if (sessionsRes.data.status === 200) {
        const sessionData = sessionsRes.data.data;
        setSessions(sessionData);
        if (sessionData.length > 0) {
          setSelectedSession(sessionData[0]);
        }
      }
      
      if (Array.isArray(studentsData)) {
        setStudents(studentsData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
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
        <div className="text-sm text-gray-500">{session.Classes?.className || "No Class"}</div>
      </div>
    ),
    onClick: () => handleSessionChange(session.ID),
  }));

  const selectedSessionLabel = selectedSession ? (
    <Space>
      <div className="text-left">
        <div className="font-medium">{selectedSession.sessionName}</div>
        <div className="text-sm text-gray-500">
          {selectedSession.Classes?.className || "No Class"}
        </div>
      </div>
    </Space>
  ) : (
    "Select a session"
  );

  const sessionChartData = useMemo(() => {
    const counts = {
      "Ongoing": 0,
      "Not Started": 0,
      "Completed": 0,
    };

    sessions.forEach((session) => {
      if (session.status === "ON_GOING") counts["Ongoing"]++;
      else if (session.status === "NOT_STARTED") counts["Not Started"]++;
      else if (session.status === "COMPLETE") counts["Completed"]++;
    });

    return Object.entries(counts)
      .map(([type, value]) => ({ type, value }))
      .filter((item) => item.value > 0);
  }, [sessions]);

  const ongoingCount = useMemo(() => sessions.filter(s => s.status === "ON_GOING").length, [sessions]);
  const completedCount = useMemo(() => sessions.filter(s => s.status === "COMPLETE").length, [sessions]);

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
                  minWidth: "300px",
                  height: "auto",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #DFE4EA",
                  boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)"
                }}
                className="flex items-center justify-between"
              >
                {selectedSessionLabel}
                <DownOutlined className="ml-4 text-gray-400" />
              </Button>
            </Dropdown>
          </div>

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
                value={statusOptions[selectedSession?.status]?.label || "N/A"}
                subtitle="Current Status"
                color="#22AD5C"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<ClockCircleOutlined />}
                title="Total Sessions"
                value={sessions.length}
                subtitle={`${ongoingCount} Ongoing`}
                color="#F2994A"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<FileTextOutlined />}
                title="Completed"
                value={completedCount}
                subtitle="Sessions finished"
                color="#9B51E0"
              />
            </Col>
          </Row>

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
                        <div className="p-4">
                          <RecentActivities sessionId={selectedSession?.ID} />
                        </div>
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
                      {selectedSession.Topic?.Name || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Session Key">
                      {selectedSession.sessionKey}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={statusOptions[selectedSession.status]?.text === "#1C3FB7" ? "blue" : statusOptions[selectedSession.status]?.text === "#1A8245" ? "green" : "default"}>
                        {statusOptions[selectedSession.status]?.label || selectedSession.status}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Start">
                      {new Date(selectedSession.startTime).toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="End">
                      {new Date(selectedSession.endTime).toLocaleString()}
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
