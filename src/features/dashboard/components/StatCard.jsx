import React from "react";
import { Card, Typography } from "antd";

const { Text } = Typography;

export const StatCard = ({
  icon,
  title,
  value,
  subtitle = "",
  color = "#003087",
  className = "",
}) => {
  return (
    <Card
      className={`h-[164px] w-full rounded-[12px] border border-[#E5E7EB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-all duration-300 ${className}`}
      bodyStyle={{ padding: 0, height: '100%' }}
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex flex-col justify-center">
          <Text className="text-[14px] font-medium leading-[20px] text-[#4B5563]">
            {title}
          </Text>
          <span className="text-[24px] font-bold leading-[32px] text-[#4B5563]">
            {value}
          </span>
          {subtitle && (
            <Text className="text-[12px] font-normal text-[#6B7280]">{subtitle}</Text>
          )}
        </div>
        <div 
          className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] flex-shrink-0"
          style={{ backgroundColor: `${color}14` }}
        >
          {React.cloneElement(icon, { 
            style: { fontSize: '24px', color: color } 
          })}
        </div>
      </div>
    </Card>
  );
};
