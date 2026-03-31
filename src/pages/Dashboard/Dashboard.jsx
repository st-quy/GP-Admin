import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Spin,
  Typography,
  Tabs,
  Select,
  Tag,
  Button,
  Descriptions,
  message,
} from "antd";
import {
  BookOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  SearchOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { StatCard } from "../../features/dashboard/components/StatCard";
import { RecentActivities } from "../../features/dashboard/components/RecentActivities";
import { SessionChart } from "../../features/dashboard/components/SessionChart";
import { fetchDashboardStats } from "../../features/dashboard/services/dashboardService";
import axiosInstance from "@shared/config/axios";
import { statusOptions } from "@features/classDetail/constant/statusEnum";

const { Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    studentCount: 0,
    activeTesting: 0,
    gradingQueue: 0,
    totalSessions: 0,
  });
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const selectedSession = useMemo(() => 
    sessions.find(s => s.ID === selectedSessionId), 
    [sessions, selectedSessionId]
  );

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [statsData, sessionsRes] = await Promise.all([
        fetchDashboardStats(),
        axiosInstance.get("/sessions/all")
      ]);

      setStats(statsData);

      if (sessionsRes.data.status === 200) {
        const sessionData = sessionsRes.data.data;
        setSessions(sessionData);
        if (sessionData.length > 0) {
          setSelectedSessionId(sessionData[0].ID);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="mb-10 flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h4 className="figma-title">Admin Command Center</h4>
              <p className="figma-subtitle">High-level oversight of platform activity and testing status.</p>
            </div>
            <div className="w-full md:w-[400px]">
              <Text className="block mb-2 text-gray-500 font-medium text-[14px]">Quick Session Lookup</Text>
              <Select
                showSearch
                placeholder="Search by session or class name..."
                className="w-full h-[48px] figma-search-input-select"
                optionFilterProp="children"
                onChange={setSelectedSessionId}
                value={selectedSessionId}
                allowClear
              >
                {sessions.map(s => (
                  <Select.Option key={s.ID} value={s.ID}>
                    {s.sessionName} ({s.Classes?.className || 'No Class'})
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Global Platform Stats */}
          <Row gutter={[30, 30]} className="mb-10">
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<TeamOutlined />}
                title="Total Students"
                value={stats.studentCount}
                subtitle="Platform base"
                color="#003087"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<ClockCircleOutlined />}
                title="Active Testing"
                value={stats.activeTesting}
                subtitle="Sessions ON_GOING"
                color="#22AD5C"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<BookOutlined />}
                title="Grading Queue"
                value={stats.gradingQueue}
                subtitle="Needs publishing"
                color="#F2994A"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<CheckCircleOutlined />}
                title="Total Sessions"
                value={stats.totalSessions}
                subtitle="Platform usage"
                color="#9B51E0"
              />
            </Col>
          </Row>

          <Row gutter={[30, 30]}>
            <Col xs={24} lg={14}>
              <Card 
                title={<span className="text-[18px] font-bold">Platform Overview</span>}
                className="h-full rounded-[5px] border-none shadow-[0px_1px_3px_rgba(166,175,195,0.4)]"
                bodyStyle={{ padding: '20px' }}
              >
                <Tabs
                  defaultActiveKey="1"
                  className="figma-custom-tabs"
                  items={[
                    {
                      key: "1",
                      label: "Session Status",
                      children: (
                        <div className="p-4 flex flex-col items-center">
                          <SessionChart data={sessionChartData} />
                          <div className="mt-4 text-center text-gray-500">
                            Distribution of sessions by their current operational state.
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: "2",
                      label: "Recent Activity",
                      children: (
                        <div className="p-4">
                          <RecentActivities sessionId={selectedSessionId} />
                        </div>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>
            <Col xs={24} lg={10}>
              <Card 
                title={<span className="text-[18px] font-bold">Session Detail Deep-Dive</span>} 
                className="h-full rounded-[5px] border-none shadow-[0px_1px_3px_rgba(166,175,195,0.4)]"
                bodyStyle={{ padding: '20px' }}
              >
                {selectedSession ? (
                  <div className="flex flex-col gap-6">
                    <Descriptions bordered column={1} size="small" className="figma-descriptions">
                      <Descriptions.Item label="Session">{selectedSession.sessionName}</Descriptions.Item>
                      <Descriptions.Item label="Class">{selectedSession.Classes?.className || "N/A"}</Descriptions.Item>
                      <Descriptions.Item label="Key"><span className="font-mono font-bold text-blue-700">{selectedSession.sessionKey}</span></Descriptions.Item>
                      <Descriptions.Item label="Status">
                        <Tag color={statusOptions[selectedSession.status]?.text === "#1C3FB7" ? "blue" : statusOptions[selectedSession.status]?.text === "#1A8245" ? "green" : "default"}>
                          {statusOptions[selectedSession.status]?.label || selectedSession.status}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Start">{new Date(selectedSession.startTime).toLocaleString()}</Descriptions.Item>
                    </Descriptions>
                    <Button 
                      type="primary" 
                      className="figma-primary-btn w-full"
                      href={`/class/${selectedSession.ClassID}/session/${selectedSession.ID}`}
                    >
                      Go to Full Session Details
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-gray-400 gap-4">
                    <SearchOutlined style={{ fontSize: '48px', opacity: 0.2 }} />
                    <p>Select a session from the lookup tool to see specific data.</p>
                  </div>
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
