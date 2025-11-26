// MatchingEditor.jsx
import React from 'react';
import { Row, Col, Input, Button, Typography, Space, Select } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

const letterLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const MatchingEditor = ({
  leftItems,
  setLeftItems,
  rightItems,
  setRightItems,
  mapping,
  setMapping,
}) => {
  /** ------------ LEFT (CONTENTS) ------------ **/
  const addLeftItem = () => {
    setLeftItems((prev) => [...prev, { id: Date.now(), text: '' }]);
  };

  const updateLeftItem = (index, text) => {
    setLeftItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, text } : item))
    );
  };

  const removeLeftItem = (index) => {
    setLeftItems((prev) => prev.filter((_, idx) => idx !== index));
    // xoá mapping của content này, và shift index phía sau
    setMapping((prev) =>
      prev
        .filter((m) => m.leftIndex !== index)
        .map((m) =>
          m.leftIndex > index ? { ...m, leftIndex: m.leftIndex - 1 } : m
        )
    );
  };

  /** ------------ RIGHT (OPTIONS) ------------ **/
  const addRightItem = () => {
    setRightItems((prev) => [...prev, { id: Date.now(), text: '' }]);
  };

  const updateRightItem = (id, text) => {
    setRightItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    );
  };

  const removeRightItem = (id) => {
    setRightItems((prev) => prev.filter((item) => item.id !== id));
    // clear mapping trỏ vào option này
    setMapping((prev) =>
      prev.map((m) => (m.rightId === id ? { ...m, rightId: null } : m))
    );
  };

  /** ------------ MAPPING 1 -> A ------------ **/
  const getMappedRightId = (leftIndex) => {
    const row = mapping.find((m) => m.leftIndex === leftIndex);
    return row?.rightId ?? null;
  };

  const setMappedRightId = (leftIndex, rightId) => {
    setMapping((prev) => {
      const existing = prev.find((m) => m.leftIndex === leftIndex);
      if (existing) {
        return prev.map((m) =>
          m.leftIndex === leftIndex ? { ...m, rightId } : m
        );
      }
      return [...prev, { leftIndex, rightId }];
    });
  };

  return (
    <Space direction='vertical' size='large' style={{ width: '100%' }}>
      <Row gutter={24}>
        {/* LEFT COLUMN - CONTENTS */}
        <Col span={12}>
          <Space direction='vertical' size='small' style={{ width: '100%' }}>
            <Text strong>Contents</Text>
            {leftItems.map((item, idx) => (
              <Space key={item.id} style={{ width: '100%' }} align='baseline'>
                <div style={{ width: 24, textAlign: 'right' }}>
                  <Text>{idx + 1}</Text>
                </div>
                <Input
                  placeholder={`Content item ${idx + 1}`}
                  value={item.text}
                  onChange={(e) => updateLeftItem(idx, e.target.value)}
                />
                <Button
                  type='text'
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeLeftItem(idx)}
                />
              </Space>
            ))}

            <Button
              type='dashed'
              icon={<PlusOutlined />}
              onClick={addLeftItem}
              style={{ width: '100%' }}
            >
              Add more content
            </Button>
          </Space>
        </Col>

        {/* RIGHT COLUMN - OPTIONS */}
        <Col span={12}>
          <Space direction='vertical' size='small' style={{ width: '100%' }}>
            <Text strong>Options</Text>
            {rightItems.map((item, idx) => (
              <Space key={item.id} style={{ width: '100%' }} align='baseline'>
                <div
                  style={{
                    width: 24,
                    textAlign: 'center',
                    borderRadius: '999px',
                    background: '#e6f7e8',
                    color: '#36b37e',
                    fontWeight: 600,
                    padding: '2px 0',
                  }}
                >
                  {letterLabels[idx] || '?'}
                </div>
                <Input
                  placeholder={`Option ${letterLabels[idx] || ''}`}
                  value={item.text}
                  onChange={(e) => updateRightItem(item.id, e.target.value)}
                />
                <Button
                  type='text'
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeRightItem(item.id)}
                />
              </Space>
            ))}

            <Button
              type='dashed'
              icon={<PlusOutlined />}
              onClick={addRightItem}
              style={{ width: '100%' }}
            >
              Add more option
            </Button>
          </Space>
        </Col>
      </Row>

      {/* CORRECT ANSWER MAPPING */}
      <div
        style={{
          marginTop: 16,
          padding: 16,
          borderRadius: 12,
          background: '#fafafa',
        }}
      >
        <Text strong>Correct Answer Mapping</Text>
        <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
          {leftItems.map((_, idx) => (
            <Col key={idx} span={24} className='w-full flex items-center'>
              <Text className='w-10'>{idx + 1} →</Text>
              <Select
                placeholder='Select'
                value={getMappedRightId(idx)}
                onChange={(value) => setMappedRightId(idx, value)}
                style={{ width: '100%' }}
                allowClear
              >
                {rightItems.map((opt, optIdx) => (
                  <Option key={opt.id} value={opt.id}>
                    {`${letterLabels[optIdx] || ''}. ${opt.text || 'Option'}`}
                  </Option>
                ))}
              </Select>
            </Col>
          ))}
        </Row>
      </div>
    </Space>
  );
};

export default MatchingEditor;
