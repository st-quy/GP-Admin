import React, { useState } from "react";
import ActionModal from "../SessionModal/ActionModal/ActionModal";
import DeleteModal from "../SessionModal/DeleteModal/DeleteModal";
import { Link } from "react-router-dom";
import { formatDateTime } from "@shared/lib/utils/formatString";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { statusOptions } from "@features/classDetail/constant/statusEnum";
import SessionTable from "./SessionTable/SessionTable";
import { Button } from "antd";

const SessionManager = ({ data, isLoading }) => {
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
        <Link to={`session/${record.ID}`} className="text-[#003087]">
          {text}
        </Link>
      ),
    },
    {
      title: "SESSION KEY",
      dataIndex: "sessionKey",
      key: "sessionKey",
      className: "!text-center",
    },
    {
      title: "START TIME",
      dataIndex: "startTime",
      key: "startTime",
      className: "!text-center",
      render: (text) => formatDateTime(text),
    },
    {
      title: "END TIME",
      dataIndex: "endTime",
      key: "endTime",
      className: "!text-center",
      render: (text) => formatDateTime(text),
    },
    {
      title: "NUMBER OF PARTICIPANTS",
      dataIndex: "SessionParticipants",
      key: "SessionParticipants",
      className: "!text-center",
      render: (participants) => <span>{participants.length}</span>,
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
          <span className="text-xl">
            {record.status !== "ongoing" ? (
              <EditOutlined
                onClick={() => openModal("edit", record)}
                className="hover:opacity-50 cursor-pointer"
              />
            ) : (
              <EditOutlined
                className="text-gray-300 cursor-not-allowed"
              />
            )}
          </span>
          {record.SessionParticipants.length === 0 && (
            <span className="text-xl">
              <DeleteOutlined
                onClick={() => openModal("delete", record)}
                className="hover:opacity-50"
              />
            </span>
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
        <SessionTable
          data={data.Sessions}
          columns={sessionColumns}
          isLoading={isLoading}
        />
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
