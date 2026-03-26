// ListeningMatchingEditor.jsx
import React from 'react';
import { Row, Col, Input, Button, Typography, Space, Select, Form } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

const letterLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const ListeningMatchingEditor = ({
  leftItems,
  setLeftItems,
  rightItems,
  setRightItems,
  mapping,
  setMapping,
  errors = {},
}) => {
  /* ---------------- LEFT ---------------- */
  const addLeftItem = () => {
    const newId = Date.now();
    setLeftItems([...leftItems, { id: newId, text: '' }]);

    setMapping([
      ...mapping,
      { leftIndex: leftItems.length, rightId: null }, // leftIndex = index
    ]);
  };

  const updateLeftItem = (idx, value) => {
    const copy = [...leftItems];
    copy[idx].text = value;
    setLeftItems(copy);
  };

  const removeLeftItem = (idx) => {
    setLeftItems(leftItems.filter((_, i) => i !== idx));
    setMapping(mapping.filter((m, i) => i !== idx));
  };

  /* ---------------- RIGHT ---------------- */
  const addRightItem = () => {
    const newId = Date.now();
    setRightItems([...rightItems, { id: newId, text: '' }]);
  };

  const updateRightItem = (idx, value) => {
    const copy = [...rightItems];
    copy[idx].text = value;
    setRightItems(copy);
  };

  const removeRightItem = (idx) => {
    const removed = rightItems[idx].id;

    setRightItems(rightItems.filter((_, i) => i !== idx));

    // Reset mapping with removed option
    const newMapping = mapping.map((m) =>
      m.rightId === removed ? { ...m, rightId: null } : m
    );

    setMapping(newMapping);
  };

  /* ---------------- MAPPING ---------------- */
  const updateMapping = (leftIndex, rightId) => {
    const copy = [...mapping];
    copy[leftIndex].rightId = rightId;
    setMapping(copy);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <Space direction='vertical' size='large' style={{ width: '100%' }}>
      <Row gutter={24}>
        {/* LEFT ITEMS */}
        <Col span={12}>
          <Text strong>Contents</Text>

          {leftItems.map((item, idx) => (
            <div key={item.id} className='w-full mt-3'>
              <Form.Item
                validateStatus={errors?.left?.[idx] ? 'error' : ''}
                help={errors?.left?.[idx]}
                style={{ marginBottom: 0 }}
              >
                <div className='w-full flex items-center gap-2'>
                  <Text style={{ width: 24 }}>{idx + 1}</Text>

                  <Input
                    placeholder={`Content ${idx + 1}`}
                    value={item.text}
                    onChange={(e) => updateLeftItem(idx, e.target.value)}
                  />

                  <Button
                    danger
                    type='text'
                    icon={<DeleteOutlined />}
                    onClick={() => removeLeftItem(idx)}
                  />
                </div>
              </Form.Item>
            </div>
          ))}

          <Button
            style={{ width: '100%', marginTop: 10 }}
            icon={<PlusOutlined />}
            onClick={addLeftItem}
          >
            Add content
          </Button>
        </Col>

        {/* RIGHT ITEMS */}
        <Col span={12}>
          <Text strong>Options</Text>

          {rightItems.map((item, idx) => (
            <div key={item.id} className='w-full mt-3'>
              <Form.Item
                validateStatus={errors?.right?.[idx] ? 'error' : ''}
                help={errors?.right?.[idx]}
                style={{ marginBottom: 0 }}
              >
                <div className='w-full flex items-center gap-2'>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      textAlign: 'center',
                      background: '#e6f7ff',
                      color: '#1677ff',
                      fontWeight: 600,
                    }}
                  >
                    {letterLabels[idx]}
                  </div>

                  <Input
                    placeholder={`Option ${letterLabels[idx]}`}
                    value={item.text}
                    onChange={(e) => updateRightItem(idx, e.target.value)}
                  />

                  <Button
                    danger
                    type='text'
                    icon={<DeleteOutlined />}
                    onClick={() => removeRightItem(idx)}
                  />
                </div>
              </Form.Item>
            </div>
          ))}

          <Button
            style={{ width: '100%', marginTop: 10 }}
            icon={<PlusOutlined />}
            onClick={addRightItem}
          >
            Add option
          </Button>
        </Col>
      </Row>

      {/* MAPPING */}
      <div style={{ background: '#fafafa', padding: 16, borderRadius: 12 }}>
        <Text strong>Correct Mapping</Text>

        <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
          {leftItems.map((item, idx) => (
            <Col span={24} key={item.id}>
              <Form.Item
                validateStatus={errors?.mapping?.[idx] ? 'error' : ''}
                help={errors?.mapping?.[idx]}
                style={{ marginBottom: 0 }}
              >
                <div className='w-full flex items-center gap-2'>
                  <Text style={{ width: 40 }}>{idx + 1} →</Text>

                  <Select
                    allowClear
                    style={{ flex: 1 }}
                    placeholder='Select option'
                    value={mapping[idx]?.rightId || null}
                    onChange={(v) => updateMapping(idx, v)}
                  >
                    {rightItems.map((opt, optIdx) => (
                      <Select.Option key={opt.id} value={opt.id}>
                        {letterLabels[optIdx]}. {opt.text}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Form.Item>
            </Col>
          ))}
        </Row>
      </div>
    </Space>
  );
};

export default ListeningMatchingEditor;
