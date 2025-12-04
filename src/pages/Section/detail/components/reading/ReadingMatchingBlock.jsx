// ReadingDetail/ReadingMatchingBlock.jsx
import React from 'react';
import { Card, Typography } from 'antd';

const { Text, Title } = Typography;
const letterLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const ReadingMatchingBlock = ({ part, title }) => {
  if (!part) return null;

  return (
    <Card title={title}>
      <Title level={5}>{part.PartName}</Title>

      {/* Instruction */}
      <Text strong>Instruction:</Text>
      <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{part.Content}</div>

      {/* LEFT ITEMS */}
      <Card size='small' title='Contents' style={{ marginTop: 16 }}>
        {part.LeftItems?.map((text, idx) => (
          <div key={idx}>
            <Text>
              <strong>{idx + 1}.</strong> {text}
            </Text>
          </div>
        ))}
      </Card>

      {/* RIGHT ITEMS */}
      <Card size='small' title='Options' style={{ marginTop: 16 }}>
        {part.RightItems?.map((text, idx) => (
          <div key={idx}>
            <Text>
              <strong>{letterLabels[idx]}.</strong> {text}
            </Text>
          </div>
        ))}
      </Card>

      {/* CORRECT MAPPING */}
      <Card size='small' title='Correct Mapping' style={{ marginTop: 16 }}>
        {part.Mapping?.map((m, idx) => {
          // Tìm vị trí của rightValue trong RightItems
          const rightIndex = part.RightItems.indexOf(m.rightValue);
          const letter = rightIndex >= 0 ? letterLabels[rightIndex] : '?';

          return (
            <div key={idx} style={{ marginBottom: 6 }}>
              <Text strong>
                {m.leftIndex + 1} → {letter} ({m.rightValue})
              </Text>
            </div>
          );
        })}
      </Card>
    </Card>
  );
};

export default ReadingMatchingBlock;
