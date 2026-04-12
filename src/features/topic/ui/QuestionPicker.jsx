import React, { useEffect, useState } from "react";
import { Modal, Checkbox, Spin, Typography, Card, Button, Input, Empty, Tag } from "antd";
import { SearchOutlined, DownOutlined, RightOutlined, MinusOutlined } from "@ant-design/icons";
import { useGetSections } from "@features/sections/hooks";

const { Text } = Typography;

const skillLabels = {
  "SPEAKING": "Speaking",
  "LISTENING": "Listening",
  "READING": "Reading",
  "WRITING": "Writing",
  "GRAMMAR AND VOCABULARY": "Grammar & Vocab",
};

const QuestionPicker = ({ 
  open, 
  onCancel, 
  skillName,
  selectedSection,
  onSelectSection,
  onRemoveSection 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState([]);

  const { data: response, isLoading } = useGetSections({
    skillName: skillName,
    status: 'published',
    enabled: open,
  });

  const allSections = response?.data || [];
  const filteredSections = allSections.filter(section => 
    section.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.Description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <Modal
      title={<span className="text-[18px] font-semibold text-[#111827]">Select Section for {skillLabels[skillName] || skillName}</span>}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
      centered
      destroyOnClose
      bodyStyle={{ padding: '0', height: '550px' }}
    >
      <div className="flex h-full">
        {/* Left Panel - Available Sections */}
        <div className="w-1/2 border-r border-[#E5E7EB] flex flex-col">
          <div className="p-4 border-b border-[#E5E7EB]">
            <Input
              placeholder="Search sections..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="!h-[44px]"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <Spin style={{ width: "100%", display: "flex", justifyContent: "center", padding: "60px 0" }} />
            ) : filteredSections.length === 0 ? (
              <Empty description="No sections found" />
            ) : (
              <div className="flex flex-col gap-3">
                {filteredSections.map((section) => {
                  const isSelected = selectedSection?.ID === section.ID;
                  const isExpanded = expandedSections.includes(section.ID);

                  return (
                    <div 
                      key={section.ID}
                      className={`
                        border-[2px] rounded-lg transition-all duration-200 cursor-pointer
                        ${isSelected ? "border-[#003087] bg-[#F0F5FF]" : "border-[#E5E7EB] hover:border-[#D1D5DB] bg-white"}
                      `}
                      onClick={() => onSelectSection(section)}
                    >
                      <div className="flex items-start gap-3 p-4">
                        <Checkbox
                          checked={isSelected}
                          className="mt-1"
                          onChange={(e) => {
                            e.stopPropagation();
                            onSelectSection(section);
                          }}
                        />
                        
                        <div className="flex-1">
                          <div className="text-[14px] font-medium text-[#111827]">
                            {section.Name}
                          </div>
                          <div className="text-[13px] text-[#6B7280] mt-1">
                            {section.Parts?.length || 0} parts • {section.Parts?.reduce((acc, p) => acc + (p.Questions?.length || 0), 0) || 0} questions
                          </div>
                        </div>

                        <div 
                          onClick={(e) => { e.stopPropagation(); toggleExpand(section.ID); }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          {isExpanded ? <DownOutlined /> : <RightOutlined />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0 border-t border-[#F1F5F9]">
                          <div className="mt-3 space-y-2">
                            {(section.Parts || []).map((part) => (
                              <div key={part.ID} className="p-3 border border-[#E5E7EB] rounded bg-[#F9FAFB]">
                                <Text className="font-medium text-[#111827] text-[13px]">{part.Content}</Text>
                                <div className="text-[12px] text-gray-500 mt-1">
                                  {part.Questions?.length || 0} questions
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Selected Section */}
        <div className="w-1/2 flex flex-col bg-[#F9FAFB]">
          <div className="p-4 border-b border-[#E5E7EB] bg-white">
            <Text className="font-semibold text-[#111827]">Selected Section</Text>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedSection ? (
              <Card 
                className="border-2 border-[#003087] shadow-sm"
                bodyStyle={{ padding: '16px' }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Text className="text-[16px] font-semibold text-[#111827] block">
                      {selectedSection.Name}
                    </Text>
                    <Text className="text-[13px] text-[#6B7280]">
                      {selectedSection.Parts?.length || 0} parts • {selectedSection.Parts?.reduce((acc, p) => acc + (p.Questions?.length || 0), 0) || 0} questions
                    </Text>
                  </div>
                  <Button 
                    type="text" 
                    danger 
                    icon={<MinusOutlined />}
                    onClick={onRemoveSection}
                    className="flex items-center"
                  >
                    Remove
                  </Button>
                </div>
                
                {selectedSection.Description && (
                  <div className="text-[13px] text-[#6B7280] mb-3 pb-3 border-b border-[#E5E7EB]">
                    {selectedSection.Description}
                  </div>
                )}

                <div className="space-y-2">
                  {(selectedSection.Parts || []).map((part, idx) => (
                    <div key={part.ID} className="flex items-center gap-2 p-2 bg-white rounded border border-[#E5E7EB]">
                      <div className="w-6 h-6 rounded-full bg-[#003087] text-white flex items-center justify-center text-[12px] font-bold">
                        {idx + 1}
                      </div>
                      <Text className="text-[13px] flex-1">{part.Content}</Text>
                      <Tag color="default">{part.Questions?.length || 0}</Tag>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl text-gray-300 mb-3">📭</div>
                  <Text className="text-gray-500">No section selected</Text>
                  <div className="text-[13px] text-gray-400 mt-2">Select a section from the left panel</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QuestionPicker;