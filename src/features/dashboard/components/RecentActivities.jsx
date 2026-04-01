import React, { useEffect, useState, useRef, useCallback } from "react";
import { List, Avatar, Tag, Spin, Button } from "antd";
import { fetchGlobalRecentActivities } from "../services/dashboardService";
import {
  UserOutlined,
  ClockCircleOutlined,
  BookOutlined,
  CalendarOutlined,
  FileProtectOutlined,
  QuestionCircleOutlined,
  PartitionOutlined,
  AppstoreOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";

const PAGE_SIZE = 15;
const REFRESH_INTERVAL = 60_000;

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
    case "question":
      return <QuestionCircleOutlined className="text-cyan-500" />;
    case "part":
      return <PartitionOutlined className="text-pink-500" />;
    case "section":
      return <AppstoreOutlined className="text-yellow-500" />;
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
    case "question": return "bg-cyan-50";
    case "part": return "bg-pink-50";
    case "section": return "bg-yellow-50";
    default: return "bg-gray-50";
  }
}

const getStatusTag = (status) => {
  const config = {
    Created: { color: "success", icon: <PlusOutlined /> },
    Updated: { color: "processing", icon: <EditOutlined /> },
    Deleted: { color: "error", icon: <DeleteOutlined /> },
    Joined: { color: "success", icon: <UserOutlined /> },
    Active: { color: "success", icon: <UserOutlined /> },
  };
  const { color, icon } = config[status] || { color: "default", icon: null };
  const colorMap = {
    success: "bg-green-50 text-green-600",
    processing: "bg-blue-50 text-blue-600",
    error: "bg-red-50 text-red-600",
    default: "bg-gray-50 text-gray-600",
  };
  return (
    <Tag className={`rounded-full border-none px-3 ${colorMap[color]}`}>
      {icon} {status}
    </Tag>
  );
};

export const RecentActivities = ({ sessionId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const intervalRef = useRef(null);

  const fetchPage = useCallback(async (currentOffset, append = false) => {
    try {
      const result = await fetchGlobalRecentActivities(currentOffset, PAGE_SIZE);
      if (append) {
        setActivities((prev) => [...prev, ...result.data]);
      } else {
        setActivities(result.data);
      }
      setHasMore(result.pagination.hasMore);
      setTotalCount(result.pagination.total);
      setOffset(currentOffset + result.data.length);
    } catch (error) {
      console.error("Error loading activities:", error);
      if (!append) setActivities([]);
    }
  }, []);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setOffset(0);
    await fetchPage(0, false);
    setLoading(false);
  }, [fetchPage]);

  const loadMore = async () => {
    setLoadingMore(true);
    await fetchPage(offset, true);
    setLoadingMore(false);
  };

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    intervalRef.current = setInterval(loadActivities, REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [loadActivities]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Spin />
      </div>
    );
  }

  return (
    <div>
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
            {getStatusTag(item.status)}
          </List.Item>
        )}
      />
      <div className="flex items-center justify-between mt-3 px-2">
        <span className="text-xs text-gray-400">
          {totalCount > 0 && `Showing ${activities.length} of ${totalCount} records`}
        </span>
        <div className="flex gap-2">
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={loadActivities}
            loading={loading}
          >
            Refresh
          </Button>
          {hasMore && (
            <Button
              size="small"
              type="link"
              loading={loadingMore}
              onClick={loadMore}
            >
              Load more
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

RecentActivities.propTypes = {
  sessionId: PropTypes.string,
};

RecentActivities.defaultProps = {
  sessionId: null,
};
