import React, { useEffect, useState } from "react";
import { List, Avatar, Tag, Spin, Empty } from "antd";
import axiosInstance from "@shared/config/axios";
import { fetchGlobalRecentActivities } from "../services/dashboardService";
import {
  UserOutlined,
  ClockCircleOutlined,
  BookOutlined,
  CalendarOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";

const getActivityIcon = (type) => {
  switch (type) {
    case "user":
      return <UserOutlined className="text-blue-500" />;
    case "class":
      return <BookOutlined className="text-green-500" />;
    case "session":
      return <CalendarOutlined className="text-purple-500" />;
    case "exam":
      return <FileProtectOutlined className="text-orange-500" />;
    default:
      return <UserOutlined />;
  }
};

const getBgColor = (type) => {
  switch (type) {
    case "user": return "bg-blue-50";
    case "class": return "bg-green-50";
    case "session": return "bg-purple-50";
    case "exam": return "bg-orange-50";
    default: return "bg-gray-50";
  }
}

export const RecentActivities = ({ sessionId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [sessionId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      if (sessionId) {
        // Session-specific proxy logic
        const response = await axiosInstance.get(`/session-participants/${sessionId}?limit=10`);
        if (response.data.status === 200) {
          const participants = response.data.data.data || [];
          setActivities(participants.map(p => ({
            id: p.ID,
            title: `${p.User?.fullName || 'A student'} joined the session`,
            type: "user",
            status: "Joined",
            timestamp: p.createdAt
          })));
        }
      } else {
        // Global platform activities
        const data = await fetchGlobalRecentActivities();
        setActivities(data);
      }
    } catch (error) {
      console.error("Error loading activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Spin />
      </div>
    );
  }

  return (
    <List
      itemLayout="horizontal"
      dataSource={activities}
      locale={{ emptyText: "No recent activity recorded yet" }}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar icon={getActivityIcon(item.type)} className={getBgColor(item.type)} />}
            title={<span className="font-medium text-[#111928]">{item.title}</span>}
            description={
              <div className="flex items-center gap-2 text-[12px] text-gray-400">
                <ClockCircleOutlined style={{ fontSize: '10px' }} />
                {new Date(item.timestamp).toLocaleString()}
              </div>
            }
          />
          <Tag color="success" className="rounded-full border-none px-3 bg-green-50 text-green-600">
            {item.status || "Active"}
          </Tag>
        </List.Item>
      )}
    />
  );
};

RecentActivities.propTypes = {
  sessionId: PropTypes.string,
};

RecentActivities.defaultProps = {
  sessionId: null,
};
