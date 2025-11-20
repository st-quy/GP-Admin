// src/components/QuestionTable.jsx
import React, { useState } from "react";
import { Table, Checkbox, Button } from "antd";

const mockData = [
  { id: 1, question: "Describe the picture…" },
  { id: 2, question: "What do you think about…" },
  { id: 3, question: "Look at this person…" },
  { id: 4, question: "Explain your opinion…" },
];

export default function TableQuestion({ onSelect }) {
  const [selectedKeys, setSelectedKeys] = useState([]);

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    onChange: (keys) => setSelectedKeys(keys),
  };

  const handleSelect = () => {
    const selectedQuestions = mockData.filter((q) =>
      selectedKeys.includes(q.id)
    );
    onSelect(selectedQuestions); // trả về danh sách đã chọn
  };

  const columns = [
    {
      title: "Select",
      dataIndex: "id",
      key: "select",
      render: (id) => (
        <Checkbox
          checked={selectedKeys.includes(id)}
          onChange={(e) => {
            const newKeys = e.target.checked
              ? [...selectedKeys, id]
              : selectedKeys.filter((key) => key !== id);
            setSelectedKeys(newKeys);
          }}
        />
      ),
    },
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
    },
  ];

  return (
    <div>
      <Table
        rowKey="id"
        dataSource={mockData}
        columns={columns}
        pagination={false}
      />
      <div className="flex justify-end mt-3">
        <Button onClick={handleSelect} type="primary">
          Select
        </Button>
      </div>
    </div>
  );
}
