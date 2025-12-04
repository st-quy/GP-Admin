// ReadingDetail/ReadingOrderingBlock.jsx
import React from 'react';
import { Card, Typography } from 'antd';

const { Text, Title } = Typography;

const ReadingOrderingBlock = ({ part, title }) => {
  if (!part) return null;

  return (
    <Card title={title}>
      <Title level={5}>{part.PartName}</Title>

      <Text strong>Instruction:</Text>
      <div style={{ marginTop: 6 }}>{part.Intro}</div>

      <Card size='small' title='Sentences' style={{ marginTop: 16 }}>
        {part.Items?.map((item, idx) => (
          <div key={idx} style={{ marginBottom: 8 }}>
            <Text>
              <strong>{idx + 1}.</strong> {item}
            </Text>
          </div>
        ))}
      </Card>
    </Card>
  );
};

export default ReadingOrderingBlock;
