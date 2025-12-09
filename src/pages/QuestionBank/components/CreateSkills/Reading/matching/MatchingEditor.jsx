import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Button, Typography, Space, Select, Form } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

const letterLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const MatchingEditor = ({ errors = {} }) => {
  const form = Form.useFormInstance();

  // ⭐ KHÔNG dùng useWatch nữa
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [mapping, setMapping] = useState([]);

  // ⭐ Khi form có giá trị từ bên ngoài (edit mode) → load vào state
  useEffect(() => {
    const part = form.getFieldValue('part3') || {};
    setLeftItems(part.leftItems || []);
    setRightItems(part.rightItems || []);
    setMapping(part.mapping || []);
  }, []);

  // ⭐ Khi state thay đổi → sync vào form
  useEffect(() => {
    form.setFieldsValue({
      part3: { leftItems, rightItems, mapping },
    });
  }, [leftItems, rightItems, mapping]);

  /* ---------------- LEFT ---------------- */
  const addLeftItem = () => {
    const id = Date.now();
    setLeftItems((prev) => [...prev, { id, text: '' }]);
    setMapping((prev) => [...prev, { leftIndex: prev.length, rightId: null }]);
  };

  const updateLeftItem = (idx, text) => {
    const copy = [...leftItems];
    copy[idx].text = text;
    setLeftItems(copy);
  };

  const removeLeftItem = (idx) => {
    const item = leftItems[idx];

    setLeftItems((prev) => prev.filter((_, i) => i !== idx));
    setMapping((prev) => prev.filter((m) => m.leftIndex !== item.id));
  };

  /* ---------------- RIGHT ---------------- */
  const addRightItem = () => {
    setRightItems((prev) => [...prev, { id: Date.now(), text: '' }]);
  };

  const updateRightItem = (idx, text) => {
    const copy = [...rightItems];
    copy[idx].text = text;
    setRightItems(copy);
  };

  const removeRightItem = (idx) => {
    const removedId = rightItems[idx]?.id;

    setRightItems((prev) => prev.filter((_, i) => i !== idx));
    setMapping((prev) =>
      prev.map((m) => (m.rightId === removedId ? { ...m, rightId: null } : m))
    );
  };

  /* ---------------- MAPPING ---------------- */
  const setMappedRightId = (idx, rightId) => {
    const copy = [...mapping];
    copy[idx].rightId = rightId;
    setMapping(copy);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <Space direction='vertical' size='large' style={{ width: '100%' }}>
      <Row gutter={24}>
        {/* LEFT */}
        <Col span={12}>
          <Text strong>Contents</Text>

          {leftItems.map((item, idx) => (
            <div key={item.id} className='w-full mt-3'>
              <Form.Item
                name={['part3', 'leftItems', idx, 'text']}
                rules={[{ required: true, message: 'Required' }]}
                validateStatus={errors?.left?.[idx] ? 'error' : ''}
                help={errors?.left?.[idx]}
                style={{ marginBottom: 0, width: '100%' }}
              >
                <div className='w-full flex items-center gap-2'>
                  <Text className='min-w-10'>{idx + 1}</Text>

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
            Add more content
          </Button>
        </Col>

        {/* RIGHT */}
        <Col span={12}>
          <Text strong>Options</Text>

          {rightItems.map((item, idx) => (
            <div key={item.id} className='w-full mt-3'>
              <Form.Item
                name={['part3', 'rightItems', idx, 'text']}
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
            Add more option
          </Button>
        </Col>
      </Row>

      {/* MAPPING */}
      <div style={{ background: '#fafafa', padding: 16, borderRadius: 12 }}>
        <Text strong>Correct Answer Mapping</Text>

        <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
          {leftItems.map((item, idx) => (
            <Form.Item
              key={`map-${item.id}`}
              name={['part3', 'mapping', idx, 'rightId']}
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
                  value={mapping[idx]?.rightId || null}
                  onChange={(v) => setMappedRightId(idx, v)}
                >
                  {rightItems.map((opt, optIdx) => (
                    <Select.Option key={opt.id} value={opt.id}>
                      {letterLabels[optIdx]}. {opt.text}
                    </Select.Option>
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

export default MatchingEditor;
