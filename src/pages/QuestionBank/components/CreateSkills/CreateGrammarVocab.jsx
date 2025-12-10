// CreateGrammarVocab.jsx
import React, { useState } from 'react';
import { Card, Collapse, Form, Input, Select, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCreateQuestion } from '@features/questions/hooks';
import GrammarMatchingEditorForm from './GrammarAndVocabulary/multiple-choice/GrammarMatchingEditorForm';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const CreateGrammarVocab = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { mutate: createQuestion, isPending } = useCreateQuestion();

  /* -------------------------------------------
       PART 2 — Local state (for matching)
  ------------------------------------------- */
  const [part2Groups, setPart2Groups] = useState(
    Array.from({ length: 5 }, () => ({
      content: '',
      leftItems: [],
      rightItems: [],
      mapping: [],
    }))
  );

  const updateGroup = (index, data) => {
    setPart2Groups((prev) => {
      const clone = [...prev];
      clone[index] = { ...clone[index], ...data };
      return clone;
    });
  };

  /* WATCH PART 1 */
  const part1Values = Form.useWatch('part1', form) || [];

  /* VALIDATE PART 1 */
  const validatePart1Question = (q) => {
    if (!q?.instruction?.trim()) return false;
    if (!q.options || q.options.some((o) => !o.value?.trim())) return false;
    if (q.correctOptionId === null || q.correctOptionId === undefined)
      return false;
    return true;
  };

  /* VALIDATE GROUP */
  const validateGroup = (g) => {
    if (!g.content?.trim()) return false;

    if (!g.leftItems.length || g.leftItems.some((i) => !i.text?.trim()))
      return false;
    if (!g.rightItems.length || g.rightItems.some((i) => !i.text?.trim()))
      return false;

    if (!g.mapping.length) return false;

    return g.mapping.every(
      (m) =>
        m.leftId !== null &&
        m.rightId !== null &&
        g.leftItems.find((x) => x.id === m.leftId) &&
        g.rightItems.find((x) => x.id === m.rightId)
    );
  };

  const renderStatus = (valid) => (
    <span style={{ marginLeft: 8 }}>
      {valid ? (
        <span style={{ color: 'green' }}>✔</span>
      ) : (
        <span style={{ color: 'red' }}>✖</span>
      )}
    </span>
  );

  /* SAVE */
  const handleSaveAll = async () => {
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);
      const { sectionName, part1Name, part2Name, part1 } = values;

      /* Part 1 build */
      const part1Questions = part1.map((q, idx) => {
        const options = q.options.map((o, i) => ({
          key: LETTERS[i],
          value: o.value.trim(),
        }));
        return {
          Type: 'multiple-choice',
          Sequence: idx + 1,
          Content: q.instruction,
          AnswerContent: {
            title: q.instruction,
            options,
            correctAnswer: options[q.correctOptionId].value,
          },
        };
      });

      /* Part 2 build */
      const part2Questions = part2Groups.map((g, idx) => {
        const leftItems = g.leftItems.map((i) => i.text);
        const rightItems = g.rightItems.map((i) => i.text);

        return {
          Type: 'matching',
          Sequence: idx + 26,
          Content: g.content,
          AnswerContent: {
            content: g.content,
            leftItems,
            rightItems,
            correctAnswer: g.mapping.map((m) => ({
              left: leftItems[g.leftItems.findIndex((x) => x.id === m.leftId)],
              right:
                rightItems[g.rightItems.findIndex((x) => x.id === m.rightId)],
            })),
          },
        };
      });

      const payload = {
        SkillName: 'GRAMMAR AND VOCABULARY',
        SectionName: sectionName,
        parts: {
          part1: {
            name: part1Name,
            sequence: 1,
            questions: part1Questions,
          },
          part2: {
            name: part2Name,
            sequence: 2,
            questions: part2Questions,
          },
        },
      };

      createQuestion(payload, {
        onSuccess: () => {
          message.success('Created successfully!');
          navigate(-1);
        },
        onError: () => message.error('Failed to create listening'),
      });
    } catch {
      message.error('Please fix errors in Part 1');
    }
  };

  return (
    <Form
      layout='vertical'
      form={form}
      initialValues={{
        sectionName: '',
        part1Name: '',
        part2Name: '',
        part1: Array.from({ length: 25 }, () => ({
          instruction: '',
          options: [{ value: '' }, { value: '' }, { value: '' }],
          correctOptionId: null,
        })),
      }}
    >
      {/* SECTION */}
      <Card title='Section Information' className='mb-5'>
        <Form.Item label='Name' name='sectionName' rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Card>

      {/* PART 1 */}
      <Card title='PART 1 — Multiple Choice (25 Questions)' className='mb-6'>
        <Form.Item
          label='Part Name'
          name='part1Name'
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Collapse accordion>
          {Array.from({ length: 25 }).map((_, idx) => (
            <Panel
              key={idx}
              header={
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  Question {idx + 1}
                  {renderStatus(validatePart1Question(part1Values[idx] || {}))}
                </div>
              }
            >
              <Form.Item
                name={['part1', idx, 'instruction']}
                label='Instruction'
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>

              {/* OPTIONS — 3 fixed + dynamic additional */}
              <Form.List name={['part1', idx, 'options']}>
                {(fields, { add, remove }) => {
                  const optionValues =
                    form.getFieldValue(['part1', idx, 'options']) || [];

                  return (
                    <>
                      {fields.map((field, optIdx) => (
                        <div
                          key={field.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: 10,
                          }}
                        >
                          {/* LABEL A B C D E... */}
                          <div style={{ width: 22, fontWeight: 600 }}>
                            {LETTERS[optIdx]}
                          </div>

                          {/* INPUT */}
                          <Form.Item
                            {...field}
                            name={[field.name, 'value']}
                            style={{ flex: 1, marginBottom: 0 }}
                            rules={[
                              { required: true, message: 'Option is required' },
                            ]}
                          >
                            <Input placeholder={`Option ${LETTERS[optIdx]}`} />
                          </Form.Item>

                          {/* DELETE BUTTON (only delete from option #4 → index ≥ 3) */}
                          {optIdx >= 3 && (
                            <DeleteOutlined
                              style={{
                                color: 'red',
                                fontSize: 18,
                                cursor: 'pointer',
                              }}
                              onClick={() => remove(field.name)}
                            />
                          )}
                        </div>
                      ))}

                      {/* ADD OPTION BUTTON */}
                      <Button
                        type='dashed'
                        icon={<PlusOutlined />}
                        onClick={() => add()}
                        style={{ marginTop: 8 }}
                      >
                        Add option
                      </Button>
                    </>
                  );
                }}
              </Form.List>

              {/* CORRECT ANSWER */}
              <Form.Item
                label='Correct Answer'
                name={['part1', idx, 'correctOptionId']}
                rules={[{ required: true }]}
                style={{ marginTop: 15 }}
              >
                <Select
                  placeholder='Select correct answer'
                  options={(
                    form.getFieldValue(['part1', idx, 'options']) || []
                  ).map((_, i) => ({
                    value: i,
                    label: LETTERS[i],
                  }))}
                />
              </Form.Item>
            </Panel>
          ))}
        </Collapse>
      </Card>

      {/* PART 2 */}
      <Card title='PART 2 — Matching (5 Groups)' className='mb-6'>
        <Form.Item
          label='Part Name'
          name='part2Name'
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Collapse accordion>
          {part2Groups.map((g, idx) => (
            <Panel
              key={idx}
              header={
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  Group {idx + 1}
                  {renderStatus(validateGroup(g))}
                </div>
              }
            >
              <Form.Item
                label='Instruction Text'
                required
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input.TextArea
                  value={g.content}
                  onChange={(e) =>
                    updateGroup(idx, { content: e.target.value })
                  }
                  rows={2}
                />
              </Form.Item>

              {/* Matching Editor */}
              <GrammarMatchingEditorForm
                groupIndex={idx}
                group={g}
                updateGroup={(data) => updateGroup(idx, data)}
              />
              <Form.Item noStyle shouldUpdate>
                {() => {
                  const g = part2Groups[idx] || {};
                  const left = Array.isArray(g.leftItems) ? g.leftItems : [];
                  const right = Array.isArray(g.rightItems) ? g.rightItems : [];
                  const mapping = Array.isArray(g.mapping) ? g.mapping : [];

                  return (
                    <Form.Item
                      name={['part2', idx, '_validation']}
                      rules={[
                        {
                          validator: () => {
                            if (!g.content?.trim()) {
                              return Promise.reject(
                                new Error('Instruction is required')
                              );
                            }
                            if (left.length < 1) {
                              return Promise.reject(
                                new Error('Must have at least 1 content')
                              );
                            }
                            if (right.length < 1) {
                              return Promise.reject(
                                new Error('Must have at least 1 option')
                              );
                            }
                            if (mapping.length < 1) {
                              return Promise.reject(
                                new Error(
                                  'Must have at least 1 correct matching pair'
                                )
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      {/* hidden trigger */}
                      <div style={{ height: 0 }} />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Panel>
          ))}
        </Collapse>
      </Card>

      <div className='flex justify-end gap-4 mt-6'>
        <Button onClick={() => navigate(-1)}>Cancel</Button>
        <Button type='primary' loading={isPending} onClick={handleSaveAll}>
          Save
        </Button>
      </div>
    </Form>
  );
};

export default CreateGrammarVocab;
