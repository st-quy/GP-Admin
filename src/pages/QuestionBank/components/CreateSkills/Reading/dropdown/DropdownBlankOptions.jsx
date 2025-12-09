// dropdown/DropdownBlankOptions.jsx
import React from 'react';
import { Card, Space, Button, Input, Form, Typography, Radio } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DropdownBlankOptions = () => {
  const form = Form.useFormInstance();
  const blanks = Form.useWatch(['part1', 'blanks'], form) || [];

  return (
    <Form.List name={['part1', 'blanks']}>
      {(blankFields) => (
        <Space direction='vertical' style={{ width: '100%' }}>
          {blankFields.map((blank) => {
            const blankData = blanks[blank.name] || {};
            const options = blankData.options || [];
            const correctAnswer = blankData.correctAnswer;

            return (
              <Card
                key={blank.key}
                size='small'
                title={`Blank [${blankData.key}]`}
              >
                <Form.List name={[blank.name, 'options']}>
                  {(optionFields, optionHelpers) => (
                    <div className='flex flex-col gap-2'>
                      {optionFields.map((opt, idx) => {
                        const optionId = `${blankData.key}-${idx}`;

                        return (
                          <Space
                            key={opt.key}
                            style={{ display: 'flex', width: '100%', gap: 8 }}
                          >
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

                            <Text style={{ width: 22 }}>
                              {String.fromCharCode(65 + idx)}.
                            </Text>

                            <Form.Item
                              name={[opt.name, 'value']}
                              style={{ flex: 1 }}
                              className='!mb-0'
                              rules={[
                                {
                                  required: true,
                                  message: 'Option text is required',
                                },
                              ]}
                            >
                              <Input
                                onChange={(e) => {
                                  const value = e.target.value;

                                  // cập nhật id ổn định
                                  form.setFieldValue(
                                    [
                                      'part1',
                                      'blanks',
                                      blank.name,
                                      'options',
                                      opt.name,
                                      'id',
                                    ],
                                    optionId
                                  );
                                }}
                              />
                            </Form.Item>

                            <CloseOutlined
                              onClick={() => optionHelpers.remove(opt.name)}
                              style={{ cursor: 'pointer' }}
                            />
                          </Space>
                        );
                      })}

                      <Button
                        type='dashed'
                        icon={<PlusOutlined />}
                        onClick={() =>
                          optionHelpers.add({
                            id: `${blankData.key}-${options.length}`,
                            value: '',
                          })
                        }
                      >
                        Add Option
                      </Button>
                    </div>
                  )}
                </Form.List>
              </Card>
            );
          })}
        </Space>
      )}
    </Form.List>
  );
};

export default DropdownBlankOptions;
