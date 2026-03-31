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
      setActivities([]);
    }
  }, [sessionId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      // Fetch latest 10 participants as 'recent activities'
      const response = await axiosInstance.get(`/session-participants/${sessionId}?limit=10`);
      
      if (response.data.status === 200) {
        const participants = response.data.data.data || [];
        const mappedActivities = participants.map(p => ({
          id: p.ID,
          title: `${p.User?.fullName || 'A student'} joined the session`,
          subtitle: `Student ID: ${p.User?.studentCode || 'N/A'}`,
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
    return (
      <div className="flex flex-col items-center justify-center p-10 text-gray-400">
        <UserOutlined style={{ fontSize: '32px', opacity: 0.3 }} className="mb-4" />
        <p>Select a session to view recent student participation</p>
      </div>
    );
  }

  return (
    <List
      itemLayout="horizontal"
      dataSource={activities}
      locale={{ emptyText: "No student activity recorded for this session yet" }}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar icon={<UserOutlined />} className="bg-blue-50 text-blue-500" />}
            title={<span className="font-medium text-[#111928]">{item.title}</span>}
            description={
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">{item.subtitle}</span>
                <div className="flex items-center gap-2 text-[12px] text-gray-400">
                  <ClockCircleOutlined style={{ fontSize: '10px' }} />
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            }
          />
          <Tag color="success" className="rounded-full border-none px-3 bg-green-50 text-green-600">Joined</Tag>
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
