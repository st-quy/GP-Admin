// LocalPointsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Table } from "antd";

const STORAGE_KEYS = {
  listening: "listening_points",
  reading: "readingPoints",
  grammar: "grammarPoints",
};

const LocalPointsPage = () => {
  const [points, setPoints] = useState({
    listening: null,
    reading: null,
    grammar: null,
  });

  useEffect(() => {
    const safeParseNumber = (value) => {
      if (value === null || value === undefined) return null;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : parsed;
    };

    const listeningRaw = localStorage.getItem(STORAGE_KEYS.listening);
    const readingRaw = localStorage.getItem(STORAGE_KEYS.reading);
    const grammarRaw = localStorage.getItem(STORAGE_KEYS.grammar);

    setPoints({
      listening: safeParseNumber(listeningRaw),
      reading: safeParseNumber(readingRaw),
      grammar: safeParseNumber(grammarRaw),
    });
  }, []);

  const dataSource = useMemo(
    () => [
      {
        key: "listening",
        skill: "Listening",
        points: points.listening,
      },
      {
        key: "reading",
        skill: "Reading",
        points: points.reading,
      },
      {
        key: "grammar",
        skill: "Grammar & Vocabulary",
        points: points.grammar,
      },
    ],
    [points]
  );

  const columns = [
    {
      title: "SKILL",
      dataIndex: "skill",
      key: "skill",
      width: "260px",
      render: (text) => (
        <span className="font-[600] text-[#1D2939]">{text}</span>
      ),
    },
    {
      title: "POINTS",
      dataIndex: "points",
      key: "points",
      width: "120px",
      render: (value) => (
        <span>{value || value === 0 ? value : "No Data"}</span>
      ),
    },
  ];

  return (
    <div className="w-full">
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        className="border border-gray-200 pagination w-full p-0 m-0 overflow-x-auto bg-none"
        rowClassName="text-center"
        scroll={{ x: 480 }}
        components={{
          header: {
            wrapper: (props) => (
              <thead
                {...props}
                className={`bg-tableHeadColor text-primaryTextColor`}
              />
            ),
            cell: (props) => (
              <th
                {...props}
                className={` bg-[#E6F0FA] text-[10px] font-[700] md:text-[16px] text-[#637381] tracking-wider text-center !py-4 px-0 whitespace-nowrap `}
              />
            ),
          },
          body: {
            cell: (props) => (
              <td
                {...props}
                className={`font-[500] tracking-wider text-center py-4 px-0 whitespace-nowrap text-[10px] md:text-[14px] text-[#637381] ${
                  props.className || ""
                }`}
              />
            ),
          },
        }}
      />
    </div>
  );
};

export default LocalPointsPage;
