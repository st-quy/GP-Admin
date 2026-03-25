// UpdateListening.jsx
import React, { useEffect, useState } from 'react';
import {
  Input,
  Select,
  Button,
  Upload,
  message,
  Form,
  Card,
  Space,
  Collapse,
} from 'antd';
import { AudioOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetQuestionGroupDetail,
  useUpdateQuestionGroup,
} from '@features/questions/hooks';

import axiosInstance from '@shared/config/axios';
import { buildListeningPayload } from '@pages/QuestionBank/schemas/createQuestionSchema';
import ListeningMatchingEditor from '../CreateSkills/Listening/ListeningMatchingEditor';

const { TextArea } = Input;
const { Panel } = Collapse;

const UpdateListening = () => {
  const navigate = useNavigate();
  const { id: sectionId } = useParams();
  const [form] = Form.useForm();

  const { data: detail, isFetching } = useGetQuestionGroupDetail(
    'LISTENING',
    sectionId
  );

  const { mutate: updateListeningGroup, isPending } = useUpdateQuestionGroup();

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

    // ---- PART 1 ----
    setPart1Id(d.part1?.id);
    setPart1Name(d.part1?.name);

    const mcqList = d.part1?.questions?.map((q, idx) => {
      const opts = q.AnswerContent?.options || [];

      return {
        id: idx + 1, // UI index
        questionId: q.ID,
        instruction: q.Content || '',
        audioUrl: q.AudioKeys || '',
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

    // ---- PART 2 ----
    setPart2Id(d.part2?.id);
    setPart2Name(d.part2?.name);

    const part2Q = d.part2?.questions?.[0];
    const ac2 = part2Q?.AnswerContent;

    setPart2({
      questionId: part2Q?.ID,
      instruction: ac2?.content || '',
      audioUrl: ac2?.audioKeys || '',
      leftItems:
        ac2?.leftItems?.map((t, idx) => ({
          id: idx + 1,
          text: t.replace(/^\s*\d+\.\s*/, ''),
        })) || [],
      rightItems:
        ac2?.rightItems?.map((t, idx) => ({
          id: idx + 1,
          text: t.replace(/^\s*\d+\.\s*/, ''),
        })) || [],
      mapping:
        ac2?.correctAnswer?.map((m, idx) => ({
          leftIndex: idx,
          rightId: ac2.rightItems.findIndex((x) => x === m.value) + 1,
        })) || [],
    });

    // ---- PART 3 ----
    setPart3Id(d.part3?.id);
    setPart3Name(d.part3?.name);

    const part3Q = d.part3?.questions?.[0];
    const ac3 = part3Q?.AnswerContent;

    setPart3({
      questionId: part3Q?.ID,
      instruction: ac3?.content || '',
      audioUrl: ac3?.audioKeys || '',
      leftItems:
        ac3?.leftItems?.map((t, idx) => ({
          id: idx + 1,
          text: t.replace(/^\s*\d+\.\s*/, ''),
        })) || [],
      rightItems:
        ac3?.rightItems?.map((t, idx) => ({
          id: idx + 1,
          text: t.replace(/^\s*\d+\.\s*/, ''),
        })) || [],
      mapping:
        ac3?.correctAnswer?.map((m, idx) => ({
          leftIndex: idx,
          rightId: ac3.rightItems.findIndex((x) => x === m.value) + 1,
        })) || [],
    });

    // ---- PART 4 ----
    setPart4Id(d.part4?.id);
    setPart4Name(d.part4?.name);

    const part4Groups = d.part4?.questions?.map((q, gIdx) => {
      const ac = q.AnswerContent?.groupContent?.listContent || [];

      return {
        id: gIdx + 1,
        questionId: q.ID, // ← thêm
        instruction: q.Content || '',
        audioUrl: q.AudioKeys || '',
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
  }, [detail]);

  // ===============================
  // AUDIO UPLOAD
  // ===============================
  const uploadAudio = async (file, onSuccess, onError, setUrl) => {
    try {
      if (file.type !== 'audio/mpeg') return message.error('Only MP3 allowed');

      const { data } = await axiosInstance.post('/presigned-url/upload-url', {
        fileName: file.name,
        type: 'audios',
      });

      await fetch(data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      setUrl(data.fileUrl);
      onSuccess({ url: data.fileUrl });
    } catch (err) {
      onError(err);
    }
  };

  const uploadProps = (setter) => ({
    accept: '.mp3',
    customRequest: ({ file, onSuccess, onError }) =>
      uploadAudio(file, onSuccess, onError, setter),
  });

  // ===============================
  // VALIDATION ICON
  // ===============================

  const validatePart1 = () => {
    if (!part1Name.trim()) return false;
    for (let q of part1) {
      if (!q.instruction.trim() || !q.audioUrl) return false;
      if (q.options.filter((o) => o.value.trim()).length < 2) return false;
      if (!q.correctId) return false;
    }
    return true;
  };

  const validateMatching = (p, name) =>
    name.trim() &&
    p.instruction.trim() &&
    p.audioUrl &&
    p.leftItems.length &&
    p.rightItems.length &&
    p.mapping.length;

  const validatePart4Group = (g) => {
    if (!g.instruction.trim() || !g.audioUrl) return false;
    for (let s of g.subQuestions) {
      if (!s.content.trim()) return false;
      if (!s.correctId) return false;
    }
    return true;
  };

  const validatePart4 = () =>
    part4Name.trim() && part4.every((g) => validatePart4Group(g));

  const valid1 = validatePart1();
  const valid2 = validateMatching(part2, part2Name);
  const valid3 = validateMatching(part3, part3Name);
  const valid4 = validatePart4();

  const handleSaveAll = () => {
    if (!valid1 || !valid2 || !valid3 || !valid4 || !sectionName.trim()) {
      message.error('Please complete all required fields before saving.');
      return;
    }
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

      part1, // trong này có questionId từng câu
      part2, // có questionId
      part3, // có questionId
      part4, // mỗi group có questionId

      sectionId, // nếu BE cần
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
                          label: generateLabel(s.options.length),
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
              label: generateLabel(nextIndex),
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
          label: generateLabel(index + 1),
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

  if (isFetching) return <p>Loading...</p>;

  return (
    <Form layout='vertical' style={{ paddingBottom: 40 }}>
      <Card title={<span>Section Information</span>} className='mb-6'>
        <Form.Item label='Section Name' required>
          <Input
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
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
              onChange={(e) => setPart1Name(e.target.value)}
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
                      onChange={(e) =>
                        setPart1((prev) =>
                          prev.map((x) =>
                            x.id === q.id
                              ? { ...x, instruction: e.target.value }
                              : x
                          )
                        )
                      }
                    />
                  </Form.Item>

                  <Upload
                    {...uploadProps((url) =>
                      setPart1((prev) =>
                        prev.map((x) =>
                          x.id === q.id ? { ...x, audioUrl: url } : x
                        )
                      )
                    )}
                  >
                    <Button icon={<AudioOutlined />}>Upload audio</Button>
                  </Upload>

                  {q.audioUrl && <audio src={q.audioUrl} controls />}

                  {q.options.map((o) => (
                    <div key={o.id} className='flex items-center gap-3 mb-2'>
                      <b className='w-6'>{o.label}</b>

                      <Input
                        className='flex-1'
                        value={o.value}
                        onChange={(e) =>
                          setPart1((prev) =>
                            prev.map((x) =>
                              x.id === q.id
                                ? {
                                    ...x,
                                    options: x.options.map((opt) =>
                                      opt.id === o.id
                                        ? { ...opt, value: e.target.value }
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
              onChange={(e) => setPart2Name(e.target.value)}
            />
          </Form.Item>

          <Form.Item label='Instruction' required>
            <TextArea
              rows={2}
              value={part2.instruction}
              onChange={(e) =>
                setPart2((prev) => ({ ...prev, instruction: e.target.value }))
              }
            />
          </Form.Item>

          <Upload
            {...uploadProps((url) =>
              setPart2((prev) => ({ ...prev, audioUrl: url }))
            )}
          >
            <Button icon={<AudioOutlined />} className='mb-6'>
              Upload audio
            </Button>
          </Upload>

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
              onChange={(e) => setPart3Name(e.target.value)}
            />
          </Form.Item>

          <Form.Item label='Instruction' required>
            <TextArea
              rows={2}
              value={part3.instruction}
              onChange={(e) =>
                setPart3((prev) => ({ ...prev, instruction: e.target.value }))
              }
            />
          </Form.Item>

          <Upload
            {...uploadProps((url) =>
              setPart3((prev) => ({ ...prev, audioUrl: url }))
            )}
          >
            <Button icon={<AudioOutlined />} className='!mb-6'>
              Upload audio
            </Button>
          </Upload>

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
              onChange={(e) => setPart4Name(e.target.value)}
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
                      updateGroupField(g.id, 'instruction', e.target.value)
                    }
                  />
                </Form.Item>

                {/* Audio upload */}
                <Upload
                  accept='.mp3'
                  {...uploadProps((url) =>
                    updateGroupField(g.id, 'audioUrl', url)
                  )}
                >
                  <Button icon={<AudioOutlined />} className='mb-6'>
                    Upload audio (MP3)
                  </Button>
                </Upload>

                {g.audioUrl && <audio src={g.audioUrl} controls />}

                {/* SUB QUESTIONS */}
                {g.subQuestions.map((s) => (
                  <div key={s.id} className='flex gap-4'>
                    <Card size='small' className='flex-1 mt-4'>
                      {/* Sub-question content */}
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

                      {/* Options */}
                      {s.options.map((o) => (
                        <div
                          key={o.id}
                          className='flex gap-2 mb-1 items-center'
                        >
                          <div>{o.label}</div>
                          <Input
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
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button
            type='primary'
            loading={isPending}
            className='bg-blue-900'
            onClick={handleSaveAll}
          >
            Update
          </Button>
        </div>
      </Space>
    </Form>
  );
};

export default UpdateListening;
