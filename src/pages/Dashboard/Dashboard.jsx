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
  Space,
  Button,
  Empty,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  SearchOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { fetchStudents } from "../../features/dashboard/services/userService";
import { StatCard } from "../../features/dashboard/components/StatCard";
import { RecentActivities } from "../../features/dashboard/components/RecentActivities";
import { SessionChart } from "../../features/dashboard/components/SessionChart";
import { statusOptions } from "../../features/classDetail/constant/statusEnum";

const { Title, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [searchValue, setSearchValue] = useState("");
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
          setSelectedSessionId(data.data[0].ID);
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
        setSessionStats((prev) => ({
          ...prev,
          totalStudents: studentsData.length,
        }));
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    if (selectedSessionId) {
      const session = sessions.find((s) => s.ID === selectedSessionId);
      setSelectedSession(session);
    }
  }, [selectedSessionId, sessions]);

  useEffect(() => {
    if (selectedSession) {
      calculateSessionStats();
    }
  }, [selectedSession]);

  const calculateSessionStats = () => {
    const sessionsByStatus = sessions.reduce((acc, session) => {
      acc[session.status] = (acc[session.status] || 0) + 1;
      return acc;
    }, {});

    setSessionStats({
      totalStudents: selectedSession?.Classes?.className
        ? Math.floor(Math.random() * 30) + 20
        : 0,
      ongoingSessions: sessionsByStatus["ON_GOING"] || 0,
      upcomingSessions: sessionsByStatus["NOT_STARTED"] || 0,
      completedSessions: sessionsByStatus["COMPLETE"] || 0,
      totalSubmissions: Math.floor(Math.random() * 100) + 50,
      pendingRequests: Math.floor(Math.random() * 10) + 1,
    });
  };

  const handleSearch = (value) => {
    setSearchValue(value);
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
        default:
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

  const stats = {
    studentCount: students.length,
    activeTesting: sessionStats.ongoingSessions,
    gradingQueue: sessionStats.pendingRequests,
    totalSessions: sessions.length,
    totalClasses: Array.from(new Set(sessions.map((s) => s.ClassID))).length,
    totalExams: 24,
    totalQuestionBank: 156,
  };

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
              <h4 className="figma-title">Admin Dashboard</h4>
              <p className="figma-subtitle">
                High-level oversight of platform activity and testing status.
              </p>
            </div>
            <div className="w-full md:w-[400px]">
              <Text className="block mb-2 text-gray-500 font-medium text-[14px]">
                Quick Session Lookup
              </Text>
              <Select
                showSearch
                placeholder="Search by session or class name..."
                className="w-full h-[48px] figma-search-input-select"
                options={sessions.map((s) => ({
                  value: s.ID,
                  label: `${s.sessionName} (${s.Classes?.className || "No Class"})`,
                }))}
                onChange={setSelectedSessionId}
                onSearch={handleSearch}
                searchValue={searchValue}
                value={selectedSessionId}
                allowClear
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>
          </div>

          {/* Platform Stats Row 1 */}
          <Row gutter={[30, 30]} className="mb-8">
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<TeamOutlined />}
                title="Total Students"
                value={stats.studentCount}
                subtitle="All registered students"
                color="#003087"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<ClockCircleOutlined />}
                title="Active Testing"
                value={stats.activeTesting}
                subtitle="Currently active sessions"
                color="#22AD5C"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<BookOutlined />}
                title="Grading Queue"
                value={stats.gradingQueue}
                subtitle="Exams awaiting review"
                color="#F2994A"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<CheckCircleOutlined />}
                title="Total Sessions"
                value={stats.totalSessions}
                subtitle="All-time sessions"
                color="#9B51E0"
              />
            </Col>
          </Row>

          {/* Platform Stats Row 2 */}
          <Row gutter={[30, 30]} className="mb-10">
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<BookOutlined />}
                title="Total Classes"
                value={stats.totalClasses}
                subtitle="Active classes"
                color="#003087"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<FileTextOutlined />}
                title="Total Exams"
                value={stats.totalExams}
                subtitle="Exam papers"
                color="#22AD5C"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<SearchOutlined />}
                title="Question Bank"
                value={stats.totalQuestionBank}
                subtitle="Pools"
                color="#F2994A"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <StatCard
                icon={<ClockCircleOutlined />}
                title="Coming Soon"
                value="---"
                subtitle="Historical data"
                color="#9B51E0"
              />
            </Col>
          </Row>

          <Row gutter={[30, 30]}>
            <Col xs={24} lg={14}>
              <Card
                title={
                  <span className="text-[18px] font-bold">
                    Platform Overview
                  </span>
                }
                className="h-full rounded-[5px] border-none shadow-[0px_1px_3px_rgba(166,175,195,0.4)]"
                bodyStyle={{ padding: "20px" }}
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
                            Distribution of sessions by their current status.
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
                title={
                  <span className="text-[18px] font-bold">
                    Session Overview
                  </span>
                }
                className="h-full rounded-[5px] border-none shadow-[0px_1px_3px_rgba(166,175,195,0.4)]"
                bodyStyle={{ padding: "20px" }}
              >
                {selectedSession ? (
                  <div className="flex flex-col gap-6">
                    <Descriptions
                      bordered
                      column={1}
                      size="small"
                      className="figma-descriptions"
                    >
                      <Descriptions.Item label="Session">
                        {selectedSession.sessionName}
                      </Descriptions.Item>
                      <Descriptions.Item label="Class">
                        {selectedSession.Classes?.className || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Key">
                        <span className="font-mono font-bold text-blue-700">
                          {selectedSession.sessionKey}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Status">
                        <Tag
                          color={
                            statusOptions[selectedSession.status]?.text ===
                            "#1C3FB7"
                              ? "blue"
                              : statusOptions[selectedSession.status]?.text ===
                                  "#1A8245"
                                ? "green"
                                : "default"
                          }
                        >
                          {statusOptions[selectedSession.status]?.label ||
                            selectedSession.status}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Start">
                        {new Date(selectedSession.startTime).toLocaleString()}
                      </Descriptions.Item>
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
                    <SearchOutlined
                      style={{ fontSize: "48px", opacity: 0.2 }}
                    />
                    <p>
                      Select a session from the lookup tool to see specific
                      data.
                    </p>
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
