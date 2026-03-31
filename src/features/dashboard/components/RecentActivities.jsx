import React, { useEffect, useState } from "react";
import { List, Avatar, Tag, Spin, Empty } from "antd";
import axiosInstance from "@shared/config/axios";
import {
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";

export const RecentActivities = ({ sessionId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      loadActivities();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      // We use session-participants as a proxy for activity since the /activities endpoint is missing
      const response = await axiosInstance.get(`/session-participants/${sessionId}`);
      
      if (response.data.status === 200) {
        const participants = response.data.data.data || [];
        const mappedActivities = participants.map(p => ({
          id: p.ID,
          title: `${p.User?.fullName || 'A student'} joined the session`,
          type: "user",
          status: "success",
          timestamp: p.createdAt
        }));
        setActivities(mappedActivities);
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

  if (!sessionId) {
    return <Empty description="Select a session to view activities" />;
  }

  return (
    <List
      itemLayout="horizontal"
      dataSource={activities}
      locale={{ emptyText: "No recent activity found for this session" }}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />}
            title={<span className="font-medium">{item.title}</span>}
            description={
              <div className="flex items-center gap-2 text-gray-400">
                <ClockCircleOutlined size={12} />
                {new Date(item.timestamp).toLocaleString()}
              </div>
            }
          />
          <Tag color="success">Active</Tag>
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
