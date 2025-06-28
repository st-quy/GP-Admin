import { useState } from "react";
import ConfirmationModal from "../Modal/ConfirmationModal";

const useConfirm = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    okText: "OK",
    okButtonColor: "#1890ff",
    onConfirm: () => {},
  });

  const openConfirmModal = ({ title, message, okText, okButtonColor, onConfirm }) => {
    setModalConfig({
      title,
      message,
      okText: okText || "OK",
      okButtonColor: okButtonColor || "#1890ff",
      onConfirm: onConfirm || (() => {}),
    });
    setIsModalVisible(true);
  };

  const closeConfirmModal = () => {
    setIsModalVisible(false);
  };

  const ModalComponent = () => (
    <ConfirmationModal
      isOpen={isModalVisible}
      onClose={closeConfirmModal}
      title={modalConfig.title}
      message={modalConfig.message}
      okText={modalConfig.okText}
      okButtonColor={modalConfig.okButtonColor}
      onConfirm={() => {
        modalConfig.onConfirm();
        closeConfirmModal();
      }}
    />
  );

  return {
    openConfirmModal,
    closeConfirmModal,
    ModalComponent,
  };
};

export default useConfirm;