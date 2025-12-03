// dropdown/DropdownBlankOptions.jsx
import React from 'react';
import { Card, Space, Button, Input, Form, Typography, Radio } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DropdownBlankOptions = () => {
  const form = Form.useFormInstance();

  // 🔥 WATCH TẤT CẢ BLANKS 1 LẦN DUY NHẤT
  const blanks = Form.useWatch(['part1', 'blanks'], form) || [];

  return (
    <Form.List name={['part1', 'blanks']}>
      {(blankFields) => (
        <Space direction='vertical' style={{ width: '100%' }}>
          {blankFields.length === 0 && (
            <Text type='secondary'>
              Insert blank using the <b>Insert Blank</b> button above before
              adding options.
            </Text>
          )}

          {blankFields.map((blank) => {
            const blankData = blanks[blank.name] || {};
            const options = blankData.options || [];
            const correctAnswer = blankData.correctAnswer;

            return (
              <Card
                key={blank.key}
                size='small'
                style={{ marginBottom: 12 }}
                title={`Blank [${blank.name}]`}
              >
                <Space direction='vertical' style={{ width: '100%' }}>
                  <Form.List name={[blank.name, 'options']}>
                    {(optionFields, optionHelpers) => (
                      <>
                        {optionFields.map((opt, idx) => {
                          const optData = options[opt.name] || {};
                          const optionId = optData.id;

                          return (
                            <Space
                              key={opt.key}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '10px',
                              }}
                            >
                              {/* Radio */}
                              <Radio
                                checked={correctAnswer === optionId}
                                onChange={() =>
                                  form.setFieldValue(
                                    [
                                      'part1',
                                      'blanks',
                                      blank.name,
                                      'correctAnswer',
                                    ],
                                    optionId
                                  )
                                }
                              />

                              {/* Label A/B/C */}
                              <Text style={{ width: 22 }}>
                                {String.fromCharCode(65 + idx)}.
                              </Text>

                              {/* INPUT */}
                              <Form.Item
                                {...opt}
                                name={[opt.name, 'value']}
                                style={{ flexGrow: 1 }}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Option text is required',
                                  },
                                ]}
                                className='!mb-0'
                              >
                                <Input placeholder='Option text' />
                              </Form.Item>

                              {/* Remove */}
                              <CloseOutlined
                                onClick={() => optionHelpers.remove(opt.name)}
                                style={{
                                  cursor: 'pointer',
                                  marginTop: 8,
                                  color: '#777',
                                }}
                              />
                            </Space>
                          );
                        })}

                        {/* Add option */}
                        <Button
                          type='dashed'
                          icon={<PlusOutlined />}
                          onClick={() =>
                            optionHelpers.add({
                              id: Date.now() + Math.random(), // 🔥 identity ổn định
                              value: '',
                            })
                          }
                        >
                          Add Option
                        </Button>
                      </>
                    )}
                  </Form.List>
                </Space>
              </Card>
            );
          })}
        </Space>
      )}
    </Form.List>
  );
};

export default DropdownBlankOptions;
