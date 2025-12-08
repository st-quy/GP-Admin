// WritingDetailBlock.jsx
import React from 'react';
import { Card, Space, Typography } from 'antd';

const { Title, Text } = Typography;

const WritingDetailBlock = ({ part1, part2, part3, part4 }) => {
  return (
    <Space direction='vertical'>
      {/* ============== PART 1 — Short Answers ============== */}
      {part1 && (
        <Card title='PART 1 — Short Answers'>
          <Title level={5}>{part1.PartName}</Title>

          <Card size='small' title='Questions' style={{ marginTop: 12 }}>
            {part1.Questions.map((q, idx) => (
              <div key={q.id} style={{ marginBottom: 10 }}>
                <Text>
                  <strong>{idx + 1}.</strong> {q.question}
                </Text>
              </div>
            ))}
          </Card>
        </Card>
      )}

      {/* ============== PART 2 — Form Filling ============== */}
      {part2 && (
        <Card title='PART 2 — Form Filling'>
          <Title level={5}>{part2.PartName}</Title>

          <Card size='small' style={{ marginTop: 12 }}>
            <Text>{part2.question}</Text>
            {part2.note && (
              <div style={{ marginTop: 6 }}>
                <Text type='secondary'>{part2.note}</Text>
              </div>
            )}
          </Card>
        </Card>
      )}

      {/* ============== PART 3 — Chat Room ============== */}
      {part3 && (
        <Card title='PART 3 — Chat Room'>
          <Title level={5}>{part3.PartName}</Title>

          <Card size='small' style={{ marginTop: 12 }}>
            {part3.chats.map((c, idx) => (
              <div key={c.id} style={{ marginBottom: 12 }}>
                <Text strong>{c.speaker}: </Text>
                <Text>{c.question}</Text>
                {c.note && (
                  <div style={{ marginTop: 4 }}>
                    <Text type='secondary'>{c.note}</Text>
                  </div>
                )}
              </div>
            ))}
          </Card>
        </Card>
      )}

      {/* ============== PART 4 — Email Writing ============== */}
      {part4 && (
        <Card title='PART 4 — Email Writing'>
          <Title level={5}>{part4.PartName}</Title>

          <Card
            size='small'
            title='Email Instruction'
            style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}
          >
            {part4.emailText}
          </Card>

          <Card size='small' title='Question 1' style={{ marginTop: 16 }}>
            <Text>{part4.q1}</Text>
            {part4.q1_note && (
              <div style={{ marginTop: 6 }}>
                <Text type='secondary'>{part4.q1_note}</Text>
              </div>
            )}
          </Card>

          <Card size='small' title='Question 2' style={{ marginTop: 16 }}>
            <Text>{part4.q2}</Text>
            {part4.q2_note && (
              <div style={{ marginTop: 6 }}>
                <Text type='secondary'>{part4.q2_note}</Text>
              </div>
            )}
          </Card>
        </Card>
      )}
    </Space>
  );
};

export default WritingDetailBlock;
