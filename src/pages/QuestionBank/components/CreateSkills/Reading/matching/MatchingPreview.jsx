// MatchingPreview.jsx
import React from 'react';
import { Row, Col, Select, Typography, Space } from 'antd';

const { Text, Paragraph } = Typography;
const { Option } = Select;

const MatchingPreview = ({
  content = '', // 🔹 Instruction / Reading text
  leftItems = [],
  rightItems = [],
  mapping = [],
  onChange, // optional: cập nhật mapping khi chọn dropdown
}) => {
  // Helper: lấy rightId đang được map cho từng câu hỏi
  const getRightForLeft = (leftIndex) => {
    const row = mapping.find((m) => m.leftIndex === leftIndex);
    return row?.rightId ?? null;
  };

  return (
    <Space direction='vertical' size='large' style={{ width: '100%' }}>
      {/* 🔹 Instruction / Reading text ở trên (giống screenshot) */}
      {content && (
        <Paragraph
          style={{
            whiteSpace: 'pre-wrap',
            fontSize: 15,
            marginBottom: 8,
          }}
        >
          {content}
        </Paragraph>
      )}

      {/* 🔹 Danh sách câu hỏi + dropdown câu trả lời */}
      {leftItems.map((left, idx) => (
        <Row
          key={left.id || idx}
          align='middle'
          style={{
            padding: '16px 0',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {/* Cột trái – câu hỏi */}
          <Col span={16}>
            <Text style={{ fontSize: 15 }}>
              {idx + 1}. {left.text}
            </Text>
          </Col>

          {/* Cột phải – dropdown chọn đáp án */}
          <Col span={8}>
            <Select
              placeholder='Select'
              value={getRightForLeft(idx)}
              onChange={(value) => onChange && onChange(idx, value)}
              style={{ width: 200 }}
              size='large'
            >
              {rightItems.map((opt) => (
                <Option key={opt.id} value={opt.id}>
                  {opt.text}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      ))}
    </Space>
  );
};

export default MatchingPreview;
