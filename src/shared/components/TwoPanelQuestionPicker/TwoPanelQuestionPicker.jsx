import React, { useState, useMemo } from 'react';
import { Row, Col, Card, Input, List, Checkbox, Button, Typography, Empty, Space, Tag, Divider } from 'antd';
import { SearchOutlined, PlusOutlined, DeleteOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * FR-107: Two-panel question picker UI
 * @param {Object} props
 * @param {Array} props.availableItems - List of sections/questions from bank
 * @param {Array} props.selectedItems - Initially selected items
 * @param {Function} props.onChange - Callback when selection changes
 * @param {boolean} props.loading - Loading state
 */
const TwoPanelQuestionPicker = ({ 
  availableItems = [], 
  selectedItems = [], 
  onChange, 
  loading = false,
  skillName = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter available items based on search term and exclude already selected
  const filteredAvailable = useMemo(() => {
    return availableItems.filter(item => {
      const matchesSearch = item.Name.toLowerCase().includes(searchTerm.toLowerCase());
      const isNotSelected = !selectedItems.some(selected => selected.ID === item.ID);
      return matchesSearch && isNotSelected;
    });
  }, [availableItems, selectedItems, searchTerm]);

  const handleAdd = (item) => {
    const newSelected = [...selectedItems, item];
    if (onChange) onChange(newSelected);
  };

  const handleRemove = (itemId) => {
    const newSelected = selectedItems.filter(item => item.ID !== itemId);
    if (onChange) onChange(newSelected);
  };

  const handleAddAll = () => {
    const newSelected = [...selectedItems, ...filteredAvailable];
    if (onChange) onChange(newSelected);
  };

  const handleClearAll = () => {
    if (onChange) onChange([]);
  };

  return (
    <div className="two-panel-picker" style={{ height: '600px' }}>
      <Row gutter={16} style={{ height: '100%' }}>
        {/* Left Panel: Bank */}
        <Col span={12} style={{ height: '100%' }}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={5} style={{ margin: 0 }}>Question Bank ({skillName})</Title>
                <Button size="small" type="link" onClick={handleAddAll} disabled={filteredAvailable.length === 0}>
                  Add All
                </Button>
              </div>
            }
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <Input 
              placeholder="Search sections..." 
              prefix={<SearchOutlined />} 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <List
                loading={loading}
                dataSource={filteredAvailable}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button 
                        type="text" 
                        icon={<PlusOutlined />} 
                        onClick={() => handleAdd(item)}
                      />
                    ]}
                    style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 8, border: '1px solid #f0f0f0' }}
                  >
                    <List.Item.Meta
                      title={<Text strong>{item.Name}</Text>}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" size="small">{item.Description || "No description"}</Text>
                          <Tag color="blue">{item.Parts?.length || 0} Parts</Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: <Empty description="No sections found" /> }}
              />
            </div>
          </Card>
        </Col>

        {/* Right Panel: Selection */}
        <Col span={12} style={{ height: '100%' }}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={5} style={{ margin: 0 }}>Selected ({selectedItems.length})</Title>
                <Button size="small" type="link" danger onClick={handleClearAll} disabled={selectedItems.length === 0}>
                  Clear All
                </Button>
              </div>
            }
            style={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #1677ff' }}
            bodyStyle={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <List
                dataSource={selectedItems}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleRemove(item.ID)}
                      />
                    ]}
                    style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 8, border: '1px solid #e6f7ff', background: '#f0faff' }}
                  >
                    <List.Item.Meta
                      title={<Text strong>{item.Name}</Text>}
                      description={<Tag color="cyan">{item.Skill?.Name || skillName}</Tag>}
                    />
                  </List.Item>
                )}
                locale={{ emptyText: <Empty description="Select questions from the left" /> }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TwoPanelQuestionPicker;
