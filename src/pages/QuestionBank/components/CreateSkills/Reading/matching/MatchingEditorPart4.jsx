// Reading/matching/MatchingEditorPart4.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Button, Typography, Space, Select, Form } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

const letterLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const MatchingEditorPart4 = ({ errors = {} }) => {
  const form = Form.useFormInstance();

  /* ------------------------------------------
   * LOCAL STATE — KHÔNG DÙNG useWatch NỮA
   * ------------------------------------------ */
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [mapping, setMapping] = useState([]);

  /* ------------------------------------------
   * LOAD INITIAL DATA FROM FORM (EDIT MODE)
   * ------------------------------------------ */
  useEffect(() => {
    const part = form.getFieldValue('part4') || {};
    setLeftItems(part.leftItems || []);
    setRightItems(part.rightItems || []);
    setMapping(part.mapping || []);
  }, []);

  /* ------------------------------------------
   * SYNC LOCAL STATE → FORM FIELD
   * ------------------------------------------ */
  useEffect(() => {
    form.setFieldsValue({
      part4: { leftItems, rightItems, mapping },
    });
  }, [leftItems, rightItems, mapping]);

  /* ------------------------------------------
   * LEFT ITEMS
   * ------------------------------------------ */
  const addLeftItem = () => {
    const id = Date.now();

    setLeftItems((prev) => [...prev, { id, text: '' }]);

    // mapping ứng với left mới
    setMapping((prev) => [...prev, { leftIndex: prev.length, rightId: null }]);
  };

  const updateLeftItem = (idx, text) => {
    const updated = [...leftItems];
    updated[idx].text = text;
    setLeftItems(updated);
  };

  const removeLeftItem = (idx) => {
    const removed = leftItems[idx];

    // remove left
    const newLeft = leftItems.filter((_, i) => i !== idx);
    setLeftItems(newLeft);

    // update mapping: remove mapping của index đó + shift index
    const newMapping = mapping
      .filter((m) => m.leftIndex !== idx)
      .map((m) => {
        if (m.leftIndex > idx) return { ...m, leftIndex: m.leftIndex - 1 };
        return m;
      });

    setMapping(newMapping);
  };

  /* ------------------------------------------
   * RIGHT ITEMS
   * ------------------------------------------ */
  const addRightItem = () => {
    const id = Date.now();
    setRightItems((prev) => [...prev, { id, text: '' }]);
  };

  const updateRightItem = (id, text) => {
    setRightItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, text } : i))
    );
  };

  const removeRightItem = (id) => {
    setRightItems((prev) => prev.filter((i) => i.id !== id));

    // Xóa mapping rightId tương ứng
    setMapping((prev) =>
      prev.map((m) => (m.rightId === id ? { ...m, rightId: null } : m))
    );
  };

  /* ------------------------------------------
   * MAPPING
   * ------------------------------------------ */
  const setMappedRightId = (leftIndex, rightId) => {
    const updated = [...mapping];
    updated[leftIndex] = { leftIndex, rightId };
    setMapping(updated);
  };

  const getMappedRightId = (leftIndex) => mapping[leftIndex]?.rightId ?? null;

  /* ------------------------------------------
   * RENDER
   * ------------------------------------------ */
  return (
    <Space direction='vertical' size='large' style={{ width: '100%' }}>
      <Row gutter={24}>
        {/* LEFT */}
        <Col span={12}>
          <Text strong>Contents</Text>

          {leftItems.map((item, idx) => (
            <div key={item.id} className='w-full mt-3'>
              <Form.Item
                name={['part4', 'leftItems', idx, 'text']}
                rules={[{ required: true, message: 'Required' }]}
                validateStatus={errors?.left?.[idx] ? 'error' : ''}
                help={errors?.left?.[idx]}
                style={{ marginBottom: 0 }}
              >
                <div className='w-full flex items-center gap-2'>
                  <Text style={{ width: 24, textAlign: 'right' }}>
                    {idx + 1}
                  </Text>

                  <Input
                    placeholder={`Content ${idx + 1}`}
                    value={item.text}
                    onChange={(e) => updateLeftItem(idx, e.target.value)}
                  />

                  <Button
                    type='text'
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeLeftItem(idx)}
                  />
                </div>
              </Form.Item>
            </div>
          ))}

          <Button
            type='dashed'
            icon={<PlusOutlined />}
            onClick={addLeftItem}
            style={{ width: '100%', marginTop: 10 }}
          >
            Add content
          </Button>
        </Col>

        {/* RIGHT */}
        <Col span={12}>
          <Text strong>Options</Text>

          {rightItems.map((item, idx) => (
            <div key={item.id} className='w-full mt-3'>
              <Form.Item
                name={['part4', 'rightItems', idx, 'text']}
                rules={[{ required: true, message: 'Required' }]}
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
                      background: '#e6f7e8',
                      color: '#36b37e',
                      fontWeight: 600,
                    }}
                  >
                    {letterLabels[idx]}
                  </div>

                  <Input
                    placeholder={`Option ${letterLabels[idx]}`}
                    value={item.text}
                    onChange={(e) => updateRightItem(item.id, e.target.value)}
                  />

                  <Button
                    type='text'
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeRightItem(item.id)}
                  />
                </div>
              </Form.Item>
            </div>
          ))}

          <Button
            type='dashed'
            icon={<PlusOutlined />}
            onClick={addRightItem}
            style={{ width: '100%', marginTop: 10 }}
          >
            Add option
          </Button>
        </Col>
      </Row>

      {/* MAPPING */}
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
          {leftItems.map((item, idx) => (
            <Form.Item
              key={`map-${item.id}`}
              name={['part4', 'mapping', idx, 'rightId']}
              rules={[{ required: true, message: 'Required' }]}
              validateStatus={errors?.mapping?.[idx] ? 'error' : ''}
              help={errors?.mapping?.[idx]}
              className='!mb-0 ml-2'
            >
              <Col span={24} className='flex items-center'>
                <Text style={{ width: 50 }}>{idx + 1} →</Text>

                <Select
                  allowClear
                  placeholder='Select'
                  value={getMappedRightId(idx)}
                  onChange={(v) => setMappedRightId(idx, v)}
                >
                  {rightItems.map((opt, optIdx) => (
                    <Option key={opt.id} value={opt.id}>
                      {letterLabels[optIdx]}. {opt.text}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Form.Item>
          ))}
        </Row>
      </div>
    </Space>
  );
};

export default MatchingEditorPart4;
