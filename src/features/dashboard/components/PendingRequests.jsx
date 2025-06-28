import React, { useEffect, useState } from "react";
import { List, Button, Avatar, message, Spin } from "antd";
import { CheckOutlined, CloseOutlined, UserOutlined } from "@ant-design/icons";
import {
  fetchPendingRequests,
  approveSessionRequest,
  rejectSessionRequest,
} from "../services/dashboardService";

export const PendingRequests = ({ count }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await fetchPendingRequests();
      setRequests(data);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const success = await approveSessionRequest(requestId);
      if (success) {
        message.success("Request approved successfully");
        loadRequests(); // Reload the list
      } else {
        message.error("Failed to approve request");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      message.error("Failed to approve request");
    }
  };

  const handleReject = async (requestId) => {
    try {
      const success = await rejectSessionRequest(requestId);
      if (success) {
        message.success("Request rejected successfully");
        loadRequests(); // Reload the list
      } else {
        message.error("Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      message.error("Failed to reject request");
    }
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <List
      dataSource={requests}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Button
              type="text"
              icon={<CheckOutlined />}
              className="text-green-500 hover:text-green-600"
              onClick={() => handleApprove(item.id)}
            />,
            <Button
              type="text"
              icon={<CloseOutlined />}
              className="text-red-500 hover:text-red-600"
              onClick={() => handleReject(item.id)}
            />,
          ]}
        >
          <List.Item.Meta
            avatar={<Avatar icon={<UserOutlined />} />}
            title={item.studentName}
            description={`Session: ${item.sessionName}`}
          />
        </List.Item>
      )}
    />
  );
};
