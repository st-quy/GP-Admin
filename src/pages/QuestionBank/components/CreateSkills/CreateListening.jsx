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
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

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
    Array.from({ length: 1 }, (_, i) => ({
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

  // =====================================
  // UPLOAD AUDIO
  // =====================================
  const uploadAudio = async (file, onSuccess, onError, setUrl) => {
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
    maxCount: 1,
    customRequest: ({ file, onSuccess, onError }) =>
      uploadAudio(file, onSuccess, onError, setter),
  });

  // =====================================
  // VALIDATION ICONS
  // =====================================
  const renderHeader = (title, valid) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <span>{title}</span>
      {valid ? (
        <span style={{ color: 'green', fontSize: 18 }}>✔</span>
      ) : (
        <span style={{ color: 'red', fontSize: 18 }}>✖</span>
      )}
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

    // LEFT must have at least 1 non-empty text
    if (!p.leftItems.length) return false;
    if (p.leftItems.some((i) => !i.text || !i.text.trim())) return false;

    // RIGHT must have at least 1 non-empty text
    if (!p.rightItems.length) return false;
    if (p.rightItems.some((i) => !i.text || !i.text.trim())) return false;

    // MAPPING must map valid leftIndex → valid rightId
    if (!p.mapping.length) return false;

    for (let m of p.mapping) {
      const left = p.leftItems[m.leftIndex];
      const right = p.rightItems.find((r) => r.id === m.rightId);

      if (!left || !left.text.trim()) return false;
      if (!right || !right.text.trim()) return false;
    }

    return true;
  };

  const validatePart4 = () => {
    if (!part4Name.trim()) return false;

    for (let g of part4) {
      if (!g.instruction.trim() || !g.audioUrl) return false;

      for (let s of g.subQuestions) {
        if (!s.content.trim()) return false;

        const opts = s.options.filter((o) => o.value.trim());
        if (opts.length < 2) return false;

        const correct = s.options.find((o) => o.id === s.correctId);
        if (!correct || !correct.value.trim()) return false;
      }
    }
    return true;
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
            placeholder='e.g., Fitness Club Writing Test'
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
              <Panel key={q.id} header={`Question ${q.id}`}>
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
                  {...uploadProps((url) =>
                    updatePart1Field(q.id, 'audioUrl', url)
                  )}
                >
                  <Button icon={<AudioOutlined />}>Upload audio</Button>
                </Upload>

                {q.audioUrl && (
                  <audio src={q.audioUrl} controls style={{ marginTop: 10 }} />
                )}

                <div style={{ marginTop: 10 }}>
                  {q.options.map((o) => (
                    <div
                      key={o.id}
                      style={{
                        display: 'flex',
                        gap: 10,
                        marginBottom: 4,
                      }}
                    >
                      <div>{o.label}</div>
                      <Input
                        value={o.value}
                        onChange={(e) =>
                          updatePart1Option(q.id, o.id, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>

                <Form.Item label='Correct Answer' required>
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
            {...uploadProps((url) => setPart2({ ...part2, audioUrl: url }))}
          >
            <Button icon={<AudioOutlined />}>Upload audio</Button>
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
            {...uploadProps((url) => setPart3({ ...part3, audioUrl: url }))}
          >
            <Button icon={<AudioOutlined />}>Upload audio</Button>
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
              <Panel key={g.id} header={`Group ${g.id}`}>
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
                  {...uploadProps((url) =>
                    updateGroupField(g.id, 'audioUrl', url)
                  )}
                >
                  <Button icon={<AudioOutlined />}>Upload audio</Button>
                </Upload>

                {g.audioUrl && <audio src={g.audioUrl} controls />}

                {g.subQuestions.map((s) => (
                  <Card key={s.id} size='small' style={{ marginTop: 15 }}>
                    <Form.Item label={`Sub question ${s.id}`} required>
                      <Input
                        value={s.content}
                        onChange={(e) =>
                          updateGroupSub(g.id, s.id, 'content', e.target.value)
                        }
                      />
                    </Form.Item>

                    {s.options.map((o) => (
                      <div
                        key={o.id}
                        style={{
                          display: 'flex',
                          gap: 10,
                          marginBottom: 4,
                        }}
                      >
                        <div>{o.label}</div>
                        <Input
                          value={o.value}
                          onChange={(e) =>
                            updateGroupOption(g.id, s.id, o.id, e.target.value)
                          }
                        />
                      </div>
                    ))}

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
        <div style={{ textAlign: 'right', marginBottom: 60 }}>
          <Button
            type='primary'
            size='large'
            onClick={handleSaveAll}
            loading={isPending}
            className='bg-blue-900'
          >
            SAVE ALL
          </Button>
        </div>
      </Space>
    </Form>
  );
};

export default CreateListening;
