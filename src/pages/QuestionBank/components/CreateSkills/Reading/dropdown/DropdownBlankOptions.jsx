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
                style={{ borderRadius: 8 }}
              >
                {/* LIST OPTION */}
                <Form.List name={[blank.name, 'options']}>
                  {(optionFields, optionHelpers) => (
                    <div className='flex flex-col gap-2'>
                      {optionFields.map((opt, idx) => {
                        const optionId = `${blankData.key}-${idx}`;

                        return (
                          <Space
                            key={opt.key}
                            style={{
                              display: 'flex',
                              width: '100%',
                              gap: 8,
                              alignItems: 'center',
                            }}
                          >
                            {/* Mark Correct Answer */}
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

                            {/* Label A B C D */}
                            <Text style={{ width: 22 }}>
                              {String.fromCharCode(65 + idx)}.
                            </Text>

                            {/* Option text */}
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
                                placeholder='Enter option text'
                                onChange={() => {
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

                            {/* Remove Option */}
                            <CloseOutlined
                              onClick={() => optionHelpers.remove(opt.name)}
                              style={{ cursor: 'pointer', color: '#888' }}
                            />
                          </Space>
                        );
                      })}

                      {/* ADD OPTION */}
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
                {/* INLINE VALIDATION FOR THIS BLANK */}
                <Form.Item
                  name={[blank.name, '_optionsValidator']}
                  validateTrigger='onSubmit'
                  rules={[
                    {
                      validator: () => {
                        const opts =
                          form.getFieldValue([
                            'part1',
                            'blanks',
                            blank.name,
                            'options',
                          ]) || [];

                        if (!opts.length) {
                          return Promise.reject(
                            new Error('This blank must have at least 1 option')
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className='!mb-0'
                >
                  {/* Dummy element để AntD render error UI */}
                  <div style={{ height: 0, marginBottom: 0 }} />
                </Form.Item>
              </Card>
            );
          })}
        </Space>
      )}
    </Form.List>
  );
};

export default DropdownBlankOptions;
