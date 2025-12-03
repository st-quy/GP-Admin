// @ts-nocheck
import React, { useMemo, useState } from "react";
import {
  Card,
  Table,
  Input,
  Select,
  Pagination,
  Space,
  Button,
  Typography,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import HeaderInfo from "@app/components/HeaderInfo";
import { useNavigate } from "react-router-dom";
import { useGetTopics, useDeleteTopic, useDeleteTopicSectionByTopicId } from "../../features/topic/hooks";
import useConfirm from "@shared/hook/useConfirm";

const { Option } = Select;
const { Text } = Typography;

const statusTagConfig = {
  Pending: { bg: "bg-gray-100", text: "text-gray-700", label: "Pending" },
  Approved: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Approved" },
  "Needs Revision": { bg: "bg-amber-100", text: "text-amber-700", label: "Needs Revision" },
  Closed: { bg: "bg-rose-100", text: "text-rose-700", label: "Closed" },
};

const TopicListPage = () => {
  const navigate = useNavigate();
  const { openConfirmModal, ModalComponent } = useConfirm();

  const { data: topics = [], isLoading } = useGetTopics();
  const deleteTopic = useDeleteTopic();
  const deleteTopicSectionsByTopicId = useDeleteTopicSectionByTopicId();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredData = useMemo(() => {
    return topics.filter((item) => {
      const matchSearch = item?.Name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' ? true : item.Status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [topics, search, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const totalItems = filteredData.length;
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const counts = useMemo(() => ({
    pending: topics.filter((t) => t.Status === "Pending").length,
    approved: topics.filter((t) => t.Status === "Approved").length,
    needs: topics.filter((t) => t.Status === "Needs Revision").length,
    closed: topics.filter((t) => t.Status === "Closed").length,
  }), [topics]);

  const handleDeleteTopic = (topic) => {
    openConfirmModal({
      title: 'Are you sure you want to delete this topic?',
      message: 'After deleting this topic it will no longer appear.',
      okText: 'Delete',
      okButtonColor: '#FF4D4F',
      onConfirm: async () => {
        try {
      await deleteTopicSectionsByTopicId.mutateAsync(topic.ID);

      await deleteTopic.mutateAsync(topic.ID);

      message.success("Topic and its TopicSections deleted successfully");
    } catch (error) {
      console.error(error);
      message.error("Failed to delete topic or its Sections");
    }
      },
    });
  };

  const columns = [
    {
      title: "Topic Name",
      dataIndex: "Name",
      key: "Name",
      render: (text) => <span className="font-medium text-gray-800">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
      render: (status) => {
        const cfg = statusTagConfig[status] || { bg: "bg-gray-200", text: "text-gray-600", label: status };
        return (
          <span className={`inline-flex items-center rounded-full text-base font-medium ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      title: "Creator",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (text) => <span className="font-medium text-gray-800">{text}</span>,
    },
    {
      title: "Creation day",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => <span className="text-gray-500 text-sm">{new Date(date).toLocaleDateString()}</span>,
    },
    {
      title: "Update date",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => <span className="text-gray-500 text-sm">{new Date(date).toLocaleDateString()}</span>,
    },
    {
      title: "Updator",
      dataIndex: "updatedBy",
      key: "updatedBy",
      render: (text) => <span className="font-medium text-gray-800">{text}</span>,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/topics/${record.ID}`);
            }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-[#1890FF]"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/topics/edit/${record.ID}`);
            }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            className="text-[#FF4D4F]"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTopic(record);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <ModalComponent />
      <HeaderInfo
        title="Topic List"
        subtitle="Manage and track all topics"
        SubAction={
          <Button
            className="w-full p-5 bg-white text-black border border-gray-300 hover:!bg-gray-100 rounded-lg shadow-sm"
            onClick={() => navigate("create")}
          >
            Create New Topic
          </Button>
        }
      />

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-none">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-500 text-sm">Pending</div>
                  <div className="text-2xl font-semibold mt-1">{counts.pending}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <ClockCircleOutlined className="text-gray-500" />
                </div>
              </div>
            </Card>
            <Card className="shadow-sm border-none">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-emerald-500 text-sm">Approved</div>
                  <div className="text-2xl font-semibold mt-1">{counts.approved}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircleOutlined className="text-emerald-500" />
                </div>
              </div>
            </Card>
            <Card className="shadow-sm border-none">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-amber-500 text-sm">Needs Revision</div>
                  <div className="text-2xl font-semibold mt-1">{counts.needs}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <ExclamationCircleOutlined className="text-amber-500" />
                </div>
              </div>
            </Card>
            <Card className="shadow-sm border-none">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-rose-500 text-sm">Closed</div>
                  <div className="text-2xl font-semibold mt-1">{counts.closed}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                  <CloseCircleOutlined className="text-rose-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Table & Filters */}
          <Card className="shadow-sm border-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <Input
                allowClear
                className="sm:max-w-xs"
                placeholder="Search topic name..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
              <Select
                className="w-40"
                value={statusFilter}
                onChange={(val) => {
                  setPage(1);
                  setStatusFilter(val);
                }}
              >
                <Option value="all">All Statuses</Option>
                <Option value="submited">submited</Option>
                <Option value="draft">draft</Option>
                <Option value="approved">approved</Option>
                <Option value="rejected">rejected</Option>
              </Select>
            </div>

            <Table
              rowKey="ID"
              columns={columns}
              dataSource={paginatedData}
              pagination={false}
              rowClassName="hover:bg-gray-50 cursor-pointer"
              onRow={(record) => ({
                onClick: () => navigate(`/topics/${record.ID}`),
              })}
            />

            {/* Custom Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 p-4 border-t border-gray-100">
              <Text className="text-gray-500">
                {totalItems === 0
                  ? 'No data'
                  : `Showing ${startItem}–${endItem} of ${totalItems}`}
              </Text>
              <div className="flex items-center gap-4">
                <Pagination
                  current={page}
                  total={totalItems}
                  pageSize={pageSize}
                  showSizeChanger={false}
                  onChange={(p) => setPage(p)}
                />
                <Select
                  className="w-[120px]"
                  value={String(pageSize)}
                  onChange={(val) => {
                    setPageSize(Number(val));
                    setPage(1);
                  }}
                >
                  <Option value="5">5 / pages</Option>
                  <Option value="10">10 / pages</Option>
                  <Option value="20">20 / pages</Option>
                </Select>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TopicListPage;
