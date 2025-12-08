// SpeakingPartBlock.jsx
import React from 'react';
import { Card, Typography, Image } from 'antd';

const { Text, Title } = Typography;

const SpeakingPartBlock = ({ part, title }) => {
  if (!part) return null;

  return (
    <Card>
      <Title level={5}>
        {part.PartName}
        {part.SubContent ? ` — ${part.SubContent}` : ''}
      </Title>

      {part.Image && (
        <div style={{ margin: '12px 0' }}>
          <Image
            src={part.Image}
            width={300}
            style={{ borderRadius: 8 }}
            alt='speaking-img'
          />
        </div>
      )}

      <Card size='small' title='Questions'>
        {part.Questions.map((q, idx) => (
          <div key={idx} style={{ marginBottom: 10 }}>
            <Text>
              <strong>{idx + 1}.</strong> {q}
            </Text>
          </div>
        ))}
      </Card>
    </Card>
  );
};

export default SpeakingPartBlock;
