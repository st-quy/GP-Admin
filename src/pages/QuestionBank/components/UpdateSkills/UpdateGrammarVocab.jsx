// UpdateGrammarVocab.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Card,
  Collapse,
  Form,
  Input,
  Select,
  Button,
  message,
  Spin,
  Modal,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { SaveOutlined } from '@ant-design/icons';
import {
  useGetQuestionGroupDetail,
  useUpdateQuestionGroup,
} from '@features/questions/hooks';
import { useGetAllTags } from '@features/sections/hooks';
import GrammarMatchingEditorForm from '../CreateSkills/GrammarAndVocabulary/multiple-choice/GrammarMatchingEditorForm';
import { DeleteOutlined } from '@ant-design/icons';
import { QuestionApi } from '@features/questions/api';
import {
  MAX_QUESTION_INPUT_LENGTH,
  sanitizeQuestionInput,
} from '@shared/lib/questionInput';

const { Panel } = Collapse;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const AUTOSAVE_DEBOUNCE_MS = 2000;

const UpdateGrammarVocab = () => {
  const navigate = useNavigate();
  const { id: sectionId } = useParams();
  const [form] = Form.useForm();

  const { data, isLoading } = useGetQuestionGroupDetail(
    'GRAMMAR AND VOCABULARY',
    sectionId
  );
  const { mutate: updateGroup, isPending } = useUpdateQuestionGroup();

  const [isAutosaving, setIsAutosaving] = useState(false);
  const debounceTimerRef = useRef(null);
  const payloadRef = useRef(null);
  const [tags, setTags] = useState([]);
  const [originalStatus, setOriginalStatus] = useState('draft');
  const { data: existingTags = [] } = useGetAllTags();

  /* ============================
        STATE
  ============================ */
  const [sectionName, setSectionName] = useState('');

  // PART 1
  const [part1Id, setPart1Id] = useState(null);
  const [part1Name, setPart1Name] = useState('');
  const [part1, setPart1] = useState([]);

  // PART 2
  const [part2Id, setPart2Id] = useState(null);
  const [part2Name, setPart2Name] = useState('');
  const [part2Groups, setPart2Groups] = useState([]);

  const updateGroupState = (index, data) => {
    setPart2Groups((prev) => {
      const clone = [...prev];
      clone[index] = { ...clone[index], ...data };
      return clone;
    });
  };

  /* ============================
        LOAD DATA FROM API
  ============================ */
  useEffect(() => {
    if (!data) return;

    setSectionName(data.SectionName);
    setOriginalStatus(data.Status || 'draft');

    const allTags = new Set();
    Object.keys(data).filter(k => typeof k === 'string' && k.startsWith('part')).forEach(key => {
      const part = data[key];
      (part?.questions || []).forEach(q => {
        (q.Tags || []).forEach(t => allTags.add(t));
      });
    });
    setTags(Array.from(allTags));

    /* ---------- PART 1 ---------- */
    setPart1Id(data.part1?.PartID);
    setPart1Name(data.part1?.name);

    const mappedPart1 = data.part1?.questions?.map((q, idx) => {
      const opts = q.AnswerContent?.options || [];

      return {
        id: idx + 1,
        questionId: q.ID,
        instruction: q.Content,
        options: opts.map((o, i) => ({
          id: i + 1,
          label: LETTERS[i],
          value: o.value,
        })),
        correctId:
          opts.findIndex((o) => o.value === q.AnswerContent.correctAnswer) + 1,
      };
    }) || [];

    // Pad to 25 questions so the full structure is always available
    while (mappedPart1.length < 25) {
      const idx = mappedPart1.length;
      mappedPart1.push({
        id: idx + 1,
        questionId: null,
        instruction: '',
        options: [
          { id: 1, label: 'A', value: '' },
          { id: 2, label: 'B', value: '' },
          { id: 3, label: 'C', value: '' },
        ],
        correctId: null,
      });
    }

    setPart1(mappedPart1);

    /* ---------- PART 2 ---------- */
    setPart2Id(data.part2?.PartID);
    setPart2Name(data.part2?.name);

    const mappedPart2 = data.part2?.questions?.map((q, groupIndex) => {
      const ac = q.AnswerContent;
      const left = ac.leftItems;
      const right = ac.rightItems;

      return {
        groupId: groupIndex + 1,
        questionId: q.ID,
        content: q.Content,
        leftItems: left.map((t, i) => ({ id: `L-${i}`, text: t })),
        rightItems: right.map((t, i) => ({ id: `R-${i}`, text: t })),
        mapping: ac.correctAnswer.map((m) => ({
          leftId: `L-${left.indexOf(m.left)}`,
          rightId: `R-${right.indexOf(m.right)}`,
        })),
      };
    }) || [];

    // Pad to 5 groups
    while (mappedPart2.length < 5) {
      mappedPart2.push({
        groupId: mappedPart2.length + 1,
        questionId: null,
        content: '',
        leftItems: [],
        rightItems: [],
        mapping: [],
      });
    }

    setPart2Groups(mappedPart2);
  }, [data]);

  /* ============================
        VALIDATION
  ============================ */
  const validatePart1 = () => {
    if (!part1Name.trim()) return false;
    return part1.every(
      (q) =>
        q.instruction.trim() &&
        q.options.every((o) => o.value.trim()) &&
        q.correctId
    );
  };

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

  const validatePart2 = () =>
    part2Name.trim() && part2Groups.every((g) => validateGroup(g));

  const renderStatus = (valid) => (
    <span style={{ color: valid ? 'green' : 'red', marginLeft: 8 }}>
      {valid ? '✔' : '✖'}
    </span>
  );

  /* ============================
         AUTOSAVE
  ============================ */
  const buildPayload = useCallback((status = 'draft') => {
    const part1Questions = part1.filter(Boolean).map((q, idx) => ({
      ID: q.questionId,
      Type: 'multiple-choice',
      Sequence: idx + 1,
      Content: q.instruction,
      AnswerContent: {
        title: q.instruction,
        options: q.options.map((o) => ({
          key: o.label,
          value: o.value.trim(),
        })),
        correctAnswer: q.options[q.correctId - 1]?.value || '',
      },
    }));

    const part2Questions = part2Groups.map((g, idx) => {
      const left = g.leftItems.map((i) => i.text);
      const right = g.rightItems.map((i) => i.text);

      return {
        ID: g.questionId,
        Type: 'matching',
        Sequence: idx + 26,
        Content: g.content,
        AnswerContent: {
          content: g.content,
          leftItems: left,
          rightItems: right,
          correctAnswer: g.mapping.map((m) => ({
            left: left[g.leftItems.findIndex((x) => x.id === m.leftId)],
            right: right[g.rightItems.findIndex((x) => x.id === m.rightId)],
          })),
        },
      };
    });

    return {
      SkillName: 'GRAMMAR AND VOCABULARY',
      SectionName: sectionName || 'Untitled Draft',
      Status: status,
      tags: tags,
      parts: {
        part1: { id: part1Id, name: part1Name, sequence: 1, questions: part1Questions },
        part2: { id: part2Id, name: part2Name, sequence: 2, questions: part2Questions },
      },
    };
  }, [part1, part2Groups, sectionName, part1Name, part2Name, part1Id, part2Id, tags]);

  const scheduleAutosave = useCallback((payload) => {
    payloadRef.current = payload;
    setIsAutosaving(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      if (payloadRef.current) {
        try {
          await QuestionApi.update({ sectionId, payload: payloadRef.current });
        } catch (error) {
        } finally {
          setIsAutosaving(false);
          payloadRef.current = null;
        }
      } else {
        setIsAutosaving(false);
      }
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [sectionId]);

  // Autosave on state changes
  useEffect(() => {
    if (data) {
      const payload = buildPayload(originalStatus);
      scheduleAutosave(payload);
    }
  }, [part1, part2Groups, sectionName, part1Name, part2Name, data, buildPayload, scheduleAutosave, tags, originalStatus]);

  const handleSaveAsDraft = async () => {
    try {
      const payload = buildPayload('draft');
      await QuestionApi.update({ sectionId, payload });
      message.success('Draft saved successfully');
      navigate(-1);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to save draft');
    }
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Discard Changes?',
      content: 'You have unsaved changes. Are you sure you want to go back?',
      okText: 'Discard & Go Back',
      cancelText: 'Keep Editing',
      okButtonProps: { danger: true },
      onOk: () => navigate(-1),
      onCancel: () => {},
    });
  };

  /* ============================
        SAVE — Build Payload
  ============================ */
  const handleSaveAll = () => {
    if (!validatePart1() || !validatePart2() || !sectionName.trim()) {
      message.error('Please fix all validation errors before saving.');
      return;
    }

    /* ---------- PART 1 ---------- */
    const part1Questions = part1.map((q, idx) => ({
      ID: q.questionId,
      Type: 'multiple-choice',
      Sequence: idx + 1,
      Content: q.instruction,
      AnswerContent: {
        title: q.instruction,
        options: q.options.map((o) => ({
          key: o.label,
          value: o.value.trim(),
        })),
        correctAnswer: q.options[q.correctId - 1].value,
      },
    }));

    /* ---------- PART 2 ---------- */
    const part2Questions = part2Groups.map((g, idx) => {
      const left = g.leftItems.map((i) => i.text);
      const right = g.rightItems.map((i) => i.text);

      return {
        ID: g.questionId,
        Type: 'matching',
        Sequence: idx + 26,
        Content: g.content,
        AnswerContent: {
          content: g.content,
          leftItems: left,
          rightItems: right,
          correctAnswer: g.mapping.map((m) => ({
            left: left[g.leftItems.findIndex((x) => x.id === m.leftId)],
            right: right[g.rightItems.findIndex((x) => x.id === m.rightId)],
          })),
        },
      };
    });

    const payload = {
      groupId: sectionId,
      SkillName: 'GRAMMAR AND VOCABULARY',
      SectionName: sectionName,
      Status: 'published',
      tags: tags,
      parts: {
        part1: {
          id: part1Id,
          name: part1Name,
          sequence: 1,
          questions: part1Questions,
        },
        part2: {
          id: part2Id,
          name: part2Name,
          sequence: 2,
          questions: part2Questions,
        },
      },
    };

    updateGroup(
      { sectionId, payload },
      {
        onSuccess: () => {
          message.success('Updated successfully!');
          navigate(-1);
        },
        onError: () => message.error('Failed to update'),
      }
    );
  };

  const generateLabel = (index) => {
    let label = '';
    let i = index;
    while (i >= 0) {
      label = String.fromCharCode((i % 26) + 65) + label;
      i = Math.floor(i / 26) - 1;
    }
    return label;
  };

  if (isLoading || !data)
    return (
      <div className='flex justify-center items-center p-12'>
        <Spin size='large' />
      </div>
    );

  /* ============================
        RENDER UI
  ============================ */
  return (
    <Form layout='vertical'>
      <Card title='Section Information' className='mb-5'>
        <Form.Item label='Section Name' required>
          <Input
            value={sectionName}
            maxLength={MAX_QUESTION_INPUT_LENGTH}
            onChange={(e) => {
              setSectionName(sanitizeQuestionInput(e.target.value));
            }}
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
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            Part 1 — Multiple Choice {renderStatus(validatePart1())}
          </div>
        }
        className='mb-6'
      >
        <Form.Item label='Part Name' required>
          <Input
            value={part1Name}
            maxLength={MAX_QUESTION_INPUT_LENGTH}
            onChange={(e) => {
              setPart1Name(sanitizeQuestionInput(e.target.value));
            }}
          />
        </Form.Item>

        <Collapse accordion>
          {part1.map((q) => (
            <Panel
              key={q.id}
              header={
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  Question {q.id}
                  {renderStatus(
                    q.instruction.trim() &&
                    q.options.every((o) => o.value.trim()) &&
                    q.correctId
                  )}
                </div>
              }
            >
              {/* Instruction */}
              <Form.Item label='Instruction' required>
                <Input.TextArea
                  rows={2}
                  value={q.instruction}
                  maxLength={MAX_QUESTION_INPUT_LENGTH}

                  onChange={(e) => {
                    const sanitized = sanitizeQuestionInput(e.target.value);
                    setPart1((prev) =>
                      prev.map((x) =>
                        x.id === q.id
                          ? { ...x, instruction: sanitized }
                          : x
                      )
                    )
                  }

                  }
                />
              </Form.Item>

              {/* OPTIONS LIST */}
              {q.options.map((o, optIdx) => (
                <div
                  key={o.id}
                  className='flex items-center gap-3 mb-2'
                  style={{ alignItems: 'center' }}
                >
                  <b>{o.label}</b>

                  <Input
                    value={o.value}
                    maxLength={MAX_QUESTION_INPUT_LENGTH}
                    onChange={(e) => {
                      const sanitized = sanitizeQuestionInput(e.target.value);
                      setPart1((prev) =>
                        prev.map((x) =>
                          x.id === q.id
                            ? {
                              ...x,
                              options: x.options.map((opt) =>
                                opt.id === o.id
                                  ? { ...opt, value: sanitized }
                                  : opt
                              ),
                            }
                            : x
                        )
                      )
                    }

                    }
                  />

                  {/* DELETE OPTION (must have >= 2 options) */}
                  {q.options.length > 3 && (
                    <DeleteOutlined
                      className='text-red-500 cursor-pointer hover:text-red-700'
                      onClick={() => {
                        setPart1((prev) =>
                          prev.map((x) => {
                            if (x.id !== q.id) return x;

                            const newOptions = x.options
                              .filter((opt) => opt.id !== o.id)
                              .map((opt, index) => ({
                                ...opt,
                                id: index + 1,
                                label: generateLabel(index),
                              }));

                            let newCorrectId = x.correctId;

                            // If deleted option was correct → reset to null
                            if (o.id === x.correctId) newCorrectId = null;

                            return {
                              ...x,
                              options: newOptions,
                              correctId: newCorrectId,
                            };
                          })
                        );
                      }}
                    />
                  )}
                </div>
              ))}

              {/* ADD OPTION */}
              <Button
                type='dashed'
                className='mt-2'
                onClick={() =>
                  setPart1((prev) =>
                    prev.map((x) =>
                      x.id === q.id
                        ? {
                          ...x,
                          options: [
                            ...x.options,
                            {
                              id: x.options.length + 1,
                              label: generateLabel(x.options.length),
                              value: '',
                            },
                          ],
                        }
                        : x
                    )
                  )
                }
              >
                + Add option
              </Button>

              {/* CORRECT ANSWER SELECT */}
              <Form.Item label='Correct Answer' required className='mt-4'>
                <Select
                  value={q.correctId}
                  onChange={(v) =>
                    setPart1((prev) =>
                      prev.map((x) =>
                        x.id === q.id ? { ...x, correctId: v } : x
                      )
                    )
                  }
                  options={q.options.map((o) => ({
                    value: o.id,
                    label: o.label,
                  }))}
                />
              </Form.Item>
            </Panel>
          ))}
        </Collapse>
      </Card>

      {/* PART 2 */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            Part 2 — Matching {renderStatus(validatePart2())}
          </div>
        }
      >
        <Form.Item label='Part Name' required>
          <Input
            value={part2Name}
            maxLength={MAX_QUESTION_INPUT_LENGTH}
            onChange={(e) => {
              setPart2Name(sanitizeQuestionInput(e.target.value));
            }}
          />
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
              <Form.Item label='Instruction' required>
                <Input.TextArea
                  rows={2}
                  value={g.content}
                  maxLength={MAX_QUESTION_INPUT_LENGTH}
                  onChange={(e) => {
                    updateGroupState(idx, {
                      content: sanitizeQuestionInput(e.target.value),
                    });
                  }}
                />
              </Form.Item>

              {/* Matching Component */}
              <GrammarMatchingEditorForm
                groupIndex={idx}
                group={g}
                updateGroup={(data) => updateGroupState(idx, data)}
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
                      <div style={{ height: 0 }}></div>
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
        <Button loading={isPending || isAutosaving} onClick={handleSaveAsDraft}>
          <SaveOutlined /> Save as Draft
        </Button>
        <Button type='primary' loading={isPending || isAutosaving} onClick={handleSaveAll} className='bg-blue-900'>
          Publish
        </Button>
      </div>
    </Form>
  );
};

export default UpdateGrammarVocab;
