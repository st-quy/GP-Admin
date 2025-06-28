import { useState, useMemo, useEffect } from "react";
import { Table, message } from "antd";
import CheckCircleIcon from "@/assets/icons/check-circle.svg";
import CloseCircleIcon from "@/assets/icons/close-circle.svg";
import ConfirmationModal from "@shared/Modal/ConfirmationModal";
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
        studentName: req.User?.fullName || "null",
        studentId: req.User?.studentCode || "null",
        className: req.User?.class || "null",
        requestId: req.ID,
      }));
    return pendingRequests;
  }, [dataSource]);
  const filteredData = useMemo(() => {
    if (!searchKeyword) return filterPending;
    return filterPending.filter((item) => {
      return (
        item.studentName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.studentId.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.className.toLowerCase().includes(searchKeyword.toLowerCase())
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

  const onShowSizeChange = (current, size) => {
    setCurrentPage(current);
    setPageSize(size);
  };

  const paginationConfig = {
    pageSizeOptions: ["5", "10", "15", "20"],
    current: currentPage,
    pageSize: pageSize,
    total: filteredData?.length || 0,
    showSizeChanger: true,
    onShowSizeChange: onShowSizeChange,
    onChange: (page) => setCurrentPage(page),
    showTotal: (total, range) => (
      <span className="text-center md:text-[16px] text-[10px] text-primaryTextColor">
        Showing {range[0].toString().padStart(2)}-
        {range[1].toString().padStart(2)} of {total}
      </span>
    ),
  };

  return (
    <div className="w-full">
      <div className="flex items-center">
        {selectedRowKeys.length > 0 && (
          <div className="flex">
            <div
              className="text-primaryTextColor rounded-none md:text-sm text-[10px] h-8 px-3 hover:font-bold hover:text-[#22AD5C] hover:underline hover:cursor-pointer"
              onClick={() => handleBulkAction("approve")}
            >
              Approve
            </div>
            <div>|</div>
            <div
              className="text-primaryTextColor rounded-none md:text-sm text-[10px] h-8 px-3 hover:font-bold hover:text-[#F23030] hover:underline hover:cursor-pointer"
              onClick={() => handleBulkAction("reject")}
            >
              Reject
            </div>
          </div>
        )}
      </div>
      <Table
        scroll={{ y: 5 * 70 }}
        rowSelection={rowSelection}
        // @ts-ignore
        columns={columns}
        loading={isLoading}
        dataSource={filteredData}
        pagination={paginationConfig}
        className="border border-gray-200 rounded-lg overflow-hidden"
        rowClassName="hover:bg-gray-50"
        components={{
          header: {
            wrapper: (props) => (
              <thead
                {...props}
                className="bg-tableHeadColor text-[10px] font-[700] md:text-[16px] text-primaryTextColor uppercase"
              />
            ),
            cell: (props) => (
              <th
                {...props}
                className="tracking-wider text-center py-4 px-0 whitespace-nowrap"
              />
            ),
          },
          body: {
            cell: (props) => (
              <td
                {...props}
                className="font-[500] tracking-wider text-center py-4 px-0 whitespace-nowrap text-[10px] md:text-[14px] text-primaryTextColor"
              />
            ),
          },
        }}
      />
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
