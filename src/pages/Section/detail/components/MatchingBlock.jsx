// MatchingBlock.jsx
import React from 'react';
import { Card, Collapse, Space, Typography } from 'antd';

const { Text, Title } = Typography;
const { Panel } = Collapse;
const letterLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const MatchingBlock = ({ title, part }) => {
  if (!part) return null;

  return (
    <Card title={title}>
      {part.PartName && <Title level={5}>{part.PartName}</Title>}

      <Space direction='vertical' size='middle' style={{ width: '100%' }}>
        {/* Instruction */}
        <Text strong>Instruction</Text>
        <Text>{part.Instruction}</Text>

        {/* Audio */}
        {part.AudioUrl && (
          <audio src={part.AudioUrl} controls style={{ marginTop: 8 }} />
        )}

        {/* LEFT ITEMS */}
        <Card size='small' title='Contents'>
          {part.LeftItems?.map((text, idx) => (
            <div key={idx}>
              <Text>
                <strong>{idx + 1}.</strong> {text}
              </Text>
            </div>
          ))}
        </Card>

        {/* RIGHT ITEMS */}
        <Card size='small' title='Options'>
          {part.RightItems?.map((text, idx) => (
            <div key={idx}>
              <Text>
                <strong>{letterLabels[idx]}.</strong> {text}
              </Text>
            </div>
          ))}
        </Card>

        {/* MAPPING */}
        <Card size='small' title='Correct Mapping'>
          {part.Mapping?.map((m, idx) => {
            const leftText = part.LeftItems[m.leftIndex];
            const rightText = part.RightItems[m.rightIndex];

            return (
              <div key={idx} style={{ marginBottom: 4 }}>
                <Text strong>
                  {m.leftIndex + 1} → {letterLabels[m.rightIndex]}
                  {' — '}
                </Text>
                <Text>{rightText}</Text>
              </div>
            );
          })}
        </Card>
      </Space>
    </Card>
  );
};

export default MatchingBlock;
