import React from "react";
import { Pie } from "@ant-design/plots";
import PropTypes from "prop-types";

export const SessionChart = ({ data }) => {
  const chartData = React.useMemo(() => {
    return (
      data?.map((item) => ({
        ...item,
        value: Number(item.value) || 0,
      })) || []
    );
  }, [data]);

  const config = {
    data: chartData,
    angleField: "value",
    colorField: "type",
    radius: 1,
    innerRadius: 0.6,
    pieStyle: {
      lineWidth: 0,
    },
    label: {
      type: "inner",
      offset: "-50%",
      content: "{value}",
      style: {
        fill: "#fff",
        fontSize: 14,
        textAlign: "center",
      },
    },
    legend: {
      position: "bottom",
      layout: "horizontal",
    },
    tooltip: {
      formatter: (datum) => {
        if (!datum?.value) return null;
        return {
          name: datum.type,
          value: `${datum.value} sessions`,
        };
      },
      customContent: (title, items) => {
        if (!items?.[0]?.data) return null;
        const { type, value } = items[0].data;
        return (
          <div style={{ padding: "8px 12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#4B535E",
                fontSize: "14px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: items[0].color,
                }}
              />
              <span>{type}:</span>
              <span style={{ fontWeight: "bold" }}>{value}</span>
            </div>
          </div>
        );
      },
    },
    statistic: {
      title: {
        style: {
          fontSize: "14px",
          color: "#4B535E",
        },
        content: "Total",
      },
      content: {
        style: {
          fontSize: "24px",
          color: "#4B535E",
          fontWeight: 600,
        },
        content: chartData
          .reduce((sum, item) => sum + (item.value || 0), 0)
          .toString(),
      },
    },
    color: ["#52c41a", "#1890ff", "#722ed1"],
    interactions: [
      {
        type: "element-active",
      },
    ],
  };

  if (!chartData.length) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-gray-500">
        No session data available
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] flex items-center justify-center">
      <Pie {...config} />
    </div>
  );
};

SessionChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ),
};

SessionChart.defaultProps = {
  data: [],
};
