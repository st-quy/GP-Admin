// GrammarMatchingEditor.jsx
import React from 'react';
import { Row, Col, Input, Button, Select, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;
const letterLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const GrammarMatchingEditor = ({ group, updateGroup }) => {
  const { leftItems, rightItems, mapping } = group;

  /* ---------------- LEFT HANDLERS ---------------- */
  const addLeft = () => {
    updateGroup({
      leftItems: [...leftItems, { id: Date.now(), text: '' }],
      mapping: [...mapping, { leftId: Date.now(), rightId: null }],
    });
  };

  const updateLeft = (index, value) => {
    const clone = [...leftItems];
    clone[index].text = value;
    updateGroup({ leftItems: clone });
  };

  const removeLeft = (index) => {
    const removed = leftItems[index].id;
    updateGroup({
      leftItems: leftItems.filter((_, i) => i !== index),
      mapping: mapping.filter((m) => m.leftId !== removed),
    });
  };

  /* ---------------- RIGHT HANDLERS ---------------- */
  const addRight = () => {
    updateGroup({
      rightItems: [...rightItems, { id: Date.now(), text: '' }],
    });
  };

  const updateRight = (index, value) => {
    const clone = [...rightItems];
    clone[index].text = value;
    updateGroup({ rightItems: clone });
  };

  const removeRight = (index) => {
    const removed = rightItems[index].id;
    updateGroup({
      rightItems: rightItems.filter((_, i) => i !== index),
      mapping: mapping.map((m) =>
        m.rightId === removed ? { ...m, rightId: null } : m
      ),
    });
  };

  /* ---------------- MAPPING HANDLER ---------------- */
  const updateMapping = (leftId, rightId) => {
    const clone = [...mapping];
    const found = clone.find((m) => m.leftId === leftId);

    if (found) {
      found.rightId = rightId;
    } else {
      clone.push({ leftId, rightId });
    }

    updateGroup({ mapping: clone });
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={{ width: '100%' }}>
      <Row gutter={24}>
        {/* LEFT SIDE */}
        <Col span={12}>
          <Text strong style={{ fontSize: 16 }}>
            Contents
          </Text>

          {leftItems.map((item, index) => (
            <div key={item.id} style={{ marginTop: 12 }}>
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                {/* Number Circle (same as MatchingEditor UI) */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#EEF6FF',
                    border: '1px solid #C2DBFF',
                    color: '#1A73E8',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {index + 1}
                </div>

                <Input
                  placeholder={`Content ${index + 1}`}
                  value={item.text}
                  onChange={(e) => updateLeft(index, e.target.value)}
                />

                <Button
                  type='text'
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeLeft(index)}
                />
              </div>
            </div>
          ))}

          <Button
            icon={<PlusOutlined />}
            onClick={addLeft}
            style={{ width: '100%', marginTop: 10 }}
          >
            Add Content
          </Button>
        </Col>

        {/* RIGHT SIDE */}
        <Col span={12}>
          <Text strong style={{ fontSize: 16 }}>
            Options
          </Text>

          {rightItems.map((item, index) => (
            <div key={item.id} style={{ marginTop: 12 }}>
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                {/* Letter Circle (same as MatchingEditor UI) */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#E6F7E8',
                    border: '1px solid #B7E4C7',
                    color: '#2F9E44',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {letterLabels[index]}
                </div>

                <Input
                  placeholder={`Option ${letterLabels[index]}`}
                  value={item.text}
                  onChange={(e) => updateRight(index, e.target.value)}
                />

                <Button
                  type='text'
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeRight(index)}
                />
              </div>
            </div>
          ))}

          <Button
            icon={<PlusOutlined />}
            onClick={addRight}
            style={{ width: '100%', marginTop: 10 }}
          >
            Add Option
          </Button>
        </Col>
      </Row>

      {/* MAPPING SECTION */}
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
          {leftItems.map((item, index) => (
            <Col key={item.id} span={24} className='flex items-center'>
              {/* Left index number */}
              <Text style={{ width: 50 }}>{index + 1} →</Text>

              <Select
                placeholder='Select'
                allowClear
                style={{ flex: 1 }}
                value={
                  mapping.find((m) => m.leftId === item.id)?.rightId || null
                }
                onChange={(v) => updateMapping(item.id, v)}
              >
                {rightItems.map((opt, optIdx) => (
                  <Select.Option key={opt.id} value={opt.id}>
                    {letterLabels[optIdx]}. {opt.text}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default GrammarMatchingEditor;
