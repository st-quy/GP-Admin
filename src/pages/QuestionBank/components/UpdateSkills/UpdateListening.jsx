// UpdateListening.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import {
  useGetQuestionGroupDetail,
  useUpdateQuestionGroup,
} from '@features/questions/hooks';
import { useGetAllTags } from '@features/sections/hooks';

import { buildListeningPayload } from '@pages/QuestionBank/schemas/createQuestionSchema';
import ListeningMatchingEditor from '../CreateSkills/Listening/ListeningMatchingEditor';
import MinioUploadDragger from '@shared/components/MinioUploadDragger';
import { QuestionApi } from '@features/questions/api';
import {
  MAX_QUESTION_INPUT_LENGTH,
  sanitizeQuestionInput,
} from '@shared/lib/questionInput';

const { TextArea } = Input;
const { Panel } = Collapse;
const AUTOSAVE_DEBOUNCE_MS = 2000;

const extractAudioUrl = (audioKeys) => {
  if (typeof audioKeys === 'string') return audioKeys;
  if (typeof audioKeys === 'object' && audioKeys !== null) {
    return audioKeys.hyperlink || audioKeys.text || audioKeys.url || '';
  }
  return '';
};

const UpdateListening = () => {
  const navigate = useNavigate();
  const { id: sectionId } = useParams();
  const [form] = Form.useForm();

  const { data: detail, isFetching } = useGetQuestionGroupDetail(
    'LISTENING',
    sectionId
  );

  const { mutate: updateListeningGroup, isPending } = useUpdateQuestionGroup();

  const [isAutosaving, setIsAutosaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const debounceTimerRef = useRef(null);
  const payloadRef = useRef(null);
  const isPublishingRef = useRef(false);
  const [tags, setTags] = useState([]);
  const [originalStatus, setOriginalStatus] = useState('draft');
  const { data: existingTags = [] } = useGetAllTags();

  // ===============================
  // STATE
  // ===============================
  const [sectionName, setSectionName] = useState('');
  const [part1Name, setPart1Name] = useState('');
  const [part2Name, setPart2Name] = useState('');
  const [part3Name, setPart3Name] = useState('');
  const [part4Name, setPart4Name] = useState('');

  const [part1Id, setPart1Id] = useState(null);
  const [part2Id, setPart2Id] = useState(null);
  const [part3Id, setPart3Id] = useState(null);
  const [part4Id, setPart4Id] = useState(null);

  const [part1, setPart1] = useState([]);
  const [part2, setPart2] = useState({
    questionId: '',
    instruction: '',
    audioUrl: '',
    leftItems: [],
    rightItems: [],
    mapping: [],
  });
  const [part3, setPart3] = useState({
    questionId: '',
    instruction: '',
    audioUrl: '',
    leftItems: [],
    rightItems: [],
    mapping: [],
  });
  const [part4, setPart4] = useState([]);

  const generateLabel = (index) => {
    let label = '';
    let i = index;
    while (i >= 0) {
      label = String.fromCharCode((i % 26) + 65) + label;
      i = Math.floor(i / 26) - 1;
    }
    return label;
  };

  // ===============================
  // MAP API -> UI STATE
  // ===============================
  useEffect(() => {
    if (!detail) return;

    const d = detail;

    setSectionName(d.SectionName);
    setOriginalStatus(d.Status || 'draft');

    const allTags = new Set();
    Object.keys(d).filter(k => typeof k === 'string' && k.startsWith('part')).forEach(key => {
      const part = d[key];
      (part?.questions || []).forEach(q => {
        (q.Tags || []).forEach(t => allTags.add(t));
      });
    });
    setTags(Array.from(allTags));

    // ---- PART 1 ----
    setPart1Id(d.part1?.id);
    setPart1Name(d.part1?.name);

    if (d.part1?.questions?.length > 0) {
      const mcqList = d.part1.questions.map((q, idx) => {
        const opts = q.AnswerContent?.options || [];

        return {
          id: idx + 1,
          questionId: q.ID,
          instruction: q.Content || '',
          audioUrl: extractAudioUrl(q.AudioKeys),
          options: [
            { id: 1, label: 'A', value: opts[0] || '' },
            { id: 2, label: 'B', value: opts[1] || '' },
            { id: 3, label: 'C', value: opts[2] || '' },
          ],
          correctId:
            [opts[0], opts[1], opts[2]].indexOf(q.AnswerContent?.correctAnswer) +
            1,
        };
      });

      setPart1(mcqList);
    } else {
      setPart1(
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
    }

    // ---- PART 2 ----
    setPart2Id(d.part2?.id);
    setPart2Name(d.part2?.name);

    const part2Q = d.part2?.questions?.[0];
    const ac2 = part2Q?.AnswerContent;

    if (part2Q) {
      setPart2({
        questionId: part2Q?.ID,
        instruction: ac2?.content || '',
        audioUrl: extractAudioUrl(ac2?.audioKeys),
        leftItems:
          ac2?.leftItems?.map((t, idx) => ({
            id: idx + 1,
            text: typeof t === 'string' ? t.replace(/^\s*\d+\.\s*/, '') : t.text || '',
          })) || [],
        rightItems:
          ac2?.rightItems?.map((t, idx) => ({
            id: idx + 1,
            text: typeof t === 'string' ? t.replace(/^\s*\d+\.\s*/, '') : t.text || '',
          })) || [],
        mapping:
          ac2?.correctAnswer?.map((m, idx) => ({
            leftIndex: idx,
            rightId: ac2.rightItems.findIndex((x) => (typeof x === 'string' ? x : x.text) === m.value) + 1,
          })) || [],
      });
    } else {
      setPart2({
        questionId: '',
        instruction: '',
        audioUrl: '',
        leftItems: [],
        rightItems: [],
        mapping: [],
      });
    }

    // ---- PART 3 ----
    setPart3Id(d.part3?.id);
    setPart3Name(d.part3?.name);

    const part3Q = d.part3?.questions?.[0];
    const ac3 = part3Q?.AnswerContent;

    if (part3Q) {
      setPart3({
        questionId: part3Q?.ID,
        instruction: ac3?.content || '',
        audioUrl: extractAudioUrl(ac3?.audioKeys),
        leftItems:
          ac3?.leftItems?.map((t, idx) => ({
            id: idx + 1,
            text: typeof t === 'string' ? t.replace(/^\s*\d+\.\s*/, '') : t.text || '',
          })) || [],
        rightItems:
          ac3?.rightItems?.map((t, idx) => ({
            id: idx + 1,
            text: typeof t === 'string' ? t.replace(/^\s*\d+\.\s*/, '') : t.text || '',
          })) || [],
        mapping:
          ac3?.correctAnswer?.map((m, idx) => ({
            leftIndex: idx,
            rightId: ac3.rightItems.findIndex((x) => (typeof x === 'string' ? x : x.text) === m.value) + 1,
          })) || [],
      });
    } else {
      setPart3({
        questionId: '',
        instruction: '',
        audioUrl: '',
        leftItems: [],
        rightItems: [],
        mapping: [],
      });
    }

    // ---- PART 4 ----
    setPart4Id(d.part4?.id);
    setPart4Name(d.part4?.name);

    if (d.part4?.questions?.length > 0) {
      const part4Groups = d.part4.questions.map((q, gIdx) => {
        const ac = q.AnswerContent?.groupContent?.listContent || [];

        return {
          id: gIdx + 1,
          questionId: q.ID,
          instruction: q.Content || '',
          audioUrl: extractAudioUrl(q.AudioKeys),
          subQuestions: ac.map((sc) => ({
            id: sc.ID,
            content: sc.content,
            options: sc.options.map((op, idx) => ({
              id: idx + 1,
              label: generateLabel(idx),
              value: op,
            })),
            correctId: sc.options.indexOf(sc.correctAnswer) + 1,
          })),
        };
      });

      setPart4(part4Groups);
    } else {
      setPart4([
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
    }
  }, [detail]);

  // ===============================
  // VALIDATION ICON
  // ===============================

  const validatePart1 = () => {
    if (!part1Name?.trim()) return false;
    for (let q of part1) {
      if (!q.instruction?.trim() || !q.audioUrl) return false;
      if (q.options.filter((o) => o.value?.trim()).length < 2) return false;
      if (!q.correctId) return false;
    }
    return true;
  };

  const validateMatching = (p, name) =>
    name?.trim() &&
    p.instruction?.trim() &&
    p.audioUrl &&
    p.leftItems?.length &&
    p.rightItems?.length &&
    p.mapping?.length;

  const validatePart4Group = (g) => {
    if (!g.instruction?.trim() || !g.audioUrl) return false;
    for (let s of g.subQuestions) {
      if (!s.content?.trim()) return false;
      if (!s.correctId) return false;
    }
    return true;
  };

  const validatePart4 = () =>
    part4Name?.trim() && part4.every((g) => validatePart4Group(g));

  const valid1 = validatePart1();
  const valid2 = validateMatching(part2, part2Name);
  const valid3 = validateMatching(part3, part3Name);
  const valid4 = validatePart4();

  const handleSaveAll = () => {
    const values = {
      sectionName,
      part1Id,
      part2Id,
      part3Id,
      part4Id,

      part1Name,
      part2Name,
      part3Name,
      part4Name,

      part1,
      part2,
      part3,
      part4,

      sectionId,
    };

    const payload = buildListeningPayload(values);

    updateListeningGroup(
      { sectionId, payload },
      {
        onSuccess: () => {
          message.success('Updated Listening successfully!');
          navigate(-1);
        },
        onError: () => message.error('Failed to update Listening'),
      }
    );
  };

  /* ---------------- AUTOSAVE ---------------- */
  const scheduleAutosave = useCallback((payload) => {
    if (isPublishing) return;
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
  }, [sectionId, isPublishing]);

  const buildPayload = useCallback((status = 'draft') => {
    const values = {
      sectionName,
      part1Id,
      part2Id,
      part3Id,
      part4Id,
      part1Name,
      part2Name,
      part3Name,
      part4Name,
      part1,
      part2,
      part3,
      part4,
      sectionId,
    };
    return {
      SkillName: 'LISTENING',
      SectionName: sectionName || 'Untitled Draft',
      Status: status,
      tags: tags,
      parts: buildListeningPayload(values).parts,
    };
  }, [sectionName, part1Id, part2Id, part3Id, part4Id, part1Name, part2Name, part3Name, part4Name, part1, part2, part3, part4, sectionId, tags]);

  // Autosave on any state change
  useEffect(() => {
    if (!isFetching && detail) {
      try {
        const payload = buildPayload(originalStatus);
        scheduleAutosave(payload);
      } catch (e) {
      }
    }
  }, [sectionName, part1Name, part1, part2Name, part2, part3Name, part3, part4Name, part4, isFetching, detail, tags, originalStatus]);

  const handleSaveAsDraft = async () => {
    try {
      const payload = buildPayload('draft');
      setIsSubmitting(true);
      await QuestionApi.update({ sectionId, payload });
      message.success('Draft saved successfully');
      navigate(-1);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    try {
      const payload = buildPayload('published');  // Use buildPayload which includes tags

      isPublishingRef.current = true;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      payloadRef.current = null;

      setIsPublishing(true);
      updateListeningGroup(
        { sectionId, payload },
        {
          onSuccess: () => {
            message.success('Updated Listening successfully!');
            navigate(-1);
          },
          onError: () => message.error('Failed to update Listening'),
        }
      );
    } catch (err) {
      message.error('Failed to publish');
    } finally {
      setIsPublishing(false);
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

  const renderHeader = (title, valid) => (
    <div className='flex justify-between w-full'>
      <span>{title}</span>
      <span style={{ color: valid ? 'green' : 'red', fontSize: 18 }}>
        {valid ? '✔' : '✖'}
      </span>
    </div>
  );

  const renderPanelHeader = (title, valid) => (
    <div className='flex justify-between w-full'>
      <span>{title}</span>
      <span style={{ color: valid ? 'green' : 'red', fontSize: 18 }}>
        {valid ? '✔' : '✖'}
      </span>
    </div>
  );
  const updateGroupField = (groupId, field, value) => {
    setPart4((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, [field]: value } : g))
    );
  };

  const updateGroupSub = (groupId, subId, field, value) => {
    setPart4((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              subQuestions: g.subQuestions.map((s) =>
                s.id === subId ? { ...s, [field]: value } : s
              ),
            }
          : g
      )
    );
  };

  const updateGroupOption = (groupId, subId, optionId, value) => {
    setPart4((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              subQuestions: g.subQuestions.map((s) =>
                s.id === subId
                  ? {
                      ...s,
                      options: s.options.map((o) =>
                        o.id === optionId ? { ...o, value } : o
                      ),
                    }
                  : s
              ),
            }
          : g
      )
    );
  };

  const deleteSubQuestion = (groupId, subId) => {
    setPart4((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              subQuestions: g.subQuestions.filter((s) => s.id !== subId),
            }
          : g
      )
    );
  };

  const addSubQuestion = (groupId) => {
    setPart4((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              subQuestions: [
                ...g.subQuestions,
                {
                  id: g.subQuestions.length + 1,
                  content: '',
                  correctId: null,
                  options: [
                    { id: 1, label: 'A', value: '' },
                    { id: 2, label: 'B', value: '' },
                    { id: 3, label: 'C', value: '' },
                  ],
                },
              ],
            }
          : g
      )
    );
  };
  const addSubOption = (groupId, subId) => {
    setPart4((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              subQuestions: g.subQuestions.map((s) =>
                s.id === subId
                  ? {
                      ...s,
                      options: [
                        ...s.options,
                        {
                          id: s.options.length + 1,
                          label: generateLabel(s.options.length - 1),
                          value: '',
                        },
                      ],
                    }
                  : s
              ),
            }
          : g
      )
    );
  };

  const deleteSubOption = (groupId, subId, optionId) => {
    if (optionId <= 3) return; // 🔒 không cho xoá A,B,C

    setPart4((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              subQuestions: g.subQuestions.map((s) =>
                s.id === subId
                  ? {
                      ...s,
                      options: s.options
                        .filter((o) => o.id !== optionId)
                        .map((o, idx) => ({
                          ...o,
                          id: idx + 1,
                          label: generateLabel(idx),
                        })),
                    }
                  : s
              ),
            }
          : g
      )
    );
  };

  // Add option to PART 1 question
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

        const filtered = q.options.filter((o) => o.id !== optId);

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

  if (isFetching || !detail) return <p>Loading...</p>;

  return (
    <Form layout='vertical' style={{ paddingBottom: 40 }}>
      <Card title={<span>Section Information</span>} className='mb-6'>
        <Form.Item label='Section Name' required>
          <Input
            value={sectionName}
            maxLength={MAX_QUESTION_INPUT_LENGTH}
            onChange={(e) => setSectionName(sanitizeQuestionInput(e.target.value))}
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

      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        <Card
          title={renderHeader(
            'PART 1 — Multiple Choice (13 questions)',
            valid1
          )}
        >
          <Form.Item label='Part Name' required>
            <Input
              placeholder='Enter part name...'
              value={part1Name}
              maxLength={MAX_QUESTION_INPUT_LENGTH}
              onChange={(e) => setPart1Name(sanitizeQuestionInput(e.target.value))}
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
                <Space
                  direction='vertical'
                  size='middle'
                  style={{ width: '100%' }}
                >
                  <Form.Item label='Instruction' required className='!mb-0'>
                    <TextArea
                      rows={2}
                      value={q.instruction}
                      maxLength={MAX_QUESTION_INPUT_LENGTH}
                      onChange={(e) =>
                        setPart1((prev) =>
                          prev.map((x) =>
                            x.id === q.id
                              ? {
                                  ...x,
                                  instruction: sanitizeQuestionInput(
                                    e.target.value
                                  ),
                                }
                              : x
                          )
                        )
                      }
                    />
                  </Form.Item>

                  <MinioUploadDragger
                    accept='.mp3'
                    allowedMimeTypes={['audio/mpeg']}
                    bucketType='audios'
                    hint='Drop an MP3 file here or click to browse'
                    onChange={(url) =>
                      setPart1((prev) =>
                        prev.map((x) =>
                          x.id === q.id ? { ...x, audioUrl: url } : x
                        )
                      )
                    }
                    title='Upload question audio'
                    value={q.audioUrl}
                  />

                  {q.audioUrl && <audio src={q.audioUrl} controls />}

                  {q.options.map((o) => (
                    <div key={o.id} className='flex items-center gap-3 mb-2'>
                      <b className='w-6'>{o.label}</b>

                      <Input
                        className='flex-1'
                        value={o.value}
                        maxLength={MAX_QUESTION_INPUT_LENGTH}
                        onChange={(e) =>
                          setPart1((prev) =>
                            prev.map((x) =>
                              x.id === q.id
                                ? {
                                    ...x,
                                    options: x.options.map((opt) =>
                                      opt.id === o.id
                                        ? {
                                            ...opt,
                                            value: sanitizeQuestionInput(
                                              e.target.value
                                            ),
                                          }
                                        : opt
                                    ),
                                  }
                                : x
                            )
                          )
                        }
                      />

                      {/* DELETE OPTION */}
                      <DeleteOutlined
                        className={`text-red-500 cursor-pointer ${
                          q.options.length <= 3
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
                    className='mt-1'
                  >
                    + Add option
                  </Button>

                  <Select
                    className='w-full'
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
                </Space>
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
              maxLength={MAX_QUESTION_INPUT_LENGTH}
              onChange={(e) => setPart2Name(sanitizeQuestionInput(e.target.value))}
            />
          </Form.Item>

          <Form.Item label='Instruction' required>
            <TextArea
              rows={2}
              value={part2.instruction}
              maxLength={MAX_QUESTION_INPUT_LENGTH}
              onChange={(e) =>
                setPart2((prev) => ({
                  ...prev,
                  instruction: sanitizeQuestionInput(e.target.value),
                }))
              }
            />
          </Form.Item>

          <MinioUploadDragger
            accept='.mp3'
            allowedMimeTypes={['audio/mpeg']}
            bucketType='audios'
            hint='Drop an MP3 file here or click to browse'
            onChange={(url) =>
              setPart2((prev) => ({ ...prev, audioUrl: url }))
            }
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
              placeholder='Part 3 name'
              value={part3Name}
              maxLength={MAX_QUESTION_INPUT_LENGTH}
              onChange={(e) => setPart3Name(sanitizeQuestionInput(e.target.value))}
            />
          </Form.Item>

          <Form.Item label='Instruction' required>
            <TextArea
              rows={2}
              value={part3.instruction}
              maxLength={MAX_QUESTION_INPUT_LENGTH}
              onChange={(e) =>
                setPart3((prev) => ({
                  ...prev,
                  instruction: sanitizeQuestionInput(e.target.value),
                }))
              }
            />
          </Form.Item>

          <MinioUploadDragger
            accept='.mp3'
            allowedMimeTypes={['audio/mpeg']}
            bucketType='audios'
            hint='Drop an MP3 file here or click to browse'
            onChange={(url) =>
              setPart3((prev) => ({ ...prev, audioUrl: url }))
            }
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
              maxLength={MAX_QUESTION_INPUT_LENGTH}
              onChange={(e) => setPart4Name(sanitizeQuestionInput(e.target.value))}
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
                {/* Instruction */}
                <Form.Item label='Instruction' required>
                  <TextArea
                    rows={2}
                    value={g.instruction}
                    onChange={(e) =>
                      updateGroupField(
                        g.id,
                        'instruction',
                        sanitizeQuestionInput(e.target.value)
                      )
                    }
                    maxLength={MAX_QUESTION_INPUT_LENGTH}
                  />
                </Form.Item>

                {/* Audio upload */}
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

                {/* SUB QUESTIONS */}
                {g.subQuestions.map((s) => (
                  <div key={s.id} className='flex gap-4'>
                    <Card size='small' className='flex-1 mt-4'>
                      {/* Sub-question content */}
                      <Form.Item label={`Sub question ${s.id}`} required>
                        <Input
                          value={s.content}
                          maxLength={MAX_QUESTION_INPUT_LENGTH}
                          onChange={(e) =>
                            updateGroupSub(
                              g.id,
                              s.id,
                              'content',
                              sanitizeQuestionInput(e.target.value)
                            )
                          }
                        />
                      </Form.Item>

                      {/* Options */}
                      {s.options.map((o) => (
                        <div
                          key={o.id}
                          className='flex gap-2 mb-1 items-center'
                        >
                          <div>{o.label}</div>
                          <Input
                            value={o.value}
                            maxLength={MAX_QUESTION_INPUT_LENGTH}
                            onChange={(e) =>
                              updateGroupOption(
                                g.id,
                                s.id,
                                o.id,
                                sanitizeQuestionInput(e.target.value)
                              )
                            }
                          />
                          {/* DELETE OPTION */}

                          {o.id > 3 && (
                            <DeleteOutlined
                              className='text-red-500 cursor-pointer hover:text-red-700'
                              onClick={() => deleteSubOption(g.id, s.id, o.id)}
                            />
                          )}
                        </div>
                      ))}

                      {/* Add option */}
                      <Button
                        size='small'
                        type='dashed'
                        onClick={() => addSubOption(g.id, s.id)}
                        className='mt-2'
                      >
                        + Add option
                      </Button>

                      {/* Correct answer */}
                      <div className='mt-3'>Correct answer</div>
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

                    {/* Delete sub-question */}
                    <DeleteOutlined
                      className='!cursor-pointer text-red-500 hover:!text-red-600 text-lg mt-6'
                      onClick={() => deleteSubQuestion(g.id, s.id)}
                    />
                  </div>
                ))}

                {/* Add sub-question */}
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

        <div className='flex justify-end gap-4'>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button loading={isSubmitting || isAutosaving} onClick={handleSaveAsDraft}>
            <SaveOutlined /> Save as Draft
          </Button>
          <Button
            type='primary'
            loading={isPending || isAutosaving || isPublishing}
            className='bg-blue-900'
            onClick={handlePublish}
          >
            Publish
          </Button>
        </div>
      </Space>
    </Form>
  );
};

export default UpdateListening;
