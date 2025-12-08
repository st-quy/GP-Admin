// CreateGrammarVocab.jsx
import React, { useState } from 'react';
import { Card, Collapse, Form, Input, Select, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCreateQuestion } from '@features/questions/hooks';
import GrammarMatchingEditorForm from './GrammarAndVocabulary/multiple-choice/GrammarMatchingEditorForm';

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
    if (!g.content.trim()) return false;
    if (!g.leftItems.length || g.leftItems.some((i) => !i.text.trim()))
      return false;
    if (!g.rightItems.length || g.rightItems.some((i) => !i.text.trim()))
      return false;
    if (!g.mapping.length) return false;
    return g.mapping.every((m) => m.rightId !== null);
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
      // await form.validateFields();

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

              {Array.from({ length: 3 }).map((_, optIdx) => (
                <div key={optIdx} style={{ display: 'flex', gap: 10 }}>
                  <b>{LETTERS[optIdx]}</b>
                  <Form.Item
                    name={['part1', idx, 'options', optIdx, 'value']}
                    style={{ flex: 1 }}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </div>
              ))}

              <Form.Item
                name={['part1', idx, 'correctOptionId']}
                label='Correct Answer'
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { value: 0, label: 'A' },
                    { value: 1, label: 'B' },
                    { value: 2, label: 'C' },
                  ]}
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
