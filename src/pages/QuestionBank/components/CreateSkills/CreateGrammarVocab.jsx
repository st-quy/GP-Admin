// CreateGrammarVocab.jsx
// Component for creating Grammar & Vocabulary questions with two parts:
// - Part 1: Multiple Choice (25 questions)
// - Part 2: Matching (5 groups)
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, Collapse, Form, Input, Select, Button, message, Modal } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { SaveOutlined } from "@ant-design/icons";
import { useCreateQuestion } from "@features/questions/hooks";
import GrammarMatchingEditorForm from "./GrammarAndVocabulary/multiple-choice/GrammarMatchingEditorForm";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { QuestionApi, SectionApi } from "@features/questions/api";
import { useGetAllTags } from "@features/sections/hooks";
import {
  MAX_QUESTION_INPUT_LENGTH,
  sanitizeQuestionInput,
} from "@shared/lib/questionInput";

const { Panel } = Collapse;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const AUTOSAVE_DEBOUNCE_MS = 2000;

const CreateGrammarVocab = ({ draftId: propDraftId }) => {
  const navigate = useNavigate();
  const { draftId: urlDraftId } = useParams();
  const draftId = propDraftId || urlDraftId;
  const [form] = Form.useForm();
  const { mutate: createQuestion, isPending } = useCreateQuestion();

  const [isAutosaving, setIsAutosaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!draftId);
  const debounceTimerRef = useRef(null);
  const payloadRef = useRef(null);
  const draftIdRef = useRef(draftId);
  const [tags, setTags] = useState([]);
  const { data: existingTags = [] } = useGetAllTags();

  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);

  /* -------------------------------------------
       PART 2 — Local state (for matching)
  ------------------------------------------- */
  const [part2Groups, setPart2Groups] = useState(
    Array.from({ length: 5 }, () => ({
      content: "",
      leftItems: [],
      rightItems: [],
      mapping: [],
    })),
  );

  const updateGroup = (index, data) => {
    setPart2Groups((prev) => {
      const clone = [...prev];
      clone[index] = { ...clone[index], ...data };
      return clone;
    });
  };

  // Load existing draft
  useEffect(() => {
    if (!draftId) return;
    let cancelled = false;
    const loadDraft = async () => {
      try {
        const { data } = await QuestionApi.getDetail({ skillName: 'GRAMMAR AND VOCABULARY', sectionId: draftId });
        if (cancelled) return;
        const d = data.data;

        form.setFieldsValue({
          sectionName: d.SectionName || '',
          part1Name: d.part1?.name || '',
          part2Name: d.part2?.name || '',
          part1: (d.part1?.questions || []).map((q) => {
            const ac = q.AnswerContent || {};
            return {
              id: q.ID,
              instruction: q.Content || '',
              options: (ac.options || []).map((o) => ({ value: o.value || '' })),
              correctOptionId: ac.options ? ac.options.findIndex((o) => o.value === ac.correctAnswer) : null,
            };
          }),
        });

        // Part 2: matching groups from questions
        if (d.part2?.questions) {
          const groups = d.part2.questions.map((q) => {
            const ac = q.AnswerContent || {};
            return {
              content: ac.content || q.Content || '',
              leftItems: (ac.leftItems || []).map((t, i) => ({ id: i + 1, text: typeof t === 'string' ? t : t.text || '' })),
              rightItems: (ac.rightItems || []).map((t, i) => ({ id: i + 1, text: typeof t === 'string' ? t : t.text || '' })),
              mapping: (ac.correctAnswer || []).map((m, i) => {
                const leftIdx = (ac.leftItems || []).findIndex((t) => (typeof t === 'string' ? t : t.text) === m.left);
                const rightIdx = (ac.rightItems || []).findIndex((t) => (typeof t === 'string' ? t : t.text) === m.right);
                return { id: i + 1, leftId: leftIdx >= 0 ? leftIdx + 1 : null, rightId: rightIdx >= 0 ? rightIdx + 1 : null };
              }),
            };
          });
          while (groups.length < 5) groups.push({ content: '', leftItems: [], rightItems: [], mapping: [] });
          setPart2Groups(groups);
        }

      } catch (error) {
        message.error('Failed to load draft');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadDraft();
    return () => { cancelled = true; };
  }, [draftId]);

  /* WATCH PART 1 */
  const part1Values = Form.useWatch("part1", form) || [];

  /* VALIDATE PART 1 */
  const validatePart1Question = (q) => {
    if (!q?.instruction?.trim()) return false;
    if (!q.options || !Array.isArray(q.options) || q.options.some((o) => !o?.value?.trim())) return false;
    if (q.correctOptionId === null || q.correctOptionId === undefined) return false;
    return true;
  };

  const validateGroup = (g) => {
    if (!g.content?.trim()) return false;
    if (!g.leftItems.length || g.leftItems.some((i) => !i.text?.trim())) return false;
    if (!g.rightItems.length || g.rightItems.some((i) => !i.text?.trim())) return false;
    if (!g.mapping.length) return false;
    return g.mapping.every(
      (m) => m.leftId !== null && m.rightId !== null &&
        g.leftItems.find((x) => x.id === m.leftId) &&
        g.rightItems.find((x) => x.id === m.rightId),
    );
  };

  const renderStatus = (valid) => (
    <span style={{ marginLeft: 8 }}>
      {valid ? <span style={{ color: "green" }}>✔</span> : <span style={{ color: "red" }}>✖</span>}
    </span>
  );

  /* BUILD PAYLOAD */
  const buildPayload = useCallback((values, status = 'draft') => {
    const { sectionName, part1Name, part2Name, part1 } = values;
    const part1Questions = (part1 || []).filter(Boolean).map((q, idx) => {
      const options = (q.options || []).map((o, i) => ({
        key: LETTERS[i],
        value: o.value?.trim() || '',
      }));
      return {
        Type: "multiple-choice",
        Sequence: idx + 1,
        Content: q.instruction || '',
        AnswerContent: {
          title: q.instruction || '',
          options,
          correctAnswer: options[q.correctOptionId]?.value || '',
        },
      };
    });

    const part2Questions = (part2Groups || []).map((g, idx) => {
      const leftItems = (g.leftItems || []).map((i) => i.text);
      const rightItems = (g.rightItems || []).map((i) => i.text);
      return {
        Type: "matching",
        Sequence: idx + 26,
        Content: g.content || '',
        AnswerContent: {
          content: g.content || '',
          leftItems,
          rightItems,
          correctAnswer: (g.mapping || []).map((m) => ({
            left: leftItems[(g.leftItems || []).findIndex((x) => x.id === m.leftId)],
            right: rightItems[(g.rightItems || []).findIndex((x) => x.id === m.rightId)],
          })),
        },
      };
    });

    return {
      SkillName: "GRAMMAR AND VOCABULARY",
      SectionName: sectionName || 'Untitled Draft',
      Status: status,
      tags: tags,
      parts: {
        part1: { name: part1Name, sequence: 1, questions: part1Questions },
        part2: { name: part2Name, sequence: 2, questions: part2Questions },
      },
    };
  }, [part2Groups, tags]);

  /* AUTOSAVE */
  const scheduleAutosave = useCallback((payload) => {
    payloadRef.current = payload;
    setIsAutosaving(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      if (payloadRef.current && draftIdRef.current) {
        try {
          await QuestionApi.update({ sectionId: draftIdRef.current, payload: payloadRef.current });
        } catch (error) {
        } finally {
          setIsAutosaving(false);
          payloadRef.current = null;
        }
      } else {
        setIsAutosaving(false);
      }
    }, AUTOSAVE_DEBOUNCE_MS);
  }, []);

  const handleValuesChange = useCallback((changedValues, allValues) => {
    if (draftIdRef.current) {
      try {
        const payload = buildPayload(allValues, 'draft');
        scheduleAutosave(payload);
      } catch (e) {
      }
    }
  }, [buildPayload, scheduleAutosave]);

  // Trigger autosave on part2Groups changes
  useEffect(() => {
    if (draftIdRef.current) {
      const values = form.getFieldsValue(true);
      try {
        const payload = buildPayload(values, 'draft');
        scheduleAutosave(payload);
      } catch (e) {
        // Skip
      }
    }
  }, [part2Groups, tags]);

  const handleSaveAsDraft = async () => {
    const values = form.getFieldsValue(true);
    try {
      const payload = buildPayload(values, 'draft');
      if (draftIdRef.current) {
        setIsSubmitting(true);
        await QuestionApi.update({ sectionId: draftIdRef.current, payload });
        message.success('Draft saved successfully');
        navigate(-1);
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);
      const payload = buildPayload(values, 'published');

      if (draftIdRef.current) {
        setIsSubmitting(true);
        await QuestionApi.update({ sectionId: draftIdRef.current, payload });
        message.success('Created successfully!');
        navigate(-1);
      }
    } catch (err) {
      if (err?.errorFields) {
        message.error(`Validation failed: ${err.errorFields.map(f => f.name.join('.')).join(', ')}`);
      } else {
        message.error("Please fix errors in Part 1");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Discard Changes?',
      content: 'You have unsaved changes. Are you sure you want to go back?',
      okText: 'Discard & Go Back',
      cancelText: 'Keep Editing',
      okButtonProps: { danger: true },
      onOk: async () => {
        if (draftIdRef.current) {
          try {
            await SectionApi.deleteDraft(draftIdRef.current);
          } catch (e) {
            console.error('Failed to discard draft:', e);
          }
        }
        navigate(-1);
      },
      onCancel: () => {},
    });
  };

  if (!draftId && !isLoading) {
    return <RedirectToNewDraft />;
  }
  if (isLoading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading draft...</div>;
  }

  return (
    <Form
      layout="vertical"
      form={form}
      onValuesChange={handleValuesChange}
      initialValues={{
        sectionName: '',
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
          getValueFromEvent={(e) => sanitizeQuestionInput(e.target.value)}
          rules={[{ required: true }]}>
          <Input
            maxLength={MAX_QUESTION_INPUT_LENGTH}
            placeholder={"Section Name Here..."}
          />
        </Form.Item>
        <Form.Item label='Tags'>
          <Select
            mode='tags'
            placeholder='Add tags for this section'
            value={tags}
            onChange={setTags}
            style={{ width: '100%' }}
            tokenSeparators={[',']}
            options={existingTags.map((t) => ({ label: t, value: t }))}
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Card>

      {/* PART 1 */}
      <Card title="PART 1 — Multiple Choice (25 Questions)" className="mb-6">
        <Form.Item
          label='Part Name'
          name='part1Name'
          getValueFromEvent={(e) => sanitizeQuestionInput(e.target.value)}
          rules={[{ required: true }]}
        >
          <Input maxLength={MAX_QUESTION_INPUT_LENGTH} />
        </Form.Item>

        <Collapse accordion>
          {Array.from({ length: 25 }).map((_, idx) => (
            <Panel
              key={idx}
              header={
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  Question {idx + 1}
                  {renderStatus(validatePart1Question(part1Values?.[idx] || {}))}
                </div>
              }
            >
              <Form.Item
                name={['part1', idx, 'instruction']}
                label='Instruction'
                getValueFromEvent={(e) => sanitizeQuestionInput(e.target.value)}
                rules={[{ required: true }]}
              >
                <Input.TextArea
                  maxLength={MAX_QUESTION_INPUT_LENGTH}
                  rows={2}
                />
              </Form.Item>

              <Form.List name={["part1", idx, "options"]}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, optIdx) => (
                      <div key={field.key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 22, fontWeight: 600 }}>{LETTERS[optIdx]}</div>
                        <Form.Item
                          {...field}
                          name={[field.name, "value"]}
                          style={{ flex: 1, marginBottom: 0 }}
                          getValueFromEvent={(e) =>
                            sanitizeQuestionInput(e.target.value)
                          }
                          rules={[{ required: true, message: "Option is required" }]}
                        >
                          <Input
                            maxLength={MAX_QUESTION_INPUT_LENGTH}
                            placeholder={`Option ${LETTERS[optIdx]}`}
                          />
                        </Form.Item>
                        {optIdx >= 3 && (
                          <DeleteOutlined style={{ color: "red", fontSize: 18, cursor: "pointer" }} onClick={() => remove(field.name)} />
                        )}
                      </div>
                    ))}
                    <Button
                      type='dashed'
                      icon={<PlusOutlined />}
                      htmlType='button'
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        add({ value: '' });
                      }}
                      style={{ marginTop: 8 }}
                    >
                      Add option
                    </Button>
                  </>
                )}
              </Form.List>

              <Form.Item label="Correct Answer" name={["part1", idx, "correctOptionId"]} rules={[{ required: true }]} style={{ marginTop: 15 }}>
                <Select
                  placeholder="Select correct answer"
                  options={(() => {
                    try {
                      const opts = form.getFieldValue(["part1", idx, "options"]) || [];
                      return opts.filter(Boolean).map((_, i) => ({ value: i, label: LETTERS[i] }));
                    } catch {
                      return [];
                    }
                  })()}
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
          getValueFromEvent={(e) => sanitizeQuestionInput(e.target.value)}
          rules={[{ required: true }]}
        >
          <Input maxLength={MAX_QUESTION_INPUT_LENGTH} />
        </Form.Item>

        <Collapse accordion>
          {part2Groups.map((g, idx) => (
            <Panel
              key={idx}
              header={
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  Group {idx + 1}
                  {renderStatus(validateGroup(g))}
                </div>
              }
            >
              <Form.Item label="Instruction Text" required rules={[{ required: true, message: 'Instruction is Required' }]}>
                <Input.TextArea
                  maxLength={MAX_QUESTION_INPUT_LENGTH}
                  value={g.content}
                  onChange={(e) =>
                    updateGroup(idx, {
                      content: sanitizeQuestionInput(e.target.value),
                    })
                  }
                  rows={2}
                />
              </Form.Item>

              <GrammarMatchingEditorForm groupIndex={idx} group={g} updateGroup={(data) => updateGroup(idx, data)} />
              <Form.Item noStyle shouldUpdate>
                {() => {
                  const left = Array.isArray(g.leftItems) ? g.leftItems : [];
                  const right = Array.isArray(g.rightItems) ? g.rightItems : [];
                  const mapping = Array.isArray(g.mapping) ? g.mapping : [];
                  return (
                    <Form.Item name={["part2", idx, "_validation"]} rules={[{ validator: () => {
                      if (!g.content?.trim()) return Promise.reject(new Error("Instruction is required"));
                      if (left.length < 1) return Promise.reject(new Error("Must have at least 1 content"));
                      if (right.length < 1) return Promise.reject(new Error("Must have at least 1 option"));
                      if (mapping.length < 1) return Promise.reject(new Error("Must have at least 1 correct matching pair"));
                      return Promise.resolve();
                    }}]}>
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
        <Button onClick={handleCancel}>Cancel</Button>
        <Button loading={isSubmitting || isAutosaving} onClick={handleSaveAsDraft}>
          <SaveOutlined /> Save as Draft
        </Button>
        <Button type='primary' loading={isSubmitting || isAutosaving} onClick={handlePublish} className='bg-blue-900'>
          Publish
        </Button>
      </div>
    </Form>
  );
};

const RedirectToNewDraft = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const createAndRedirect = async () => {
      try {
        const { data } = await SectionApi.createDraft('GRAMMAR AND VOCABULARY');
        const sectionId = data.data.ID;
        navigate(`/questions/create/grammar/${sectionId}`, { replace: true });
      } catch (error) {
        message.error('Failed to create draft');
      }
    };
    createAndRedirect();
  }, []);
  return <div style={{ padding: 40, textAlign: 'center' }}>Creating draft...</div>;
};

export default CreateGrammarVocab;
