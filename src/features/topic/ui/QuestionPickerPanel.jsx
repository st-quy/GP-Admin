import React, { useState } from "react";
import { Spin, Typography, Card, Button, Input, Empty, Tag } from "antd";
import { SearchOutlined, DownOutlined, RightOutlined, MinusOutlined, CheckOutlined } from "@ant-design/icons";
import { useGetSections } from "@features/sections/hooks";

const { Text } = Typography;

const QuestionPickerPanel = ({ 
  skillName,
  selectedSection,
  onSelectSection,
  onRemoveSection 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState([]);
  const [previewSection, setPreviewSection] = useState(null);

  const { data: response, isLoading } = useGetSections({
    skillName: skillName,
    status: 'published',
    enabled: true,
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

  const handleSelect = (section) => {
    onSelectSection(section);
    setPreviewSection(null);
  };

  const displaySection = selectedSection || previewSection;

  return (
    <div className="flex h-[450px] border border-[#E5E7EB] rounded-lg overflow-hidden">
      {/* Left Panel - Available Sections */}
      <div className="w-1/2 border-r border-[#E5E7EB] flex flex-col">
        <div className="p-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <Input
            placeholder="Search sections..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!h-[36px]"
            size="small"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <Spin style={{ width: "100%", display: "flex", justifyContent: "center", padding: "40px 0" }} />
          ) : filteredSections.length === 0 ? (
            <Empty description="No sections found" />
          ) : (
            <div className="flex flex-col gap-2">
              {filteredSections.map((section) => {
                const isExpanded = expandedSections.includes(section.ID);
                const isPreview = previewSection?.ID === section.ID;
                const isSelected = selectedSection?.ID === section.ID;

                return (
                  <div 
                    key={section.ID}
                    className={`
                      border rounded-lg transition-all cursor-pointer
                      ${isSelected ? "border-[#003087] bg-[#F0F5FF]" : isPreview ? "border-[#003087] bg-[#F0F5FF] border-dashed" : "border-[#E5E7EB] hover:border-[#D1D5DB] bg-white"}
                    `}
                    onClick={() => setPreviewSection(section)}
                  >
                    <div className="flex items-start gap-2 p-3">
                      <div className="flex-1">
                        <div className="text-[13px] font-medium text-[#111827]">
                          {section.Name}
                        </div>
                        <div className="text-[12px] text-[#6B7280] mt-0.5">
                          {section.Parts?.length || 0} parts • {section.Parts?.reduce((acc, p) => acc + (p.Questions?.length || 0), 0) || 0} questions
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {isSelected ? (
                          <span className="text-[#003087] text-lg">✓</span>
                        ) : isPreview ? (
                          <Button 
                            type="primary" 
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(section);
                            }}
                            className="!bg-[#003087] !border-none"
                          >
                            Select
                          </Button>
                        ) : (
                          <div 
                            onClick={(e) => { e.stopPropagation(); toggleExpand(section.ID); }}
                            className="p-0.5 text-gray-400 hover:text-gray-600"
                          >
                            {isExpanded ? <DownOutlined /> : <RightOutlined />}
                          </div>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0 border-t border-[#F1F5F9]">
                        <div className="mt-2 space-y-1">
                          {(section.Parts || []).map((part) => (
                            <div key={part.ID} className="p-2 border border-[#E5E7EB] rounded bg-[#F9FAFB]">
                              <Text className="font-medium text-[#111827] text-[12px]">{part.Content}</Text>
                              {part.SubContent && (
                                <Text className="text-[11px] text-gray-500 ml-2">{part.SubContent}</Text>
                              )}
                              <div className="text-[11px] text-gray-500">
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
        <div className="p-3 border-b border-[#E5E7EB] bg-white">
          <Text className="font-semibold text-[#111827]">Selected Section</Text>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          {displaySection ? (
            <Card 
              className={`border-2 shadow-sm ${selectedSection ? 'border-[#003087]' : 'border-dashed border-[#9CA3AF]'}`}
              bodyStyle={{ padding: '16px' }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Text className="text-[16px] font-semibold text-[#111827] block">
                    {displaySection.Name}
                  </Text>
                  <Text className="text-[13px] text-[#6B7280]">
                    {displaySection.Parts?.length || 0} parts • {displaySection.Parts?.reduce((acc, p) => acc + (p.Questions?.length || 0), 0) || 0} questions
                  </Text>
                </div>
                {selectedSection && (
                  <Button 
                    type="text" 
                    danger 
                    icon={<MinusOutlined />}
                    onClick={onRemoveSection}
                    className="flex items-center"
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              {displaySection.Description && (
                <div className="text-[13px] text-[#6B7280] mb-3 pb-3 border-b border-[#E5E7EB]">
                  {displaySection.Description}
                </div>
              )}

              <div className="space-y-2">
                {(displaySection.Parts || []).map((part, idx) => (
                  <div key={part.ID} className="flex items-center gap-2 p-2 bg-white rounded border border-[#E5E7EB]">
                    <div className="w-6 h-6 rounded-full bg-[#003087] text-white flex items-center justify-center text-[12px] font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <Text className="text-[13px] font-medium">{part.Content}</Text>
                      {part.SubContent && (
                        <Text className="text-[12px] text-gray-500 ml-2">{part.SubContent}</Text>
                      )}
                    </div>
                    <Tag color="default">{part.Questions?.length || 0}</Tag>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl text-gray-300 mb-3">👈</div>
                <Text className="text-gray-500 text-[14px]">Select a section from the left</Text>
                <div className="text-[12px] text-gray-400 mt-1">Click to preview, then click Select</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPickerPanel;