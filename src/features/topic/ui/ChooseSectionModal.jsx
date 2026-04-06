import React, { useEffect, useState } from "react";
import { Modal, Checkbox, Spin, Typography, Button } from "antd";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { useGetSections } from "@features/sections/hooks";

const { Title, Text } = Typography;

const ChooseSectionModal = ({ open, onClose, skillName, onSelect, selectedSectionId }) => {
  const [selectedSectionsBySkill, setSelectedSectionsBySkill] = useState({}); 
  const [expanded, setExpanded] = useState([]); 

  const { data: sections = [], isLoading } = useGetSections({
    skillName: skillName,
    status: 'published',
  }, {
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
    const sectionsSelected = (selectedSectionsBySkill[skillName] || []).map((item) =>
      sections.find((section) => section.ID === item.ID) || item
    );
    onSelect(sectionsSelected);
    console.log(sectionsSelected)
    onClose();
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
      title={<span className="text-[18px] font-semibold text-[#111827]">Section Selection</span>}
      open={open}
      onCancel={onClose}
      footer={[
        <div className="flex justify-end gap-3 p-4" key="footer">
          <Button 
            onClick={onClose}
            className="!h-[50px] !px-8 !rounded-lg font-medium border-[#D1D5DB] text-[#374151]"
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            onClick={handleSubmit} 
            className="!h-[50px] !px-10 !rounded-lg font-medium !bg-[#003087] !border-none shadow-none hover:opacity-90"
          >
            Select
          </Button>
        </div>,
      ]}
      width={1200}
      centered
      destroyOnClose
      bodyStyle={{ padding: '24px' }}
    >
      {isLoading ? (
        <Spin style={{ width: "100%", display: "flex", justifyContent: "center", padding: "60px 0" }} />
      ) : (
        <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex flex-col gap-4">
            {sections.map((section, idx) => {
              const checked = selectedSections.some((item) => item.ID === section.ID);
              const isExpanded = expanded.includes(section.ID);

              return (
                <div 
                  key={section.ID}
                  className={`
                    border-[2px] rounded-lg transition-all duration-200
                    ${checked ? "border-[#003087] bg-[#F0F5FF] shadow-sm" : "border-[#E5E7EB] hover:border-[#D1D5DB] bg-white"}
                  `}
                >
                  <div 
                    className="flex items-start gap-4 p-5 cursor-pointer" 
                    onClick={() => toggleSelect(section)}
                  >
                    <div className="pt-1">
                      <Checkbox
                        checked={checked}
                        className="figma-custom-checkbox"
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelect(section);
                        }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-[#111827] mb-1">
                        {section.Name}
                      </div>
                      <div className="text-[14px] font-normal text-[#4B5563]">
                        {section.Description || "No description available."}
                      </div>
                    </div>

                    <div 
                      onClick={(e) => { e.stopPropagation(); toggleExpand(section.ID); }} 
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {isExpanded ? <DownOutlined /> : <RightOutlined />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0 border-t-[1px] border-[#F1F5F9]">
                      <div className="mt-4 space-y-4">
                        {(section.Parts || []).map((part) => (
                          <div key={part.ID} className="p-4 border-[1px] border-[#E5E7EB] rounded-lg bg-[#F9FAFB]">
                            <Text className="font-bold text-[#111827] block mb-2">{part.Content}</Text>
                            {!(skillName === "READING" || skillName === "WRITING") && part.SubContent && (
                              <Text type="secondary" className="block mb-2">{part.SubContent}</Text>
                            )}
                            {!(skillName === "READING" || skillName === "WRITING") && (
                              <div className="mt-3 space-y-3">
                                {(part.Questions || []).map((q, index) => (
                                  <div key={q.ID} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#003087] text-white flex items-center justify-center font-bold text-[12px] shrink-0">
                                      {(skillName === "SPEAKING" && part.Content === "Part 4")
                                        ? <span className="text-[18px]">+</span>
                                        : (index + 1)}
                                    </div>
                                    <Text className="text-[14px] leading-[20px] text-[#374151]">{q.Content}</Text>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <style>{`
        .figma-custom-checkbox .ant-checkbox-inner {
          width: 18px !important;
          height: 18px !important;
          border-radius: 2px !important;
          border: 1px solid #D1D5DB !important;
        }
        .figma-custom-checkbox.ant-checkbox-checked .ant-checkbox-inner {
          background-color: #003087 !important;
          border-color: #003087 !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F3F3F3;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #DADADA;
          border-radius: 10px;
        }
      `}</style>
    </Modal>
  );
};

export default ChooseSectionModal;
