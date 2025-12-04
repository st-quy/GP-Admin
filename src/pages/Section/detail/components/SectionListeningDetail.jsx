// SectionListeningDetail.jsx
import React from 'react';
import { Card, Collapse, Space, Typography, Tag } from 'antd';
import MatchingBlock from './MatchingBlock';
import { useGetSectionDetail } from '@features/sections/hooks';

const { Panel } = Collapse;
const { Title, Text } = Typography;

const letterLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const SectionListeningDetail = ({ id }) => {
  const { data: detailData } = useGetSectionDetail(id, 'LISTENING');

  if (!detailData) return <div>No detailData</div>;

  const { SectionName, part1, part2, part3, part4 } = detailData;

  return (
    <Space direction='vertical' size='large' style={{ width: '100%' }}>
      {/* HEADER */}
      <Card>
        <Title level={3}>Section: {SectionName}</Title>
        <Tag color='blue'>LISTENING</Tag>
      </Card>

      {/* ==================== PART 1 ==================== */}
      <Card title='PART 1 — Multiple Choice (13 Questions)'>
        <Title level={5}>{part1?.PartName}</Title>

        <Collapse accordion>
          {part1?.questions?.map((q, idx) => (
            <Panel header={`Question ${idx + 1}`} key={idx}>
              <Space
                direction='vertical'
                size='small'
                style={{ width: '100%' }}
              >
                <Text strong>Instruction:</Text>
                <Text>{q.Content}</Text>

                {q.AudioUrl && (
                  <audio src={q.AudioUrl} controls style={{ marginTop: 10 }} />
                )}

                <Text strong>Options:</Text>
                {q.Options.map((opt, i) => (
                  <div key={i}>
                    <Text>
                      <strong>{letterLabels[i]}:</strong> {opt}
                    </Text>
                  </div>
                ))}

                <Text strong style={{ color: 'green' }}>
                  Correct: {q.CorrectAnswer}
                </Text>
              </Space>
            </Panel>
          ))}
        </Collapse>
      </Card>

      {/* ==================== PART 2 ==================== */}
      <MatchingBlock title='PART 2 — Matching' part={part2} />

      {/* ==================== PART 3 ==================== */}
      <MatchingBlock title='PART 3 — Matching' part={part3} />

      {/* ==================== PART 4 ==================== */}
      <Card title='PART 4 — Listening Question Groups'>
        {part4?.PartName && <Title level={5}>{part4.PartName}</Title>}

        <Collapse accordion>
          {part4?.groups?.map((g, idx) => (
            <Panel header={`Group ${idx + 1}`} key={idx}>
              <Space
                direction='vertical'
                size='middle'
                style={{ width: '100%' }}
              >
                <Text strong>Instruction</Text>
                <Text>{g.instruction}</Text>

                {g.audioUrl && <audio src={g.audioUrl} controls />}

                {/* SUB QUESTIONS */}
                {g.subQuestions?.map((s) => (
                  <Card key={s.id} size='small' style={{ marginTop: 10 }}>
                    <Text strong>Sub Question {s.id}</Text>
                    <div style={{ marginTop: 6 }}>{s.content}</div>

                    <div style={{ marginTop: 6 }}>
                      {s.options.map((o, index) => (
                        <div key={index}>
                          <Text>
                            <strong>{letterLabels[index]}:</strong> {o}
                          </Text>
                        </div>
                      ))}
                    </div>

                    <Text strong style={{ color: 'green' }}>
                      Correct: {s.correctAnswer}
                    </Text>
                  </Card>
                ))}
              </Space>
            </Panel>
          ))}
        </Collapse>
      </Card>
    </Space>
  );
};

export default SectionListeningDetail;
