// CreateListening.jsx
import React, { useState } from 'react';
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
import { DeleteOutlined, PlusOutlined, AudioOutlined } from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';
import { useCreateQuestion } from '@features/questions/hooks';

import ListeningMatchingEditor from './Listening/ListeningMatchingEditor';
import axiosInstance from '@shared/config/axios';
import { buildListeningPayload } from '@pages/QuestionBank/schemas/createQuestionSchema';

const { TextArea } = Input;
const { Panel } = Collapse;

const CreateListening = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { mutate: createQuestion, isPending } = useCreateQuestion();

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
  // UPLOAD AUDIO (only accept mp3)
  // =====================================
  const uploadAudio = async (file, onSuccess, onError, setUrl) => {
    if (file.type !== 'audio/mpeg') {
      message.error('Only MP3 files are allowed!');
      onError('Invalid file type');
      return;
    }

    try {
      const { data } = await axiosInstance.post('/presigned-url/upload-url', {
        fileName: file.name,
        type: 'audios',
      });

      const res = await fetch(data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!res.ok) throw new Error('Upload failed');

      setUrl(data.fileUrl);
      onSuccess({ url: data.fileUrl });
      message.success('Uploaded!');
    } catch (err) {
      console.error(err);
      onError(err);
      message.error('Upload failed');
    }
  };

  const uploadProps = (setter) => ({
    accept: '.mp3',
    maxCount: 1,
    customRequest: ({ file, onSuccess, onError }) =>
      uploadAudio(file, onSuccess, onError, setter),
  });

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

  // =====================================
  // SAVE ALL
  // =====================================
  const handleSaveAll = async () => {
    if (!valid1 || !valid2 || !valid3 || !valid4) {
      return message.error('Please complete all parts before saving!');
    }

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

    const payload = buildListeningPayload(values);

    createQuestion(payload, {
      onSuccess: () => {
        message.success('Created Listening successfully!');
        navigate(-1);
      },
      onError: () => message.error('Failed to create listening'),
    });
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

        // remove option
        const filtered = q.options.filter((o) => o.id !== optId);

        // reassign ids + labels
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
                label: generateLabel(nextIndex),
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
            label: generateLabel(index + 1),
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

  // =====================================
  // RENDER
  // =====================================
  return (
    <Form layout='vertical' form={form}>
      <Card title='Section Information'>
        <Form.Item
          label='Section Name'
          name='sectionName'
          rules={[{ required: true, message: 'Section name is required' }]}
        >
          <Input
            placeholder='e.g., Fitness Club Listening Test'
            onChange={(e) => setSectionName(e.target.value)}
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
                <Form.Item label='Instruction' required>
                  <TextArea
                    rows={2}
                    value={q.instruction}
                    onChange={(e) =>
                      updatePart1Field(q.id, 'instruction', e.target.value)
                    }
                  />
                </Form.Item>

                <Upload
                  accept='.mp3'
                  {...uploadProps((url) =>
                    updatePart1Field(q.id, 'audioUrl', url)
                  )}
                >
                  <Button icon={<AudioOutlined />} className='mb-6'>
                    Upload audio (MP3)
                  </Button>
                </Upload>

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
                      className={`cursor-pointer text-red-500 ${
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
              onChange={(e) => setPart2Name(e.target.value)}
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

          <Upload
            accept='.mp3'
            {...uploadProps((url) => setPart2({ ...part2, audioUrl: url }))}
          >
            <Button icon={<AudioOutlined />}>Upload audio (MP3)</Button>
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
              placeholder='Enter Part 3 name...'
              value={part3Name}
              onChange={(e) => setPart3Name(e.target.value)}
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

          <Upload
            accept='.mp3'
            {...uploadProps((url) => setPart3({ ...part3, audioUrl: url }))}
          >
            <Button icon={<AudioOutlined />}>Upload audio (MP3)</Button>
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
                <Form.Item label='Instruction' required>
                  <TextArea
                    rows={2}
                    value={g.instruction}
                    onChange={(e) =>
                      updateGroupField(g.id, 'instruction', e.target.value)
                    }
                  />
                </Form.Item>

                <Upload
                  accept='.mp3'
                  {...uploadProps((url) =>
                    updateGroupField(g.id, 'audioUrl', url)
                  )}
                >
                  <Button icon={<AudioOutlined />}>Upload audio (MP3)</Button>
                </Upload>

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
                            className={`cursor-pointer text-red-500 ${
                              s.options.length <= 3
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
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button
            type='primary'
            onClick={handleSaveAll}
            loading={isPending}
            className='bg-blue-900'
          >
            Save
          </Button>
        </div>
      </Space>
    </Form>
  );
};

export default CreateListening;
