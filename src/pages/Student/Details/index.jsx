import React, { useState } from "react";
import { Card, Descriptions, Divider, Table, Input, Row, Col } from "antd";
import { useParams } from "react-router-dom";
import { useFetchProfile } from "@features/auth/hooks";

const StudentDetail = () => {
  const { studentId } = useParams();

  const { data } = useFetchProfile(studentId);

  const items = data && [
    {
      key: "1",
      label: "Student name",
      children: data.firstName + " " + data.lastName || "No information",
    },
    {
      key: "2",
      label: "Email",
      children: data.email || "No information",
    },
    {
      key: "3",
      label: "Student ID",
      children: data.studentCode || "No information",
    },
    {
      key: "4",
      label: "Phone",
      children: data.phone || "No information",
    },
    {
      key: "5",
      label: "Class name",
      children: data.class || "No information",
    },
  ];

  const columns = [
    {
      title: "Session Name",
      dataIndex: "sessionName",
      key: "sessionName",
      ellipsis: true,
    },
    {
      title: "Grammar & Vocabulary",
      dataIndex: "grammarVocabulary",
      key: "grammarVocabulary",
      ellipsis: true,
    },
    {
      title: "Listening",
      dataIndex: "listening",
      key: "listening",
      ellipsis: true,
    },
    {
      title: "Reading",
      dataIndex: "reading",
      key: "reading",
      ellipsis: true,
    },
    {
      title: "Speaking",
      dataIndex: "speaking",
      key: "speaking",
      ellipsis: true,
    },
    {
      title: "Writing",
      dataIndex: "writing",
      key: "writing",
      ellipsis: true,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      ellipsis: true,
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      ellipsis: true,
    },
  ];

  const initialData = [
    {
      key: "1",
      sessionName: "SPRING_P1_2025",
      grammarVocabulary: 43,
      listening: 50,
      reading: 46,
      speaking: 3,
      writing: 3,
      total: 3,
      level: "C",
    },
    {
      key: "2",
      sessionName: "FALL_P3_2024",
      grammarVocabulary: 44,
      listening: 23,
      reading: 5,
      speaking: 3,
      writing: 3,
      total: 3,
      level: "B2",
    },
    {
      key: "3",
      sessionName: "FALL_P2_2024",
      grammarVocabulary: 46,
      listening: 23,
      reading: 3,
      speaking: 3,
      writing: 3,
      total: 3,
      level: "B2",
    },
    {
      key: "4",
      sessionName: "FALL_P1_2024",
      grammarVocabulary: 31,
      listening: 24,
      reading: 3,
      speaking: 3,
      writing: 3,
      total: 3,
      level: "B1",
    },
  ];

  const [datat, setData] = useState(initialData);

  const onSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    const filteredData = initialData.filter((item) =>
      item.sessionName.toLowerCase().includes(value)
    );
    setData(filteredData);
  };

  return (
    <>
      {data && (
        <div className="p-8">
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <h2 className="font-bold">Student information</h2>
              <div className="text-gray-500">View student details.</div>
              <Card className="mt-4 p-8">
                <Descriptions column={2} title="" items={items} />
              </Card>
            </Col>
          </Row>
          <Divider />
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <h2 className="font-bold">Assessment History</h2>
              <div className="text-gray-500 mb-4">View student details.</div>
              <Input
                placeholder="Search by session name"
                onChange={onSearchChange}
                style={{ marginBottom: 16, width: "100%", maxWidth: 300 }}
              />
              <Table
                columns={columns}
                dataSource={datat}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
              />
            </Col>
          </Row>
        </div>
      )}
    </>
  );
};

export default StudentDetail;
