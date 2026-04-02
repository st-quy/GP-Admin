import React from "react";
import { Card, Typography } from "antd";

const { Text, Title } = Typography;

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
      className={`h-[164px] rounded-[5px] border-none bg-white shadow-[0px_1px_3px_rgba(166,175,195,0.4)] transition-all duration-300 ${className}`}
      bodyStyle={{ padding: "20px" }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-[14px] mb-4">
          <div 
            className="flex h-[50px] w-[50px] items-center justify-center rounded-[3px]"
            style={{ backgroundColor: `${color}14` }}
          >
            {React.cloneElement(icon, { 
              style: { fontSize: '26px', color: color } 
            })}
          </div>
          <Text className="text-[16px] font-medium leading-[24px] text-[#111928]">
            {title}
          </Text>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-[24px] font-bold leading-[30px] text-[#111928]">
            {value}
          </span>
          {subtitle && (
            <Text className="text-[14px] font-normal text-[#637381]">{subtitle}</Text>
          )}
        </div>
      </div>
    </Card>
  );
};
