import React from "react";
import { Card, Typography } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const getBackgroundColor = (color) => {
  switch (color) {
    case "#1890ff": // Blue
      return "bg-[#1a5fb4] hover:bg-[#1552a0]";
    case "#52c41a": // Green
      return "bg-[#2ec27e] hover:bg-[#26a96c]";
    case "#faad14": // Orange
      return "bg-[#e66100] hover:bg-[#cc5500]";
    case "#722ed1": // Purple
      return "bg-[#813d9c] hover:bg-[#613583]";
    default:
      return "bg-[#1a5fb4] hover:bg-[#1552a0]";
  }
};

export const StatCard = ({
  icon,
  title,
  value,
  subtitle = "",
  color = "#1890ff",
  trend = 0,
  className = "",
}) => {
  const bgColor = getBackgroundColor(color);

  return (
    <Card
      className={`h-full rounded-3xl border-none ${bgColor} transition-all duration-300 ${className}`}
      bodyStyle={{ padding: "1.5rem" }}
    >
      <div className="flex flex-col text-white">
        <div className="flex items-center justify-between mb-4">
          <Text className="text-white text-lg font-medium">{title}</Text>
          <div className="flex-shrink-0 p-2 bg-white/20 rounded-xl">{icon}</div>
        </div>
        <div className="flex flex-col gap-1">
          <Title level={2} style={{ color: "white", margin: 0 }}>
            {value}
          </Title>
          {subtitle && (
            <Text className="text-white/80 text-sm">{subtitle}</Text>
          )}
        </div>
      </div>
    </Card>
  );
};
