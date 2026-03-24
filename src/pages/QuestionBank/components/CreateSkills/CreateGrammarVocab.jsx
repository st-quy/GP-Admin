// CreateGrammarVocab.jsx
// Component for creating Grammar & Vocabulary questions with two parts:
// - Part 1: Multiple Choice (25 questions)
// - Part 2: Matching (5 groups)
import React, { useState } from "react";
import { Card, Collapse, Form, Input, Select, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useCreateQuestion } from "@features/questions/hooks";
import GrammarMatchingEditorForm from "./GrammarAndVocabulary/multiple-choice/GrammarMatchingEditorForm";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
// Array of letters A-Z for labeling multiple choice options
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const CreateGrammarVocab = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  // Hook to create question via API
  const { mutate: createQuestion, isPending } = useCreateQuestion();

  /* -------------------------------------------
       PART 2 — Local state (for matching)
       Manages 5 matching groups with left/right items and their mappings
  ------------------------------------------- */
  const [part2Groups, setPart2Groups] = useState(
    Array.from({ length: 5 }, () => ({
      content: "",
      leftItems: [],
      rightItems: [],
      mapping: [],
    })),
  );

  // Updates a specific matching group by index with new data
  const updateGroup = (index, data) => {
    setPart2Groups((prev) => {
      const clone = [...prev];
      clone[index] = { ...clone[index], ...data };
      return clone;
    });
  };

  /* WATCH PART 1 - Real-time watch for Part 1 form values */
  const part1Values = Form.useWatch("part1", form) || [];

  /* VALIDATE PART 1 - Validates a single multiple choice question */
  const validatePart1Question = (q) => {
    if (!q?.instruction?.trim()) return false;
    if (!q.options || q.options.some((o) => !o?.value?.trim())) return false;
    if (q.correctOptionId === null || q.correctOptionId === undefined)
      return false;
    return true;
  };

  /* VALIDATE GROUP - Validates a matching group has all required fields */
  const validateGroup = (g) => {
    if (!g.content?.trim()) return false;

    if (!g.leftItems.length || g.leftItems.some((i) => !i.text?.trim()))
      return false;
    if (!g.rightItems.length || g.rightItems.some((i) => !i.text?.trim()))
      return false;

    if (!g.mapping.length) return false;

    // Ensure all mappings have valid left and right item references
    return g.mapping.every(
      (m) =>
        m.leftId !== null &&
        m.rightId !== null &&
        g.leftItems.find((x) => x.id === m.leftId) &&
        g.rightItems.find((x) => x.id === m.rightId),
    );
  };

  // Renders validation status icon (checkmark or cross)
  const renderStatus = (valid) => (
    <span style={{ marginLeft: 8 }}>
      {valid ? (
        <span style={{ color: "green" }}>✔</span>
      ) : (
        <span style={{ color: "red" }}>✖</span>
      )}
    </span>
  );

  /* SAVE - Handles form validation and question creation */
  const handleSaveAll = async () => {
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);
      const { sectionName, description, part1Name, part2Name, part1 } = values;

      /* Part 1 build - Transform multiple choice questions to API payload */
      const part1Questions = part1.map((q, idx) => {
        const options = q.options.map((o, i) => ({
          key: LETTERS[i],
          value: o.value.trim(),
        }));
        return {
          Type: "multiple-choice",
          Sequence: idx + 1,
          Content: q.instruction,
          AnswerContent: {
            title: q.instruction,
            options,
            correctAnswer: options[q.correctOptionId].value,
          },
        };
      });

      /* Part 2 build - Transform matching groups to API payload */
      const part2Questions = part2Groups.map((g, idx) => {
        const leftItems = g.leftItems.map((i) => i.text);
        const rightItems = g.rightItems.map((i) => i.text);

        return {
          Type: "matching",
          Sequence: idx + 26, // Continue numbering from Part 1 (25 questions)
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

      // Build final payload for API request
      const payload = {
        SkillName: "GRAMMAR AND VOCABULARY",
        SectionName: sectionName,
        Description: description?.trim() || '',
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
          navigate('/questions?skillName=GRAMMAR%20AND%20VOCABULARY', {
            replace: true,
          });
        },
        onError: (err) =>
          message.error(
            err?.response?.data?.message || 'Failed to create section'
          ),
      });
    } catch {
      message.error("Please fix errors in Part 1");
    }
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onSubmitCapture={(e) => {
        e.preventDefault();
      }}
      initialValues={{
        sectionName: '',
        description: '',
        part1Name: '',
        part2Name: '',
        part1: Array.from({ length: 25 }, () => ({
          instruction: "",
          options: [{ value: "" }, { value: "" }, { value: "" }],
          correctOptionId: null,
        })),
      }}
    >
      {/* SECTION */}
      <Card title='Section Information' className='mb-5'>
        <Form.Item
          label='Name'
          name='sectionName'
          getValueFromEvent={(e) => e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '')}
          rules={[{ required: true }]}>
          <Input onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()\"':]/g, ''); }}
            maxLength={255}
            placeholder="Section Name Here..."
          />
        </Form.Item>
        <Form.Item label='Description' name='description'>
          <Input.TextArea rows={3} placeholder='-' maxLength={510} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, ''); }} />
        </Form.Item>
      </Card>

      {/* PART 1 */}
      <Card title="PART 1 — Multiple Choice (25 Questions)" className="mb-6">
        <Form.Item
          label='Part Name'
          name='part1Name'
          getValueFromEvent={(e) => e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '')}
          rules={[{ required: true }]}
        >
          <Input onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()\"':]/g, ''); }} maxLength={255} />
        </Form.Item>

        <Collapse accordion>
          {Array.from({ length: 25 }).map((_, idx) => (
            <Panel
              key={idx}
              header={
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  Question {idx + 1}
                  {renderStatus(validatePart1Question(part1Values[idx] || {}))}
                </div>
              }
            >
              <Form.Item
                name={['part1', idx, 'instruction']}
                label='Instruction'
                getValueFromEvent={(e) => e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '')}
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={2} maxLength={510} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, ''); }} />
              </Form.Item>

              {/* OPTIONS — 3 fixed + dynamic additional */}
              <Form.List name={["part1", idx, "options"]}>
                {(fields, { add, remove }) => {
                  const optionValues =
                    form.getFieldValue(["part1", idx, "options"]) || [];

                  return (
                    <>
                      {fields.map((field, optIdx) => (
                        <div
                          key={field.key}
                          style={{
                            display: "flex",
                            alignItems: "center",
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
                            name={[field.name, "value"]}
                            style={{ flex: 1, marginBottom: 0 }}
                            getValueFromEvent={(e) => e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '')}
                            rules={[
                              { required: true, message: "Option is required" },
                            ]}
                          >
                            <Input onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()\"':]/g, ''); }} maxLength={255} placeholder={`Option ${LETTERS[optIdx]}`} />
                          </Form.Item>

                          {/* DELETE BUTTON (only delete from option #4 → index ≥ 3) */}
                          {optIdx >= 3 && (
                            <DeleteOutlined
                              style={{
                                color: "red",
                                fontSize: 18,
                                cursor: "pointer",
                              }}
                              onClick={() => remove(field.name)}
                            />
                          )}
                        </div>
                      ))}

                      {/* ADD OPTION BUTTON */}
                      <Button
                        type='dashed'
                        htmlType='button'
                        icon={<PlusOutlined />}
                        onClick={() => add({ value: '' })}
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
                label="Correct Answer"
                name={["part1", idx, "correctOptionId"]}
                rules={[{ required: true }]}
                style={{ marginTop: 15 }}
              >
                <Select
                  placeholder="Select correct answer"
                  options={(
                    form.getFieldValue(["part1", idx, "options"]) || []
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
      <Card title="PART 2 — Matching (5 Groups)" className="mb-6">
        <Form.Item
          label='Part Name'
          name='part2Name'
          getValueFromEvent={(e) => e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, '')}
          rules={[{ required: true }]}
        >
          <Input maxLength={255} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()\"':]/g, ''); }} />
        </Form.Item>

        <Collapse accordion>
          {part2Groups.map((g, idx) => (
            <Panel
              key={idx}
              header={
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  Group {idx + 1}
                  {renderStatus(validateGroup(g))}
                </div>
              }
            >
              <Form.Item
                label="Instruction Text"
                required
                rules={[{ required: true, message: 'Instruction is Required' }]}
              >
                <Input.TextArea
                  value={g.content}
                  maxLength={510} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:()"':]/g, ''); }}
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
                      name={["part2", idx, "_validation"]}
                      rules={[
                        {
                          validator: () => {
                            if (!g.content?.trim()) {
                              return Promise.reject(
                                new Error("Instruction is required"),
                              );
                            }
                            if (left.length < 1) {
                              return Promise.reject(
                                new Error("Must have at least 1 content"),
                              );
                            }
                            if (right.length < 1) {
                              return Promise.reject(
                                new Error("Must have at least 1 option"),
                              );
                            }
                            if (mapping.length < 1) {
                              return Promise.reject(
                                new Error(
                                  "Must have at least 1 correct matching pair",
                                ),
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
        <Button htmlType='button' onClick={() => navigate(-1)}>Cancel</Button>
        <Button type='primary' loading={isPending} onClick={handleSaveAll}>
          Save
        </Button>
      </div>
    </Form>
  );
};

export default CreateGrammarVocab;
