import React, { useState } from "react";
import ActionModal from "../SessionModal/ActionModal/ActionModal";
import DeleteModal from "../SessionModal/DeleteModal/DeleteModal";
import { Link } from "react-router-dom";
import { useClassDetailQuery, useBulkDeleteSessionsMutation } from "../../hooks/useClassDetail";
import { useParams } from "react-router-dom";
import { Button, Tooltip, message } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import SessionTable from "./SessionTable/SessionTable";
import { formatDateTime } from "@shared/lib/utils/formatString";
import { statusOptions } from "@features/classDetail/constant/statusEnum";
import useConfirm from "@shared/hook/useConfirm";

const SessionManager = () => {
  const { classId } = useParams();
  const { data, isLoading } = useClassDetailQuery(classId);
  const { openConfirmModal, ModalComponent } = useConfirm();
  const { mutateAsync: bulkDeleteSessions } = useBulkDeleteSessionsMutation();

  const [modalState, setModalState] = useState({
    create: false,
    edit: false,
    delete: false,
  });
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const openModal = (type, session = null) => {
    setSelectedSession(session);
    setModalState((prev) => ({ ...prev, [type]: true }));
  };

  const closeModal = (type) => {
    setModalState((prev) => ({ ...prev, [type]: false }));
    setSelectedSession(null);
  };

  const handleBulkDelete = (selectedRecords) => {
    const sessionsWithParticipants = selectedRecords.filter(
      (s) => s.SessionParticipants && s.SessionParticipants.length > 0
    );
    const deletableSessions = selectedRecords.filter(
      (s) => !s.SessionParticipants || s.SessionParticipants.length === 0
    );

    if (sessionsWithParticipants.length > 0) {
      const names = sessionsWithParticipants.map(s => s.sessionName).join(', ');
      message.warning(`Cannot delete sessions with participants: ${names}`);
    }

    if (deletableSessions.length === 0) {
      setSelectedRowKeys([]);
      return;
    }

    const deletableIds = deletableSessions.map(s => s.ID);
    
    openConfirmModal({
      title: `Delete ${deletableIds.length} Session${deletableIds.length > 1 ? 's' : ''}?`,
      message: `Are you sure you want to delete ${deletableIds.length} session${deletableIds.length > 1 ? 's' : ''}? This action cannot be undone.`,
      okText: 'Delete',
      okButtonColor: '#FF4D4F',
      onConfirm: async () => {
        try {
          await bulkDeleteSessions(deletableIds);
          message.success(`${deletableIds.length} session(s) deleted successfully`);
          setSelectedRowKeys([]);
        } catch (error) {
          message.error('Failed to delete some sessions');
        }
      },
    });
  };

  const sessionColumns = [
    {
      title: "SESSION NAME",
      dataIndex: "sessionName",
      key: "sessionName",
      className: "!text-center",
      render: (text, record) => (
        <Link
          to={`/class/${classId}/session/${record.ID}`}
          className="font-medium text-primaryColor hover:underline"
        >
          {text}
        </Link>
      ),
    },
    {
      title: "SESSION KEY",
      dataIndex: "sessionKey",
      key: "sessionKey",
      className: "!text-center",
      render: (text) => <span className="font-medium text-primaryTextColor">{text || "---"}</span>,
    },
    {
      title: "START TIME",
      dataIndex: "startTime",
      key: "startTime",
      className: "!text-center",
      render: (text) => <span className="font-medium text-primaryTextColor">{formatDateTime(text)}</span>,
    },
    {
      title: "END TIME",
      dataIndex: "endTime",
      key: "endTime",
      className: "!text-center",
      render: (text) => <span className="font-medium text-primaryTextColor">{formatDateTime(text)}</span>,
    },
    {
      title: "NUMBER OF PARTICIPANTS",
      key: "participantCount",
      className: "!text-center",
      render: (_, record) => <span className="font-medium text-primaryTextColor">{record.SessionParticipants?.length || 0}</span>,
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      className: "!text-center",
      render: (status) => {
        const info = statusOptions[status];
        return (
          <span
            className="inline-block rounded-[30px] px-[10px] py-[3px] text-center text-[12px] font-medium leading-[20px]"
            style={{ backgroundColor: info?.bg, color: info?.text }}
          >
            {info?.label || status}
          </span>
        );
      },
    },
    {
      title: "ACTIONS",
      key: "action",
      className: "!text-center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-4">
          <Tooltip title={record.status === "ON_GOING" ? "Cannot edit ongoing session" : "Edit Session"}>
            <button
              onClick={() => openModal("edit", record)}
              disabled={record.status === "ON_GOING"}
              className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <EditOutlined style={{ fontSize: "20px", color: "#003087" }} />
            </button>
          </Tooltip>
          {(!record.SessionParticipants?.length || record.SessionParticipants?.length === 0) && (
            <Tooltip title="Delete Session">
              <button
                onClick={() => openModal("delete", record)}
                className="cursor-pointer border-none bg-transparent transition-all hover:opacity-70"
              >
                <DeleteOutlined style={{ fontSize: "20px", color: "#FF4D4F" }} />
              </button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <ModalComponent />
      <div className="flex w-full items-center justify-between pt-8">
        <div>
          <h4 className="figma-title">
            Sessions list
          </h4>
          <p className="figma-subtitle">
            Overview of Active and Past Sessions
          </p>
        </div>
        <Button
          onClick={() => openModal("create")}
          className="!h-[50px] !w-[170px] !rounded-[50px] !bg-primaryColor !text-white font-[500] leading-[24px] hover:!opacity-90"
        >
          Create session
        </Button>
      </div>

      <div className="mt-8">
        {data?.Sessions && (
          <SessionTable
            data={data.Sessions}
            columns={sessionColumns}
            isLoading={isLoading}
            onBulkDelete={handleBulkDelete}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
          />
        )}
      </div>

      {/* Create & Edit Modal */}
      {(modalState.create || modalState.edit) && (
        <ActionModal
          classId={data?.ID}
          isOpen
          initialData={modalState.edit ? selectedSession : null}
          onClose={() => closeModal(modalState.edit ? "edit" : "create")}
        />
      )}

      {/* Delete Modal */}
      {modalState.delete && selectedSession && (
        <DeleteModal
          sessionID={selectedSession.ID}
          isOpen
          onClose={() => closeModal("delete")}
        />
      )}
    </>
  );
};

export default SessionManager;
