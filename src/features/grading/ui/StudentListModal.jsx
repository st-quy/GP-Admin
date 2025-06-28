import "./index.scss";
import { Modal, Table, Button } from "antd";
import { EditOutlined, AudioOutlined } from "@ant-design/icons";

const StudentListModal = ({
  currentUser,
  data,
  visible,
  onClose,
  handleSelect,
}) => {
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
    <Modal open={visible} onCancel={onClose} footer={null} width={1000}>
      <div className="px-12 pb-14 pt-8" id="grading-participants-table">
        <h2 className="text-3xl font-bold mb-4">Student List</h2>
        <Table
          dataSource={filterData}
          // @ts-ignore
          columns={columns}
          pagination={false}
          rowKey="ID"
          scroll={{ y: 500 }}
        />
      </div>
    </Modal>
  );
};

export default StudentListModal;
