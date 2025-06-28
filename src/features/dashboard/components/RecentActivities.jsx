import React, { useEffect, useState } from "react";
import { List, Avatar, Tag, Spin } from "antd";
import { fetchRecentActivities } from "../services/dashboardService";
import {
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";

const getActivityIcon = (type) => {
  switch (type) {
    case "user":
      return <UserOutlined />;
    case "class":
      return <BookOutlined />;
    case "submission":
      return <FileTextOutlined />;
    default:
      return <UserOutlined />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "error":
      return "error";
    default:
      return "default";
  }
};

export const RecentActivities = ({ sessionId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await fetchRecentActivities();
      setActivities(data);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <div>
      <List
        itemLayout="horizontal"
        dataSource={activities}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={getActivityIcon(item.type)} />}
              title={item.title}
              description={new Date(item.timestamp).toLocaleString()}
            />
            <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
          </List.Item>
        )}
      />
      Recent activities for session: {sessionId}
    </div>
  );
};

RecentActivities.propTypes = {
  sessionId: PropTypes.string,
};

RecentActivities.defaultProps = {
  sessionId: null,
};
