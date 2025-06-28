import React from "react";
import { Card, Typography, Progress } from "antd";
import { Column } from "@ant-design/plots";
import { Pie } from "@ant-design/plots";
import { Line } from "@ant-design/plots";

const { Text } = Typography;

// Modern Column Chart Component
export const ColumnChart = ({ data, title }) => {
  const config = {
    data,
    xField: "type",
    yField: "value",
    label: {
      position: "middle",
      style: {
        fill: "#FFFFFF",
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
  };

  return (
    <Card title={title}>
      <Column {...config} />
    </Card>
  );
};

// Modern Status Chart Component
export const StatusChart = ({ data, title }) => {
  const config = {
    data,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    label: {
      type: "outer",
      content: "{name} {percentage}",
    },
    interactions: [
      {
        type: "element-active",
      },
    ],
  };

  return (
    <Card title={title}>
      <Pie {...config} />
    </Card>
  );
};

export const LineChart = ({ data, title }) => {
  const config = {
    data,
    xField: "date",
    yField: "growth",
    point: {
      size: 5,
      shape: "diamond",
    },
    label: {
      style: {
        fill: "#aaa",
      },
    },
  };

  return (
    <Card title={title}>
      <Line {...config} />
    </Card>
  );
};

export const PieChart = ({ data, title }) => {
  const config = {
    data,
    angleField: "performance",
    colorField: "className",
    radius: 0.8,
    label: {
      type: "outer",
      content: "{name} {percentage}",
    },
    interactions: [
      {
        type: "element-active",
      },
    ],
  };

  return (
    <Card title={title}>
      <Pie {...config} />
    </Card>
  );
};
