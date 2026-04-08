import { useState, useMemo, useEffect } from "react";
import { Table, message, Pagination, Select } from "antd";
import CheckCircleIcon from "@/assets/icons/check-circle.svg";
import CloseCircleIcon from "@/assets/icons/close-circle.svg";
import ConfirmationModal from "@shared/Modal/ConfirmationModal";
import BulkActionToolbar from "@shared/ui/BulkActionToolbar";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useApproveRequest,
  useApproveSelectedRequest,
  useRejectRequest,
  useRejectSelectedRequest,
  useSessionRequests,
} from "../hooks/useSession";

const StudentMonitoring = ({
  sessionId,
  searchKeyword,
  onPendingCountChange,
}) => {
  const queryClient = useQueryClient();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: dataSource, isLoading } = useSessionRequests(sessionId);
  const { mutate: approve, isPending: isApproving } =
    useApproveRequest(sessionId);
  const { mutate: reject, isPending: isRejecting } =
    useRejectRequest(sessionId);
  const { mutate: rejectSelected, isPending: isRejectingSelected } =
    useRejectSelectedRequest(sessionId);
  const { mutate: approveSelected, isPending: isAppoveSelected } =
    useApproveSelectedRequest(sessionId);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    okText: "",
    okButtonColor: "",
    onConfirm: () => {},
  });

  const filterPending = useMemo(() => {
    if (!sessionId) return [];
    const requestsData = dataSource || [];
    const pendingRequests = requestsData
      .filter((req) => req.status === "pending")
      .map((req, index) => ({
        key: req.ID || index.toString(),
        studentName: req.User?.fullName || "Unknown",
        studentId: req.User?.studentCode || "Unknown",
        className: req.User?.class || "-",
        requestId: req.ID,
      }));
    return pendingRequests;
  }, [dataSource]);
  const filteredData = useMemo(() => {
    // BUG_CM030/CM031: Proactive validation and limit
    const cleanKeyword = (searchKeyword || "")
      .replace(
        /[^a-zA-Z0-9\s]/.test(searchKeyword) ? /[^a-zA-Z0-9\s]/g : "",
        "",
      )
      .replace(/\s{2,}/g, " ")
      .slice(0, 50)
      .toLowerCase();

    if (!cleanKeyword) return filterPending;
    return filterPending.filter((item) => {
      return (
        item.studentName.toLowerCase().includes(cleanKeyword) ||
        item.studentId.toLowerCase().includes(cleanKeyword) ||
        item.className.toLowerCase().includes(cleanKeyword)
      );
    });
  }, [filterPending, searchKeyword]);

  useEffect(() => {
    if (onPendingCountChange) {
      onPendingCountChange(filteredData?.length || 0);
    }
  }, [filteredData, onPendingCountChange]);

  const handleAction = (record, type) => {
    const isApprove = type === "approve";
    const mutation = isApprove ? approve : reject;
    setModalConfig({
      title: `Are you sure you want to ${isApprove ? "approve" : "reject"} this student?`,
      message: isApprove
        ? "After you approve this student, this account will be able to take the test."
        : "After you reject this student, this account will no longer be available in this pending list.",
      okText: isApprove ? "Approve" : "Reject",
      okButtonColor: isApprove ? "#22AD5C" : "#F23030",
      onConfirm: () => {
        mutation(record.requestId);
        setModalOpen(false);
      },
    });

    setModalOpen(true);
  };

  const handleBulkAction = (type = "approve") => {
    const isApprove = type === "approve";
    const selectedRequestIds = filteredData
      .filter((req) => selectedRowKeys.includes(req.key))
      .map((req) => req.requestId);

    setModalConfig({
      title: `Are you sure you want to ${isApprove ? "approve" : "reject"} all selected students?`,
      message: `Once you ${isApprove ? "approve" : "reject"} all students, their request status will be updated.`,
      okText: isApprove ? "Approve" : "Reject",
      okButtonColor: isApprove ? "#22AD5C" : "#F23030",
      onConfirm: async () => {
        try {
          const mutate = isApprove ? approveSelected : rejectSelected;
          mutate(selectedRequestIds, {
            onSuccess: () => {
              setSelectedRowKeys([]);
            },
            onError: () => {},
          });
        } catch (error) {
          message.error(`Error processing bulk ${type}: ` + error.message);
        }
        setModalOpen(false);
      },
    });
    setModalOpen(true);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    columnWidth: "50px",
    renderCell: (checked, record, index, originNode) => (
      <div className="flex justify-center">{originNode}</div>
    ),
  };

  const columns = [
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Student ID",
      dataIndex: "studentId",
      key: "studentId",
    },
    {
      title: "Class Name",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex justify-center space-x-4">
          <img
            src={CheckCircleIcon}
            alt="Check Circle"
            onClick={() => handleAction(record, "approve")}
            className="md:h-7 h-5 text-[#22AD5C] hover:text-green-600 hover:cursor-pointer"
          />
          <img
            src={CloseCircleIcon}
            alt="Close Circle"
            onClick={() => handleAction(record, "reject")}
            className="md:h-7 h-5 text-[#F23030] hover:text-red-600 hover:cursor-pointer"
          />
        </div>
      ),
    },
  ];

  const total = filteredData?.length || 0;
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  const bulkActions = [
    {
      label: 'Approve',
      icon: <CheckCircleOutlined />,
      onClick: () => handleBulkAction("approve"),
    },
    {
      label: 'Reject',
      icon: <CloseCircleOutlined />,
      onClick: () => handleBulkAction("reject"),
      danger: true,
    },
  ];

  return (
    <div className="w-full">
      <BulkActionToolbar
        visible={selectedRowKeys.length > 0}
        selectedCount={selectedRowKeys.length}
        actions={bulkActions}
        onClearSelection={() => setSelectedRowKeys([])}
      />

      <div className="figma-table-card figma-table-overrides w-full">
        <Table
          scroll={{ y: 5 * 70 }}
          rowSelection={rowSelection}
          // @ts-ignore
          columns={columns}
          loading={isLoading}
          dataSource={filteredData.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize,
          )}
          pagination={false}
          className="w-full"
        />
      </div>

      <div className="figma-pagination-wrapper">
        <div className="figma-pagination-box">
          <div className="figma-pagination-text whitespace-nowrap">
            {total === 0
              ? "No entries found"
              : `Showing ${String(start).padStart(2, "0")}-${String(end).padStart(2, "0")} of ${total}`}
          </div>

          <div className="figma-pagination-nav-group">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              itemRender={(page, type, original) => {
                if (type === "page") {
                  const isActive = currentPage === page;
                  return (
                    <button
                      className={`figma-page-btn ${isActive ? "active" : ""}`}
                    >
                      {page}
                    </button>
                  );
                }
                if (type === "prev") {
                  return (
                    <button className="figma-symbol-btn" type="button">
                      {"\u2039"}
                    </button>
                  );
                }
                if (type === "next") {
                  return (
                    <button className="figma-symbol-btn" type="button">
                      {"\u203A"}
                    </button>
                  );
                }
                if (type === "jump-prev" || type === "jump-next") {
                  return (
                    <span
                      className="text-[#637381] px-1"
                      style={{ fontSize: "16px", lineHeight: "25px" }}
                    >
                      ...
                    </span>
                  );
                }
                return original;
              }}
            />
          </div>

          <div className="figma-page-size-container">
            <Select
              value={pageSize}
              onChange={(val) => {
                setPageSize(val);
                setCurrentPage(1);
              }}
              bordered={false}
              className="figma-page-size-select"
              options={[
                { value: 5, label: "05 / pages" },
                { value: 10, label: "10 / pages" },
                { value: 20, label: "20 / pages" },
                { value: 50, label: "50 / pages" },
              ]}
            />
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        okText={modalConfig.okText}
        okButtonColor={modalConfig.okButtonColor}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
};

export default StudentMonitoring;
