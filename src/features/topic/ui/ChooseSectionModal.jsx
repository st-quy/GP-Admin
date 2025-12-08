import React, { useEffect, useState } from "react";
import { Modal, Checkbox, Spin, Typography, Card } from "antd";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { useGetSections } from "@features/section/hooks";

const { Title, Text } = Typography;

const ChooseSectionModal = ({ open, onClose, skillName, onSelect, selectedSectionId }) => {
  const [selectedSectionsBySkill, setSelectedSectionsBySkill] = useState({}); 
  const [expanded, setExpanded] = useState([]); 

  const { data: sections = [], isLoading } = useGetSections(skillName, {
    enabled: open,
  });

  const toggleSelect = (section) => {
    setSelectedSectionsBySkill((prev) => {
      const prevForSkill = prev[skillName] || [];
      const exists = prevForSkill.some(s => s.ID === section.ID);

      const updated = exists ? [] : [section]; 
      return { ...prev, [skillName]: updated };
    });
  };

  const toggleExpand = (sectionId) => {
    setExpanded((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSubmit = () => {
    const sectionsSelected = selectedSectionsBySkill[skillName] || [];
    onSelect(sectionsSelected);
    onClose();
  };

  const selectedSections = selectedSectionsBySkill[skillName] || [];

  useEffect(() => {
    if (selectedSectionId) {
      setSelectedSectionsBySkill(prev => ({ ...prev, [skillName]: [{ ID: selectedSectionId }] }));
    } else {
      setSelectedSectionsBySkill(prev => ({ ...prev, [skillName]: [] }));
    }
  }, [selectedSectionId, skillName]);

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>Section Selection</Title>}
      open={open}
      onCancel={onClose}
      footer={[
        <button key="cancel" onClick={onClose} style={{ padding: "6px 20px", border: "1px solid #d0d0d0", background: "white", borderRadius: 8, cursor: "pointer" }}>Cancel</button>,
        <button key="submit" onClick={handleSubmit} style={{ padding: "6px 28px", background: "#002B7F", color: "white", borderRadius: 8, cursor: "pointer", border: "none" }}>Select</button>,
      ]}
      width={750}
    >
      {isLoading ? (
        <Spin style={{ width: "100%", display: "flex", justifyContent: "center" }} />
      ) : (
        <div style={{ maxHeight: 450, overflowY: "auto", paddingRight: 10 }}>
          {sections.map((section) => {
            const checked = selectedSections.some((item) => item.ID === section.ID);
            const isExpanded = expanded.includes(section.ID);

            return (
              <Card
                key={section.ID}
                style={{
                  marginBottom: 14,
                  border: checked ? "2px solid #1E3A8A" : "1px solid #E5E7EB",
                  background: checked ? "#F0F5FF" : "white",
                }}
                bodyStyle={{ padding: 16 }}
              >
                {/* HEADER */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => toggleSelect(section)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Checkbox
                      checked={checked}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(section);
                      }}
                    />
                    <div>
                      <Text strong>{section.Name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>{section.Description || "No description available."}</Text>
                    </div>
                  </div>
                  <div onClick={(e) => { e.stopPropagation(); toggleExpand(section.ID); }} style={{ padding: "4px 8px" }}>
                    {isExpanded ? <DownOutlined /> : <RightOutlined />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 16, paddingLeft: 36 }}>
                    {(section.Parts || []).map((part) => (
                      <div key={part.ID} style={{ marginBottom: 12, padding: 12, border: "1px solid #E5E7EB", borderRadius: 8, background: "#FAFAFA" }}>
                        <Text strong>{part.Content}</Text>
                        <br />
                        <Text type="secondary">{part.SubContent}</Text>
                        <ul style={{ marginTop: 8 }}>
                          {(part.Questions || []).map((q) => (
                            <li key={q.ID} style={{ marginBottom: 4 }}>
                              <Text> {q.Content}</Text>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default ChooseSectionModal;
