import React from 'react';
import { Modal } from 'antd';
import { Warning } from "@assets/images";

const ConfirmationModal = ({ isOpen, onClose, title, message, okText, okButtonColor, onConfirm }) => {
  return (
    <Modal
      title={
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mr-2">
            <img src={Warning} alt="Warning Icon" className="w-10 h-10" />
          </div>
          <span className="text-lg font-semibold text-black">{title}</span>
        </div>
      }
      closable={false}
      open={isOpen}
      onOk={onConfirm}
      onCancel={onClose}
      okText={okText}
      cancelText="Cancel"
      okButtonProps={{
        style: {
          backgroundColor: okButtonColor,
          borderColor: okButtonColor,
          borderRadius: '24px',
        },
      }}
      cancelButtonProps={{
        style: {
          borderColor: '#d9d9d9',
          borderRadius: '24px',
        },
      }}
    >
      <p className={`text-[#595959] ${okText !== "Delete" ? "ml-14" : "ml-1"}`}>{message}</p>
    </Modal>
  );
};

export default ConfirmationModal;