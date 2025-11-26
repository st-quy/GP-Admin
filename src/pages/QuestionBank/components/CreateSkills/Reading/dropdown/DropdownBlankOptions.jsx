// dropdown/DropdownBlankOptions.jsx
import React from 'react';
import { Card, Space, Button, Input, Typography, Radio } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DropdownBlankOptions = ({
  blanks,
  errors,
  addOption,
  updateOptionValue,
  removeOption,
  setCorrectAnswer,
}) => {
  const getLabel = (index) => String.fromCharCode(65 + index);

  return (
    <>
      {blanks.length === 0 && (
        <Text type='secondary'>
          Insert blank bằng nút <b>Insert Blank</b> phía trên trước khi thêm
          options.
        </Text>
      )}

      {blanks.map((b) => (
        <Card
          key={b.key}
          size='small'
          title={`Blank [${b.key}]`}
          style={{ marginBottom: 12 }}
        >
          <Space direction='vertical' style={{ width: '100%' }}>
            <Button
              type='dashed'
              icon={<PlusOutlined />}
              onClick={() => addOption(b.key)}
            >
              Add Option
            </Button>

            {b.options.map((o, idx) => (
              <Space key={o.id} style={{ width: '100%', display: 'flex' }}>
                <Radio
                  checked={b.correctAnswer === o.id}
                  onChange={() => setCorrectAnswer(b.key, o.id)}
                />

                <Text style={{ width: 22 }}>{getLabel(idx)}.</Text>

                <Input
                  placeholder='Option text'
                  value={o.value}
                  onChange={(e) =>
                    updateOptionValue(b.key, o.id, e.target.value)
                  }
                />

                <CloseOutlined
                  style={{ color: '#777', cursor: 'pointer' }}
                  onClick={() => removeOption(b.key, o.id)}
                />
              </Space>
            ))}

            {errors[b.key] && (
              <div style={{ marginTop: 4 }}>
                {errors[b.key].map((msg, idx) => (
                  <Text key={idx} type='danger' style={{ fontSize: 12 }}>
                    {msg}
                  </Text>
                ))}
              </div>
            )}
          </Space>
        </Card>
      ))}
    </>
  );
};

export default DropdownBlankOptions;
