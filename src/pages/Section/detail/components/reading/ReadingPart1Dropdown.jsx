// ReadingDetail/ReadingPart1Dropdown.jsx
import React from 'react';
import { Card, Typography } from 'antd';

const { Text, Title } = Typography;
const letterLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const ReadingPart1Dropdown = ({ part }) => {
  if (!part) return null;

  // Tạo map để tra correctAnswer theo key
  const correctMap = {};
  part.CorrectAnswers?.forEach((ca) => {
    correctMap[ca.key] = ca.value;
  });

  return (
    <Card title='PART 1 — Fill in the Blanks'>
      <Title level={5}>{part.PartName}</Title>

      {/* MAIN CONTENT */}
      <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{part.Content}</div>

      {/* BLANK LIST */}
      <Card size='small' title='Blanks' style={{ marginTop: 16 }}>
        {part.Blanks?.map((blank, idx) => (
          <div key={blank.key} style={{ marginBottom: 16 }}>
            <Text strong>Blank [{blank.key}]</Text>

            {/* OPTIONS */}
            <div style={{ marginTop: 6 }}>
              {blank.value.map((opt, i) => (
                <div key={i}>
                  <Text>
                    <strong>{letterLabels[i]}:</strong> {opt}
                  </Text>
                </div>
              ))}
            </div>

            {/* CORRECT ANSWER */}
            <Text strong style={{ color: 'green' }}>
              Correct: {correctMap[blank.key]}
            </Text>
          </div>
        ))}
      </Card>
    </Card>
  );
};

export default ReadingPart1Dropdown;
