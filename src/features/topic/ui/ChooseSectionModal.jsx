import React, { useEffect, useState } from "react";
import { Modal, Checkbox, Spin, Typography, Card, Button } from "antd";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { useGetSections } from "@features/sections/hooks"; // Use working plural hooks

const { Title, Text } = Typography;

const ChooseSectionModal = ({ open, onCancel, skillName, onSelect, selectedSectionId }) => {
  const [selectedSectionsBySkill, setSelectedSectionsBySkill] = useState({}); 
  const [expanded, setExpanded] = useState([]); 

  // Fix: Pass as object to match useGetSections({ skillName })
  const { data: response, isLoading } = useGetSections({
    skillName: skillName,
    enabled: open,
  });

  const sections = response?.data || [];

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
    const selected = selectedSectionsBySkill[skillName] || [];
    onSelect(selected);
    onCancel();
  };

  const selectedSections = selectedSectionsBySkill[skillName] || [];

  useEffect(() => {
    if (!selectedSectionId) {
      setSelectedSectionsBySkill((prev) => ({ ...prev, [skillName]: [] }));
      return;
    }

    const matchedSection = sections.find((section) => section.ID === selectedSectionId);
    setSelectedSectionsBySkill((prev) => ({
      ...prev,
      [skillName]: [matchedSection || { ID: selectedSectionId }],
    }));
  }, [selectedSectionId, skillName, sections]);

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>Section Selection</Title>}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} style={{ background: "#002B7F", borderColor: "#002B7F" }}>Select</Button>,
      ]}
      width={750}
      destroyOnClose
    >
      {isLoading ? (
        <Spin style={{ width: "100%", display: "flex", justifyContent: "center", padding: "40px 0" }} />
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => toggleSelect(section)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Checkbox
                      checked={checked}
                      onChange={(e) => {
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
                      <div key={part.ID} style={{ marginBottom: 12, padding: 12, border: "1px solid #E5E7EB", borderRadius: 8, background: "white" }}>
                        <Text strong>{part.Content}</Text>
                        <div style={{ marginTop: 8 }}>
                          {(part.Questions || []).map((q, index) => (
                            <div key={q.ID} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0a2a79", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14 }}>{index + 1}</div>
                              <Text style={{ fontSize: 15, lineHeight: "20px" }}>{q.Content}</Text>
                            </div>
                          ))}
                        </div>
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
