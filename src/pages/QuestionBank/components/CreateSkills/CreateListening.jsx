// CreateListening.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Input,
  Select,
  Button,
  message,
  Form,
  Card,
  Space,
  Collapse,
  Modal,
} from 'antd';
import { DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';

import { useNavigate, useParams } from 'react-router-dom';
import { useCreateQuestion } from '@features/questions/hooks';

import ListeningMatchingEditor from './Listening/ListeningMatchingEditor';
import { buildListeningPayload } from '@pages/QuestionBank/schemas/createQuestionSchema';
import MinioUploadDragger from '@shared/components/MinioUploadDragger';
import { QuestionApi, SectionApi } from '@features/questions/api';

const { TextArea } = Input;
const { Panel } = Collapse;
const AUTOSAVE_DEBOUNCE_MS = 2000;

const CreateListening = ({ draftId: propDraftId }) => {
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

  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);

  // ================================
  // PART NAME — NEW
  // ================================
  const [part1Name, setPart1Name] = useState('');
  const [part2Name, setPart2Name] = useState('');
  const [part3Name, setPart3Name] = useState('');
  const [part4Name, setPart4Name] = useState('');
  const [sectionName, setSectionName] = useState('');

  // ================================
  // PART 1 — 13 Multiple Choice
  // ================================
  const [part1, setPart1] = useState(
    Array.from({ length: 13 }, (_, i) => ({
      id: i + 1,
      instruction: '',
      audioUrl: '',
      options: [
        { id: 1, label: 'A', value: '' },
        { id: 2, label: 'B', value: '' },
        { id: 3, label: 'C', value: '' },
      ],
      correctId: null,
    }))
  );

  const updatePart1Field = (id, key, value) => {
    setPart1((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [key]: value } : q))
    );
  };

  const updatePart1Option = (qId, optId, value) => {
    setPart1((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
            ...q,
            options: q.options.map((o) =>
              o.id === optId ? { ...o, value } : o
            ),
          }
          : q
      )
    );
  };

  // ================================
  // PART 2 — Matching
  // ================================
  const [part2, setPart2] = useState({
    instruction: '',
    audioUrl: '',
    leftItems: [],
    rightItems: [],
    mapping: [],
  });

  // ================================
  // PART 3 — Matching
  // ================================
  const [part3, setPart3] = useState({
    instruction: '',
    audioUrl: '',
    leftItems: [],
    rightItems: [],
    mapping: [],
  });

  // ================================
  // PART 4 — Groups
  // ================================
  const [part4, setPart4] = useState([
    {
      id: 1,
      instruction: '',
      audioUrl: '',
      subQuestions: [
        {
          id: 1,
          content: '',
          options: [
            { id: 1, label: 'A', value: '' },
            { id: 2, label: 'B', value: '' },
            { id: 3, label: 'C', value: '' },
          ],
          correctId: null,
        },
      ],
    },
    {
      id: 2,
      instruction: '',
      audioUrl: '',
      subQuestions: [
        {
          id: 1,
          content: '',
          options: [
            { id: 1, label: 'A', value: '' },
            { id: 2, label: 'B', value: '' },
            { id: 3, label: 'C', value: '' },
          ],
          correctId: null,
        },
      ],
    },
  ]);

  const updateGroupField = (id, key, value) => {
    setPart4((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [key]: value } : g))
    );
  };

  const updateGroupSub = (gId, sId, key, value) => {
    setPart4((prev) =>
      prev.map((g) =>
        g.id === gId
          ? {
            ...g,
            subQuestions: g.subQuestions.map((s) =>
              s.id === sId ? { ...s, [key]: value } : s
            ),
          }
          : g
      )
    );
  };

  const updateGroupOption = (gId, sId, oId, value) => {
    setPart4((prev) =>
      prev.map((g) =>
        g.id === gId
          ? {
            ...g,
            subQuestions: g.subQuestions.map((s) =>
              s.id === sId
                ? {
                  ...s,
                  options: s.options.map((o) =>
                    o.id === oId ? { ...o, value } : o
                  ),
                }
                : s
            ),
          }
          : g
      )
    );
  };

  const addSubQuestion = (gId) => {
    setPart4((prev) =>
      prev.map((g) =>
        g.id === gId
          ? {
            ...g,
            subQuestions: [
              ...g.subQuestions,
              {
                id: g.subQuestions.length + 1,
                content: '',
                options: [
                  { id: 1, label: 'A', value: '' },
                  { id: 2, label: 'B', value: '' },
                  { id: 3, label: 'C', value: '' },
                ],
                correctId: null,
              },
            ],
          }
          : g
      )
    );
  };

  const deleteSubQuestion = (gId, sId) => {
    setPart4((prev) =>
      prev.map((g) =>
        g.id === gId
          ? {
            ...g,
            subQuestions: g.subQuestions.filter((s) => s.id !== sId),
          }
          : g
      )
    );
  };

  // =====================================
  // LOAD DRAFT
  // =====================================
  useEffect(() => {
    if (!draftId) return;
    let cancelled = false;
    const loadDraft = async () => {
      try {
        const { data } = await QuestionApi.getDetail({ skillName: 'LISTENING', sectionId: draftId });
        if (cancelled) return;
        const d = data.data;

        setSectionName(d.SectionName || '');
        setPart1Name(d.part1?.name || '');
        setPart2Name(d.part2?.name || '');
        setPart3Name(d.part3?.name || '');
        setPart4Name(d.part4?.name || '');

        // Part 1: Multiple Choice
        if (d.part1?.questions) {
          const p1 = d.part1.questions.map((q, idx) => {
            const ac = q.AnswerContent || {};
            const opts = (ac.options || []).map((o, i) => ({
              id: i + 1,
              label: String.fromCharCode(65 + i),
              value: o.value || o,
            }));
            const correctVal = ac.correctAnswer;
            const correctId = opts.findIndex(o => o.value === correctVal) + 1;
            return {
              id: idx + 1,
              instruction: q.Content || '',
              audioUrl: (q.AudioKeys || [])[0] || '',
              options: opts.length > 0 ? opts : [
                { id: 1, label: 'A', value: '' },
                { id: 2, label: 'B', value: '' },
                { id: 3, label: 'C', value: '' },
              ],
              correctId: correctId || null,
            };
          });
          while (p1.length < 13) {
            p1.push({
              id: p1.length + 1,
              instruction: '',
              audioUrl: '',
              options: [
                { id: 1, label: 'A', value: '' },
                { id: 2, label: 'B', value: '' },
                { id: 3, label: 'C', value: '' },
              ],
              correctId: null,
            });
          }
          setPart1(p1);
        }

        // Part 2: Matching
        if (d.part2?.questions?.[0]) {
          const q = d.part2.questions[0];
          const ac = q.AnswerContent || {};
          setPart2({
            instruction: q.Content || '',
            audioUrl: (q.AudioKeys || [])[0] || '',
            leftItems: (ac.leftItems || []).map((t, i) => ({ id: i + 1, text: typeof t === 'string' ? t : t.text || '' })),
            rightItems: (ac.rightItems || []).map((t, i) => ({ id: i + 1, text: typeof t === 'string' ? t : t.text || '' })),
            mapping: (ac.correctAnswer || []).map((m, i) => ({
              leftId: (ac.leftItems || []).indexOf(m.left) + 1,
              rightId: (ac.rightItems || []).findIndex(t => (typeof t === 'string' ? t : t.text) === m.right) + 1,
            })),
          });
        }

        // Part 3: Matching
        if (d.part3?.questions?.[0]) {
          const q = d.part3.questions[0];
          const ac = q.AnswerContent || {};
          setPart3({
            instruction: q.Content || '',
            audioUrl: (q.AudioKeys || [])[0] || '',
            leftItems: (ac.leftItems || []).map((t, i) => ({ id: i + 1, text: typeof t === 'string' ? t : t.text || '' })),
            rightItems: (ac.rightItems || []).map((t, i) => ({ id: i + 1, text: typeof t === 'string' ? t : t.text || '' })),
            mapping: (ac.correctAnswer || []).map((m, i) => ({
              leftId: (ac.leftItems || []).indexOf(m.left) + 1,
              rightId: (ac.rightItems || []).findIndex(t => (typeof t === 'string' ? t : t.text) === m.right) + 1,
            })),
          });
        }

        // Part 4: Groups
        if (d.part4?.questions) {
          const groups = d.part4.questions.map((q, gIdx) => {
            const ac = q.AnswerContent || {};
            return {
              id: gIdx + 1,
              instruction: q.Content || '',
              audioUrl: (q.AudioKeys || [])[0] || '',
              subQuestions: (ac.subQuestions || []).map((sq, sIdx) => {
                const sqOpts = (sq.options || []).map((o, i) => ({
                  id: i + 1,
                  label: String.fromCharCode(65 + i),
                  value: o.value || o,
                }));
                const sqCorrect = sqOpts.findIndex(o => o.value === sq.correctAnswer) + 1;
                return {
                  id: sIdx + 1,
                  content: sq.content || '',
                  options: sqOpts.length > 0 ? sqOpts : [
                    { id: 1, label: 'A', value: '' },
                    { id: 2, label: 'B', value: '' },
                    { id: 3, label: 'C', value: '' },
                  ],
                  correctId: sqCorrect || null,
                };
              }),
            };
          });
          while (groups.length < 2) {
            groups.push({
              id: groups.length + 1,
              instruction: '',
              audioUrl: '',
              subQuestions: [{
                id: 1,
                content: '',
                options: [
                  { id: 1, label: 'A', value: '' },
                  { id: 2, label: 'B', value: '' },
                  { id: 3, label: 'C', value: '' },
                ],
                correctId: null,
              }],
            });
          }
          setPart4(groups);
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

  // =====================================
  // AUTOSAVE
  // =====================================
  const buildPayload = useCallback((status = 'draft') => {
    const values = {
      sectionName,
      part1Name,
      part1,
      part2Name,
      part2,
      part3Name,
      part3,
      part4Name,
      part4,
    };
    return {
      SkillName: 'LISTENING',
      SectionName: sectionName || 'Untitled Draft',
      Status: status,
      parts: buildListeningPayload(values).parts,
    };
  }, [sectionName, part1Name, part1, part2Name, part2, part3Name, part3, part4Name, part4]);

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

  // Autosave on any state change
  useEffect(() => {
    if (draftIdRef.current && !isLoading) {
      try {
        const payload = buildPayload('draft');
        scheduleAutosave(payload);
      } catch (e) {
      }
    }
  }, [sectionName, part1Name, part1, part2Name, part2, part3Name, part3, part4Name, part4, isLoading]);

  // =====================================
  // BUTTONS
  // =====================================
  const handleSaveAsDraft = async () => {
    try {
      const payload = buildPayload('draft');
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
      const payload = buildPayload('published');
      if (draftIdRef.current) {
        setIsSubmitting(true);
        await QuestionApi.update({ sectionId: draftIdRef.current, payload });
        message.success('Created Listening successfully!');
        navigate(-1);
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to publish');
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

  // =====================================
  // VALIDATION ICONS
  // =====================================
  const renderHeader = (title, valid) => (
    <div className='flex justify-between w-full'>
      <span>{title}</span>
      <span style={{ color: valid ? 'green' : 'red', fontSize: 18 }}>
        {valid ? '✔' : '✖'}
      </span>
    </div>
  );

  // Sử dụng cho từng Panel
  const renderPanelHeader = (title, valid) => (
    <div className='flex justify-between w-full'>
      <span>{title}</span>
      <span style={{ color: valid ? 'green' : 'red', fontSize: 18 }}>
        {valid ? '✔' : '✖'}
      </span>
    </div>
  );

  // =====================================
  // VALIDATION FUNCTIONS
  // =====================================
  const validatePart1 = () => {
    if (!part1Name.trim()) return false;

    for (let q of part1) {
      if (!q.instruction.trim() || !q.audioUrl) return false;

      const filled = q.options.filter((o) => o.value.trim()).length >= 2;
      if (!filled) return false;

      const correct = q.options.find((o) => o.id === q.correctId);
      if (!correct || !correct.value.trim()) return false;
    }
    return true;
  };

  const validateMatching = (p, name) => {
    if (!name.trim()) return false;
    if (!p.instruction.trim()) return false;
    if (!p.audioUrl) return false;
    if (!p.leftItems.length) return false;
    if (!p.rightItems.length) return false;
    if (!p.mapping.length) return false;

    return true;
  };

  const validatePart4Group = (g) => {
    if (!g.instruction.trim()) return false;
    if (!g.audioUrl) return false;

    for (let s of g.subQuestions) {
      if (!s.content.trim()) return false;

      const opts = s.options.filter((o) => o.value.trim());
      if (opts.length < 2) return false;

      const correct = s.options.find((o) => o.id === s.correctId);
      if (!correct || !correct.value.trim()) return false;
    }

    return true;
  };

  const validatePart4 = () => {
    if (!part4Name.trim()) return false;
    return part4.every((g) => validatePart4Group(g));
  };

  const valid1 = validatePart1();
  const valid2 = validateMatching(part2, part2Name);
  const valid3 = validateMatching(part3, part3Name);
  const valid4 = validatePart4();

  // Add option to a question (no max)
  const addPart1Option = (qId) => {
    setPart1((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;

        const nextIndex = q.options.length + 1;

        return {
          ...q,
          options: [
            ...q.options,
            {
              id: nextIndex,
              label: generateLabel(nextIndex - 1),
              value: '',
            },
          ],
        };
      })
    );
  };

  // Delete option (must keep >= 3)
  const deletePart1Option = (qId, optId) => {
    setPart1((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;

        if (q.options.length <= 3) {
          message.warning('Must have at least 3 options!');
          return q;
        }

        // remove option
        const filtered = q.options.filter((o) => o.id !== optId);

        // reassign ids + labels
        const reindexed = filtered.map((o, index) => ({
          ...o,
          id: index + 1,
          label: generateLabel(index),
        }));

        return {
          ...q,
          options: reindexed,
          correctId: reindexed.find((o) => o.id === q.correctId)
            ? q.correctId
            : null,
        };
      })
    );
  };

  // Add option to a sub-question (no max)
  const addPart4Option = (groupId, subId) => {
    setPart4((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;

        const updatedSub = g.subQuestions.map((s) => {
          if (s.id !== subId) return s;

          const nextIndex = s.options.length + 1;

          return {
            ...s,
            options: [
              ...s.options,
              {
                id: nextIndex,
                label: generateLabel(nextIndex - 1),
                value: '',
              },
            ],
          };
        });

        return { ...g, subQuestions: updatedSub };
      })
    );
  };

  // Delete option from sub-question (min = 3)
  const deletePart4Option = (groupId, subId, optId) => {
    setPart4((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;

        const updatedSub = g.subQuestions.map((s) => {
          if (s.id !== subId) return s;

          if (s.options.length <= 3) {
            message.warning('Must have at least 3 options!');
            return s;
          }

          const filtered = s.options.filter((o) => o.id !== optId);

          const reindexed = filtered.map((o, index) => ({
            ...o,
            id: index + 1,
            label: generateLabel(index),
          }));

          return {
            ...s,
            options: reindexed,
            correctId: reindexed.find((o) => o.id === s.correctId)
              ? s.correctId
              : null,
          };
        });

        return { ...g, subQuestions: updatedSub };
      })
    );
  };

  // Generate Excel-like labels: A, B, ..., Z, AA, AB, ...
  const generateLabel = (num) => {
    let label = '';
    while (num > 0) {
      let rem = (num - 1) % 26;
      label = String.fromCharCode(65 + rem) + label;
      num = Math.floor((num - 1) / 26);
    }
    return label;
  };

  // =====================================
  // RENDER
  // =====================================
  if (!draftId && !isLoading) {
    return <RedirectToNewDraft />;
  }
  if (isLoading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading draft...</div>;
  }

  return (
    <Form layout='vertical' form={form}>
      <Card title='Section Information'>
        <Form.Item
          label='Section Name'
          name='sectionName'
          rules={[{ required: true, message: 'Section name is required' }]}
        >
          <Input
            maxLength={255}
            placeholder='e.g., Fitness Club Listening Test'
            onChange={(e) => {
              const sanitized = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_()"':]/g, '');
              setSectionName(sanitized)
            }}
          />
        </Form.Item>
      </Card>

      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        {/* PART 1 */}
        <Card
          title={renderHeader(
            'PART 1 — Multiple Choice (13 questions)',
            valid1
          )}
        >
          <Form.Item label='Part Name' required>
            <Input
              placeholder='Enter Part 1 name...'
              value={part1Name}
              maxLength={255}
              onChange={(e) => {
                const sanitized = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_()"':]/g, '');
                setPart1Name(sanitized)
              }}
            />
          </Form.Item>

          <Collapse accordion>
            {part1.map((q) => (
              <Panel
                key={q.id}
                header={renderPanelHeader(
                  `Question ${q.id}`,
                  Boolean(
                    q.instruction.trim() &&
                    q.audioUrl &&
                    q.options.filter((o) => o.value.trim()).length >= 2 &&
                    q.options.find((o) => o.id === q.correctId)
                  )
                )}
              >
                <Form.Item label='Instruction' required>
                  <TextArea
                    rows={2}
                    value={q.instruction}
                    maxLength={255}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^a-zA-Z0-9 ,.\-_()"':]/g, '');
                      updatePart1Field(q.id, 'instruction', sanitized)
                    }
                    }
                  />
                </Form.Item>

                <MinioUploadDragger
                  accept='.mp3'
                  allowedMimeTypes={['audio/mpeg']}
                  bucketType='audios'
                  hint='Drop an MP3 file here or click to browse'
                  onChange={(url) => updatePart1Field(q.id, 'audioUrl', url)}
                  title='Upload question audio'
                  value={q.audioUrl}
                />

                {q.audioUrl && (
                  <audio src={q.audioUrl} controls style={{ marginTop: 10 }} />
                )}

                {q.options.map((o) => (
                  <div key={o.id} className='flex items-center gap-2 mb-2'>
                    <div className='w-6 font-bold'>{o.label}</div>

                    <Input
                      className='flex-1'
                      value={o.value}
                      onChange={(e) =>
                        updatePart1Option(q.id, o.id, e.target.value)
                      }
                    />

                    {/* DELETE BUTTON */}
                    <DeleteOutlined
                      className={`cursor-pointer text-red-500 ${q.options.length <= 3
                        ? 'opacity-30 pointer-events-none'
                        : ''
                        }`}
                      onClick={() => deletePart1Option(q.id, o.id)}
                    />
                  </div>
                ))}

                <Button
                  size='small'
                  icon={<PlusOutlined />}
                  onClick={() => addPart1Option(q.id)}
                  style={{ marginTop: 8 }}
                >
                  Add option
                </Button>

                <Form.Item label='Correct Answer' required className='mt-4'>
                  <Select
                    value={q.correctId || undefined}
                    onChange={(v) => updatePart1Field(q.id, 'correctId', v)}
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
        <Card title={renderHeader('PART 2 — Matching', valid2)}>
          <Form.Item label='Part Name' required>
            <Input
              placeholder='Enter Part 2 name...'
              value={part2Name}
              maxLength={255}
              onChange={(e) =>
                setPart2Name(
                  e.target.value.replace(/[^a-zA-Z0-9 ,.\-_()"':?\n]/g, '')
                )
              }
            />
          </Form.Item>

          <Form.Item label='Instruction' required>
            <TextArea
              rows={2}
              value={part2.instruction}
              onChange={(e) =>
                setPart2({ ...part2, instruction: e.target.value })
              }
            />
          </Form.Item>

          <MinioUploadDragger
            accept='.mp3'
            allowedMimeTypes={['audio/mpeg']}
            bucketType='audios'
            hint='Drop an MP3 file here or click to browse'
            onChange={(url) => setPart2((prev) => ({ ...prev, audioUrl: url }))}
            title='Upload Part 2 audio'
            value={part2.audioUrl}
          />

          {part2.audioUrl && <audio src={part2.audioUrl} controls />}

          <ListeningMatchingEditor
            leftItems={part2.leftItems}
            setLeftItems={(v) =>
              setPart2((prev) => ({ ...prev, leftItems: v }))
            }
            rightItems={part2.rightItems}
            setRightItems={(v) =>
              setPart2((prev) => ({ ...prev, rightItems: v }))
            }
            mapping={part2.mapping}
            setMapping={(v) => setPart2((prev) => ({ ...prev, mapping: v }))}
          />
        </Card>

        {/* PART 3 */}
        <Card title={renderHeader('PART 3 — Matching', valid3)}>
          <Form.Item label='Part Name' required>
            <Input
              placeholder='Enter Part 3 name...'
              value={part3Name}
              maxLength={255}
              onChange={(e) =>
                setPart3Name(
                  e.target.value.replace(/[^a-zA-Z0-9 ,.\-_()"':?\n]/g, '')
                )
              }
            />
          </Form.Item>

          <Form.Item label='Instruction' required>
            <TextArea
              rows={2}
              value={part3.instruction}
              onChange={(e) =>
                setPart3({ ...part3, instruction: e.target.value })
              }
            />
          </Form.Item>

          <MinioUploadDragger
            accept='.mp3'
            allowedMimeTypes={['audio/mpeg']}
            bucketType='audios'
            hint='Drop an MP3 file here or click to browse'
            onChange={(url) => setPart3((prev) => ({ ...prev, audioUrl: url }))}
            title='Upload Part 3 audio'
            value={part3.audioUrl}
          />

          {part3.audioUrl && <audio src={part3.audioUrl} controls />}

          <ListeningMatchingEditor
            leftItems={part3.leftItems}
            setLeftItems={(v) =>
              setPart3((prev) => ({ ...prev, leftItems: v }))
            }
            rightItems={part3.rightItems}
            setRightItems={(v) =>
              setPart3((prev) => ({ ...prev, rightItems: v }))
            }
            mapping={part3.mapping}
            setMapping={(v) => setPart3((prev) => ({ ...prev, mapping: v }))}
          />
        </Card>

        {/* PART 4 */}
        <Card title={renderHeader('PART 4 — Listening Groups', valid4)}>
          <Form.Item label='Part Name' required>
            <Input
              placeholder='Enter Part 4 name...'
              value={part4Name}
              maxLength={255}
              onChange={(e) =>
                setPart4Name(
                  e.target.value.replace(/[^a-zA-Z0-9 ,.\-_()"':?\n]/g, '')
                )
              }
            />
          </Form.Item>

          <Collapse accordion>
            {part4.map((g) => (
              <Panel
                key={g.id}
                header={renderPanelHeader(
                  `Group ${g.id}`,
                  validatePart4Group(g)
                )}
              >
                <Form.Item label='Instruction' required>
                  <TextArea
                    rows={2}
                    value={g.instruction}
                    onChange={(e) =>
                      updateGroupField(g.id, 'instruction', e.target.value)
                    }
                  />
                </Form.Item>

                <MinioUploadDragger
                  accept='.mp3'
                  allowedMimeTypes={['audio/mpeg']}
                  bucketType='audios'
                  hint='Drop an MP3 file here or click to browse'
                  onChange={(url) => updateGroupField(g.id, 'audioUrl', url)}
                  title='Upload group audio'
                  value={g.audioUrl}
                />

                {g.audioUrl && <audio src={g.audioUrl} controls />}

                {g.subQuestions.map((s) => (
                  <div key={s.id} className='flex gap-4'>
                    <Card size='small' className='flex-1 mt-4'>
                      <Form.Item label={`Sub question ${s.id}`} required>
                        <Input
                          value={s.content}
                          onChange={(e) =>
                            updateGroupSub(
                              g.id,
                              s.id,
                              'content',
                              e.target.value
                            )
                          }
                        />
                      </Form.Item>

                      {s.options.map((o) => (
                        <div
                          key={o.id}
                          className='flex items-center gap-2 mb-2'
                        >
                          <div className='w-6 font-bold'>{o.label}</div>

                          <Input
                            className='flex-1'
                            value={o.value}
                            onChange={(e) =>
                              updateGroupOption(
                                g.id,
                                s.id,
                                o.id,
                                e.target.value
                              )
                            }
                          />

                          <DeleteOutlined
                            className={`cursor-pointer text-red-500 ${s.options.length <= 3
                              ? 'opacity-30 pointer-events-none'
                              : ''
                              }`}
                            onClick={() => deletePart4Option(g.id, s.id, o.id)}
                          />
                        </div>
                      ))}
                      <Button
                        size='small'
                        icon={<PlusOutlined />}
                        onClick={() => addPart4Option(g.id, s.id)}
                        style={{ marginBottom: 12 }}
                      >
                        Add option
                      </Button>

                      <Select
                        className='w-full'
                        value={s.correctId || undefined}
                        onChange={(v) =>
                          updateGroupSub(g.id, s.id, 'correctId', v)
                        }
                        options={s.options.map((o) => ({
                          value: o.id,
                          label: o.label,
                        }))}
                      />
                    </Card>

                    <DeleteOutlined
                      className='!cursor-pointer text-red-500 hover:!text-red-600 text-lg mt-6'
                      onClick={() => deleteSubQuestion(g.id, s.id)}
                    />
                  </div>
                ))}

                <Button
                  icon={<PlusOutlined />}
                  onClick={() => addSubQuestion(g.id)}
                  style={{ marginTop: 10 }}
                >
                  Add sub-question
                </Button>
              </Panel>
            ))}
          </Collapse>
        </Card>

        {/* SAVE ALL */}
        <div className='flex justify-end gap-4 mb-10'>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button loading={isSubmitting || isAutosaving} onClick={handleSaveAsDraft}>
            <SaveOutlined /> Save as Draft
          </Button>
          <Button
            type='primary'
            onClick={handlePublish}
            loading={isSubmitting || isAutosaving || isPending}
            className='bg-blue-900'
          >
            Publish
          </Button>
        </div>
      </Space>
    </Form>
  );
};

const RedirectToNewDraft = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const createAndRedirect = async () => {
      try {
        const { data } = await SectionApi.createDraft('LISTENING');
        const sectionId = data.data.ID;
        navigate(`/questions/update/${sectionId}?skillName=LISTENING`, { replace: true });
      } catch (error) {
        message.error('Failed to create draft');
      }
    };
    createAndRedirect();
  }, []);
  return <div style={{ padding: 40, textAlign: 'center' }}>Creating draft...</div>;
};

export default CreateListening;
