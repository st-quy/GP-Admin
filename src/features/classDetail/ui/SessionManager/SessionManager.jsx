import React, { useState } from "react";
import ActionModal from "../SessionModal/ActionModal/ActionModal";
import DeleteModal from "../SessionModal/DeleteModal/DeleteModal";
import { Link } from "react-router-dom";
import { useClassDetailQuery } from "../../hooks/useClassDetail";
import { useParams } from "react-router-dom";
import { Button, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import SessionTable from "./SessionTable/SessionTable";
import { formatDateTime } from "@shared/lib/utils/formatString";
import { statusOptions } from "@features/classDetail/constant/statusEnum";

const SessionManager = () => {
  const { classId } = useParams();
  const { data, isLoading } = useClassDetailQuery(classId);

  const [modalState, setModalState] = useState({
    create: false,
    edit: false,
    delete: false,
  });
  const [selectedSession, setSelectedSession] = useState(null);

  const openModal = (type, session = null) => {
    setSelectedSession(session);
    setModalState((prev) => ({ ...prev, [type]: true }));
  };

  const closeModal = (type) => {
    setModalState((prev) => ({ ...prev, [type]: false }));
    setSelectedSession(null);
  };

  const sessionColumns = [
    {
      title: "SESSION NAME",
      dataIndex: "sessionName",
      key: "sessionName",
      className: "!text-center",
      render: (text, record) => (
        <Link to={`/class/${classId}/session/${record.ID}`} className="text-primaryColor font-medium hover:underline">
          {text}
        </Link>
      ),
    },
    {
      title: "START TIME",
      dataIndex: "startTime",
      key: "startTime",
      className: "!text-center",
      render: (text) => <span>{formatDateTime(text)}</span>,
    },
    {
      title: "END TIME",
      dataIndex: "endTime",
      key: "endTime",
      className: "!text-center",
      render: (text) => <span>{formatDateTime(text)}</span>,
    },
    {
      title: "NUMBER OF PARTICIPANTS",
      dataIndex: "SessionParticipants",
      key: "SessionParticipants",
      className: "!text-center",
      render: (participants) => <span>{participants?.length || 0}</span>,
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
            className="px-3 py-1 rounded-full text-sm font-medium inline-block text-center"
            style={{ backgroundColor: info?.bg, color: info?.text }}
          >
            {info?.label || status}
          </span>
        );
      },
    },
    {
      title: "ACTION",
      key: "action",
      className: "!text-center",
      render: (_, record) => (
        <div className="flex justify-center items-center gap-4">
          <Tooltip title={record.status === "ON_GOING" ? "Cannot edit ongoing session" : "Edit Session"}>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => openModal("edit", record)}
              disabled={record.status === "ON_GOING"}
              className="text-xl !text-primaryColor hover:opacity-70 disabled:opacity-30"
            />
          </Tooltip>
          {(record.participantCount === 0 || !record.participantCount) && (
            <Tooltip title="Delete Session">
              <Button
                type="link"
                icon={<DeleteOutlined />}
                onClick={() => openModal("delete", record)}
                className="text-xl !text-red-500 hover:opacity-70"
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex w-full items-center justify-between pt-8">
        <div>
          <h4 className="font-[700] md:text-[28px] lg:text-[30px]">
            Sessions list
          </h4>
          <p className="text-primaryTextColor md:text-[16px] lg:text-[18px] font-[500]">
            Overview of Active and Past Sessions
          </p>
        </div>
        <Button
          onClick={() => openModal("create")}
          className="!rounded-full !bg-primaryColor !p-6 !text-white font-medium lg:text-base md:text-sm"
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
