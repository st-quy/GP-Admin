import React, { useState, useEffect } from "react";
import { Card, Descriptions, Divider, Table, Input, Row, Col, Spin } from "antd";
import { useParams } from "react-router-dom";
import { useFetchProfile, useStudentAssessmentHistory } from "@features/auth/hooks";

const StudentDetail = () => {
  const { studentId } = useParams();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: profileData, isLoading: isProfileLoading } = useFetchProfile(studentId);

  const { data: historyData, isLoading: isHistoryLoading } = useStudentAssessmentHistory(studentId, {
    page,
    limit: pageSize,
    searchKeyword: debouncedSearch,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchKeyword);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const items = profileData && [
    {
      key: "1",
      label: "Student name",
      children: profileData.firstName + " " + profileData.lastName || "No information",
    },
    {
      key: "2",
      label: "Email",
      children: profileData.email || "No information",
    },
    {
      key: "3",
      label: "Student ID",
      children: profileData.studentCode || "No information",
    },
    {
      key: "4",
      label: "Phone",
      children: profileData.phone || "No information",
    },
    {
      key: "5",
      label: "Class name",
      children: profileData.class || "No information",
    },
  ];

  const columns = [
    {
      title: "Session Name",
      dataIndex: "sessionName",
      key: "sessionName",
      ellipsis: true,
      render: (_, record) => record.Session?.sessionName || "-",
    },
    {
      title: "Grammar & Vocabulary",
      dataIndex: "GrammarVocabulary",
      key: "GrammarVocabulary",
      ellipsis: true,
      render: (val) => val ?? "-",
    },
    {
      title: "Listening",
      dataIndex: "Listening",
      key: "Listening",
      ellipsis: true,
      render: (val) => val ?? "-",
    },
    {
      title: "Reading",
      dataIndex: "Reading",
      key: "Reading",
      ellipsis: true,
      render: (val) => val ?? "-",
    },
    {
      title: "Speaking",
      dataIndex: "Speaking",
      key: "Speaking",
      ellipsis: true,
      render: (val) => val ?? "-",
    },
    {
      title: "Writing",
      dataIndex: "Writing",
      key: "Writing",
      ellipsis: true,
      render: (val) => val ?? "-",
    },
    {
      title: "Total",
      dataIndex: "Total",
      key: "Total",
      ellipsis: true,
      render: (val) => val ?? "-",
    },
    {
      title: "Level",
      dataIndex: "Level",
      key: "Level",
      ellipsis: true,
      render: (val) => val ?? "-",
    },
  ];

  const tableData = historyData?.data || [];
  const pagination = historyData?.pagination || { totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 };

  if (isProfileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {profileData && (
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
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ marginBottom: 16, width: "100%", maxWidth: 300 }}
              />
              <Table
                columns={columns}
                dataSource={tableData}
                loading={isHistoryLoading}
                rowKey="ID"
                scroll={{ x: 800 }}
                pagination={{
                  current: pagination.currentPage,
                  pageSize: pagination.pageSize,
                  total: pagination.totalItems,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                  onChange: (newPage, newPageSize) => {
                    setPage(newPage);
                    setPageSize(newPageSize);
                  },
                  itemRender: (current, type, originalElement) => {
                    if (type === 'prev' || type === 'next') {
                      return <span className="cursor-pointer px-2">{originalElement}</span>;
                    }
                    return originalElement;
                  }
                }}
              />
            </Col>
          </Row>
        </div>
      )}
    </>
  );
};

export default StudentDetail;
