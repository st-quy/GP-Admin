import "./index.scss";
import { useRef, useEffect } from "react";
import { Modal, Table, Button } from "antd";
import { EditOutlined, AudioOutlined } from "@ant-design/icons";

const StudentListModal = ({
  currentUser,
  data,
  visible,
  onClose,
  handleSelect,
}) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (visible && scrollRef.current) {
      scrollRef.current.focus();
    }
  }, [visible]);
  //Filter Data
  const filterData = [];
  data.map((item) => {
    filterData.push({
      ID: item.ID,
      Speaking: item.Speaking ? item.Speaking : "Ungraded",
      Writing: item.Writing ? item.Writing : "Ungraded",
      Name: item.User.fullName,
    });
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "Name",
      key: "Name",
      onHeaderCell: () => ({
        style: { backgroundColor: "transparent", color: "#637381" },
      }),
      render: (text) => <span className="text-primaryColor">{text}</span>,
    },
    {
      title: () => (
        <div className="flex items-center justify-center text-primaryTextColor">
          <EditOutlined className="mr-2" />
          <span>Writing</span>
        </div>
      ),
      dataIndex: "Writing",
      key: "Writing",
      align: "center",
      onHeaderCell: () => ({
        style: { backgroundColor: "transparent" },
      }),
    },
    {
      title: () => (
        <div className="flex items-center justify-center text-primaryTextColor">
          <AudioOutlined className="mr-2" />
          <span>Speaking</span>
        </div>
      ),
      onHeaderCell: () => ({
        style: { backgroundColor: "transparent" },
      }),
      dataIndex: "Speaking",
      key: "Speaking",
      align: "center",
    },
    {
      title: "",
      key: "action",
      align: "center",
      onHeaderCell: () => ({
        style: { backgroundColor: "transparent" },
      }),
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          shape="round"
          className={`w-24 ${
            record.ID === currentUser.ID
              ? "!border-[#DF6B2E] !text-[#DF6B2E]"
              : "!border-primaryColor !text-primaryColor"
          }`}
          onClick={() => {
            handleSelect(record.ID);
          }}
        >
          {record.ID === currentUser.ID ? "Selected" : "Select"}
        </Button>
      ),
    },
  ];

  return (
    <Modal open={visible} onCancel={onClose} footer={null} width={1000} styles={{ body: { maxHeight: '70vh', overflow: 'hidden' } }}>
      <div className="px-12 pb-14 pt-8" id="grading-participants-table">
        <h2 className="text-3xl font-bold mb-4">Student List</h2>
        <div ref={scrollRef} tabIndex={0} id="grading-participants-table-wrapper" style={{ maxHeight: '50vh', overflowY: 'auto', outline: 'none' }}>
          <Table
            dataSource={filterData}
            // @ts-ignore
            columns={columns}
            pagination={false}
            rowKey="ID"
            sticky
          />
        </div>
      </div>
    </Modal>
  );
};

export default StudentListModal;
