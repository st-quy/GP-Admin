// GrammarMatchingEditorForm.jsx
import React, { useEffect, useState } from 'react';
import { Input, Button, Select, Row, Col, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const GrammarMatchingEditorForm = ({ groupIndex, group, updateGroup }) => {
  // ----- Local State -----
  const [leftItems, setLeftItems] = useState(group.leftItems || []);
  const [rightItems, setRightItems] = useState(group.rightItems || []);
  const [mapping, setMapping] = useState(group.mapping || []);

  /* -----------------------------
      SYNC WITH PARENT
  ------------------------------ */
  useEffect(() => {
    updateGroup({ leftItems, rightItems, mapping });
  }, [leftItems, rightItems, mapping]);

  /* -----------------------------
      AUTO SYNC MAPPING BY LEFT
  ------------------------------ */
  const rebuildMapping = (newLeftItems) => {
    const newMap = newLeftItems.map((item, idx) => ({
      leftId: item.id,
      rightId: mapping[idx]?.rightId || null,
    }));
    setMapping(newMap);
  };

  /* -----------------------------
      ADD LEFT
  ------------------------------ */
  const addLeft = () => {
    const id = Date.now();
    const newLeft = [...leftItems, { id, text: '' }];
    setLeftItems(newLeft);
    rebuildMapping(newLeft);
  };

  /* -----------------------------
      REMOVE LEFT
  ------------------------------ */
  const removeLeft = (idx) => {
    const removedId = leftItems[idx].id;
    const newLeft = leftItems.filter((_, i) => i !== idx);
    const newMap = mapping.filter((m) => m.leftId !== removedId);
    setLeftItems(newLeft);
    setMapping(newMap);
  };

  /* -----------------------------
      ADD RIGHT
  ------------------------------ */
  const addRight = () => {
    setRightItems([...rightItems, { id: Date.now(), text: '' }]);
  };

  /* -----------------------------
      REMOVE RIGHT
  ------------------------------ */
  const removeRight = (idx) => {
    const removedId = rightItems[idx].id;

    setRightItems(rightItems.filter((_, i) => i !== idx));

    // Set rightId = null if mapped to removed
    setMapping(
      mapping.map((m) =>
        m.rightId === removedId ? { ...m, rightId: null } : m
      )
    );
  };

  /* -----------------------------
      UPDATE LEFT TEXT
  ------------------------------ */
  const updateLeft = (idx, value) => {
    const copy = [...leftItems];
    copy[idx].text = value;
    setLeftItems(copy);
  };

  /* -----------------------------
      UPDATE RIGHT TEXT
  ------------------------------ */
  const updateRight = (idx, value) => {
    const copy = [...rightItems];
    copy[idx].text = value;
    setRightItems(copy);
  };

  /* -----------------------------
      UPDATE MAPPING
  ------------------------------ */
  const updateMappingRight = (leftId, rightId) => {
    const copy = [...mapping];
    const found = copy.find((m) => m.leftId === leftId);

    if (found) {
      found.rightId = rightId;
    }

    setMapping(copy);
  };

  return (
    <div style={{ width: '100%' }}>
      <Row gutter={24}>
        {/* LEFT */}
        <Col span={12}>
          <Text strong>Contents</Text>

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
                  danger
                  type='text'
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

        {/* RIGHT */}
        <Col span={12}>
          <Text strong>Options</Text>

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
                  {LETTERS[index]}
                </div>

                <Input
                  placeholder={`Option ${LETTERS[index]}`}
                  value={item.text}
                  onChange={(e) => updateRight(index, e.target.value)}
                />

                <Button
                  danger
                  type='text'
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

      {/* MAPPING */}
      <div
        style={{
          marginTop: 24,
          padding: 16,
          borderRadius: 12,
          background: '#fafafa',
        }}
      >
        <Text strong>Correct Answer Mapping</Text>
        <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
          {mapping.map((m, index) => (
            <Col key={m.leftId} span={24} className='flex items-center'>
              <Text style={{ width: 50 }}>{index + 1} →</Text>

              <Select
                allowClear
                style={{ width: '100%' }}
                placeholder='Select'
                value={m.rightId}
                onChange={(v) => updateMappingRight(m.leftId, v)}
              >
                {rightItems.map((opt, optIdx) => (
                  <Select.Option key={opt.id} value={opt.id}>
                    {LETTERS[optIdx]}. {opt.text}
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

export default GrammarMatchingEditorForm;
