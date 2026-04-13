import React, { useState } from "react";
import { Spin, Typography, Card, Button, Input, Empty, Tag, Select, Space } from "antd";
import { SearchOutlined, DownOutlined, RightOutlined, MinusOutlined, CheckOutlined, TagOutlined } from "@ant-design/icons";
import { useGetSections, useGetAllTags } from "@features/sections/hooks";

const { Text } = Typography;

const QuestionPickerPanel = ({ 
  skillName,
  selectedSection,
  onSelectSection,
  onRemoveSection 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [expandedSections, setExpandedSections] = useState([]);
  const [previewSection, setPreviewSection] = useState(null);

  const { data: response, isLoading } = useGetSections({
    skillName: skillName,
    status: 'published',
    enabled: true,
  });

  const { data: allTags = [] } = useGetAllTags();

  const allSections = response?.data || [];
  
  const filteredSections = allSections.filter(section => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      section.Name?.toLowerCase().includes(searchLower) ||
      section.Description?.toLowerCase().includes(searchLower) ||
      (section.Tags || []).some(tag => tag.toLowerCase().includes(searchLower));
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => (section.Tags || []).includes(tag));
      
    return matchesSearch && matchesTags;
  });

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
    <div className="flex h-[500px] border border-[#E5E7EB] rounded-lg overflow-hidden">
      {/* Left Panel - Available Sections */}
      <div className="w-1/2 border-r border-[#E5E7EB] flex flex-col">
        <div className="p-3 border-b border-[#E5E7EB] bg-[#F9FAFB] space-y-2">
          <Input
            placeholder="Search sections..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!h-[36px]"
            size="small"
            allowClear
          />
          <Select
            mode="multiple"
            placeholder="Filter by tags..."
            className="w-full"
            maxTagCount="responsive"
            value={selectedTags}
            onChange={setSelectedTags}
            suffixIcon={<TagOutlined />}
            allowClear
            size="small"
            options={allTags.map(tag => ({ label: tag, value: tag }))}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 bg-white">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Spin />
            </div>
          ) : filteredSections.length === 0 ? (
            <Empty description="No sections found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="text-[13px] font-semibold text-[#111827] truncate">
                            {section.Name}
                          </span>
                          {section.Tags && section.Tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {section.Tags.slice(0, 3).map(tag => {
                                const isMatch = searchTerm && tag.toLowerCase().includes(searchTerm.toLowerCase());
                                return (
                                  <Tag 
                                    key={tag} 
                                    color="blue" 
                                    className={`text-[10px] px-1 py-0 m-0 border-none ${isMatch ? "bg-[#FFEB3B] text-black font-bold" : "bg-[#E6F0FA] text-[#003087]"}`}
                                  >
                                    {tag}
                                  </Tag>
                                );
                              })}
                              {section.Tags.length > 3 && (
                                <span className="text-[10px] text-gray-400">+{section.Tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-[12px] text-[#6B7280]">
                          {section.Parts?.length || 0} parts • {section.Parts?.reduce((acc, p) => acc + (p.Questions?.length || 0), 0) || 0} questions
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isSelected ? (
                          <span className="text-[#003087] text-lg font-bold">✓</span>
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
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          >
                            {isExpanded ? <DownOutlined size={12} /> : <RightOutlined size={12} />}
                          </div>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0 border-t border-[#F1F5F9]">
                        <div className="mt-2 space-y-1">
                          {(section.Parts || []).map((part) => (
                            <div key={part.ID} className="p-2 border border-[#E5E7EB] rounded bg-[#F9FAFB]">
                              <div className="flex justify-between items-start gap-2">
                                <Text className="font-medium text-[#111827] text-[12px] flex-1">{part.Content}</Text>
                                <Tag color="default" className="text-[10px] m-0 border-none bg-gray-200">
                                  {part.Questions?.length || 0} Q
                                </Tag>
                              </div>
                              {part.SubContent && (
                                <div className="text-[11px] text-gray-500 mt-0.5">{part.SubContent}</div>
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
          )}
        </div>
      </div>

      {/* Right Panel - Selected Section */}
      <div className="w-1/2 flex flex-col bg-[#F9FAFB]">
        <div className="p-3 border-b border-[#E5E7EB] bg-white h-[53px] flex items-center justify-between">
          <Text className="font-semibold text-[#111827]">Selected Section</Text>
          {selectedSection && (
            <Button 
              type="text" 
              danger 
              size="small"
              icon={<MinusOutlined />}
              onClick={onRemoveSection}
              className="flex items-center text-[12px]"
            >
              Remove
            </Button>
          )}
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          {displaySection ? (
            <Card 
              className={`border-2 shadow-sm ${selectedSection ? 'border-[#003087]' : 'border-dashed border-[#9CA3AF]'}`}
              bodyStyle={{ padding: '16px' }}
            >
              <div className="mb-3">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Text className="text-[16px] font-bold text-[#111827]">
                    {displaySection.Name}
                  </Text>
                  {displaySection.Tags && displaySection.Tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {displaySection.Tags.map(tag => (
                        <Tag key={tag} color="blue" className="text-[11px] px-1.5 py-0 m-0 border-none bg-[#E6F0FA] text-[#003087]">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
                <Text className="text-[13px] text-[#6B7280]">
                  {displaySection.Parts?.length || 0} parts • {displaySection.Parts?.reduce((acc, p) => acc + (p.Questions?.length || 0), 0) || 0} questions
                </Text>
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
                        <div className="text-[12px] text-gray-500">{part.SubContent}</div>
                      )}
                    </div>
                    <Tag color="default" className="m-0">{part.Questions?.length || 0}</Tag>
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