import React from "react";
import { Button, Modal } from "antd";
import Warning from "@assets/icons/class-detail/warning.png";
import { useDeleteSessionMutation } from "@features/classDetail/hooks/useClassDetail";

const DeleteModal = ({ sessionID, isOpen, onClose }) => {
  const { mutate: deleteSession, isPending } = useDeleteSessionMutation();
  const handleOk = async () => {
    deleteSession(sessionID);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      closable={false}
      onOk={handleOk}
      confirmLoading={isPending}
      onCancel={onClose}
      okText={"Delete"}
      centered
      footer={(_) => (
        <div className="flex justify-end gap-4 py-4">
          <Button
            onClick={onClose}
            className="h-[50px] w-[106px] rounded-[50px] shadow-[0px_1px_3px_rgba(166,175,195,0.4)] text-primaryColor lg:text-[16px] md:text-[14px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleOk}
            className="h-[50px] w-[106px] rounded-[50px] bg-[#F23030] text-white lg:text-[16px] md:text-[14px]"
          >
            Delete
          </Button>
        </div>
      )}
      width={650}
    >
      <div className="p-6">
        <div className="pb-6 flex items-center gap-4">
          <div className="bg-[#FEEBEB] w-fit p-4 rounded-full flex justify-center items-center">
            <img src={Warning} alt="Warning Icon" width={20} height={20} />
          </div>
          <h6 className="text-[20px]">Are you sure to delete this session?</h6>
        </div>
        <p className="text-primaryTextColor text-[14px]">
          Once you delete this session, all associated data will be permanently
          removed and cannot be recovered. Please confirm if you want to proceed
          with this action.
        </p>
      </div>
    </Modal>
  );
};

export default DeleteModal;
