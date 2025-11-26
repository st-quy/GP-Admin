import React, { useState } from "react";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  useGetAllClass,
  handleImportClick,
  handleFileChange,
  fileInputRef,
  handleExportExcel,
  handlePreviewFile,
} from "@features/classManagement/hooks";
import CreateClassModal from "@features/classManagement/ui/Modal/CreateClass";
import TableSearch from "@shared/ui/TableSearch";
import { Button, Typography } from "antd";
import { Link } from "react-router-dom";
import UpdateClassModal from "@features/classManagement/ui/Modal/UpdateClass";
import DeleteClassModal from "@features/classManagement/ui/Modal/DeleteClass";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import PreviewExam from "@shared/ui/PreviewExam";

const ClassManagement = () => {
  const [dataExam, setDataExam] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState("");
  const [dataClass, setClassData] = useState(null);
  // @ts-ignore
  const { userId, user } = useSelector((state) => state.auth);

  const { data: classList, isLoading } = useGetAllClass(
    user?.role.includes("admin") ? null : userId
  );

  const handleExport = async () => {
    setExportLoading(true);
    await handleExportExcel(setExportLoading);
    setExportLoading(false);
  };

  const handleUpdateClass = (record) => () => {
    setIsOpen("Update");
    setClassData(record);
  };

  const handleDeleteClass = (record) => () => {
    setIsOpen("Delete");
    setClassData(record);
  };

  const columns = [
    {
      title: "CLASS NAME",
      dataIndex: "className",
      key: "className",
      align: "center",

      render: (text, record) => (
        <Link to={`${record.ID}`} className="underline">
          {text}
        </Link>
      ), // Render class name as a link
    },
    {
      title: "NUMBER OF SESSIONS",
      dataIndex: "numberOfSessions",
      key: "numberOfSessions",
      align: "center",
      render: (text) => <div className="flex justify-center">{text}</div>, // Render number of sessions
    },
    {
      title: "ACTIONS",
      key: "actions",
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <div className="flex gap-4 justify-center items-center">
          <Button
            className="text-xl !text-primaryColor"
            type="link"
            icon={<EditOutlined />}
            onClick={handleUpdateClass(record)}
          />
          {/* Edit button */}
          {record.numberOfSessions <= 0 && (
            <Button
              className="text-xl"
              type="link"
              icon={<DeleteOutlined className="text-red-500" />}
              onClick={handleDeleteClass(record)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <Typography.Title level={3} className="m-0 font-bold text-black ">
            Class Management
          </Typography.Title>
          <Typography.Text className="text-primaryTextColor text-[18px]">
            Manage and organize both classes and individual sessions.
          </Typography.Text>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:space-x-0">
          <Button
            type="primary"
            className="min-w-[140px] md:min-w-[160px] h-[50px] rounded-full bg-primaryColor hover:!bg-[#002A6B] border-none font-medium"
            onClick={handleExport}
            loading={exportLoading}
          >
            Export to Excel
          </Button>

          <Button
            type="primary"
            className="min-w-[140px] md:min-w-[160px] h-[50px] rounded-full bg-primaryColor hover:!bg-[#002A6B] border-none font-medium"
            onClick={handleImportClick}
            loading={importLoading}
          >
            Import from Excel
          </Button>
          <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            onChange={(e) => {
              setFileData(e.target.files[0]);
              handlePreviewFile(e.target.files[0], setIsModalOpen, setDataExam);
            }}
            style={{ display: "none" }}
          />
          <Button
            type="primary"
            className="min-w-[140px] md:min-w-[160px] h-[50px] rounded-full bg-primaryColor hover:!bg-[#002A6B] border-none font-medium"
            onClick={() => setIsOpen("Create")}
          >
            Create new class
          </Button>
        </div>
      </div>
      {classList && (
        <TableSearch data={classList} columns={columns} isLoading={isLoading} />
      )}
      <CreateClassModal
        isOpen={isOpen === "Create" ? true : false}
        onClose={() => setIsOpen(null)}
      />
      {dataClass && (
        <UpdateClassModal
          isOpen={isOpen === "Update" ? true : false}
          onClose={() => {
            setClassData(null);
            setIsOpen(null);
          }}
          data={dataClass}
        />
      )}
      <DeleteClassModal
        isOpen={isOpen === "Delete" ? true : false}
        onClose={() => setIsOpen(null)}
        classId={dataClass?.ID}
      />
      {isModalOpen && (
        <PreviewExam
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          dataExam={dataExam}
          fileData={fileData}
          setDataExam={setDataExam}
        />
      )}
    </div>
  );
};

export default ClassManagement;
