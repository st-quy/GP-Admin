import React, { useEffect, useState } from "react";
import { Modal, Spin, Typography } from "antd";
import { useGetSections } from "@features/section/hooks";
import TwoPanelQuestionPicker from "@shared/components/TwoPanelQuestionPicker";

const { Title } = Typography;

const ChooseSectionModal = ({ open, onClose, skillName, onSelect, selectedSectionId }) => {
  const [selectedSections, setSelectedSections] = useState([]); 

  const { data: sections = [], isLoading } = useGetSections(skillName, {
    enabled: open,
  });

  useEffect(() => {
    if (open && selectedSectionId && sections.length > 0) {
      const alreadySelected = sections.filter(s => s.ID === selectedSectionId);
      setSelectedSections(alreadySelected);
    } else if (open && !selectedSectionId) {
      setSelectedSections([]);
    }
  }, [open, selectedSectionId, sections]);

  const handleSubmit = () => {
    onSelect(selectedSections);
    onClose();
  };

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>Select Questions - {skillName}</Title>}
      open={open}
      onCancel={onClose}
      footer={[
        <button 
          key="cancel" 
          onClick={onClose} 
          style={{ padding: "6px 20px", border: "1px solid #d0d0d0", background: "white", borderRadius: 8, cursor: "pointer", marginRight: 8 }}
        >
          Cancel
        </button>,
        <button 
          key="submit" 
          onClick={handleSubmit} 
          style={{ padding: "6px 28px", background: "#002B7F", color: "white", borderRadius: 8, cursor: "pointer", border: "none" }}
        >
          Apply Selection
        </button>,
      ]}
      width={1000}
      centered
    >
      <div style={{ marginTop: 16 }}>
        <TwoPanelQuestionPicker
          availableItems={sections}
          selectedItems={selectedSections}
          onChange={setSelectedSections}
          loading={isLoading}
          skillName={skillName}
        />
      </div>
    </Modal>
  );
};

export default ChooseSectionModal;
