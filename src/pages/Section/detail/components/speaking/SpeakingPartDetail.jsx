// SpeakingPartDetail.jsx
import React from 'react';
import { Card, Typography, Image } from 'antd';

const { Title, Text } = Typography;

const SpeakingPartDetail = ({ title, part }) => {
  if (!part) return null;

  return (
    <Card title={title} className='shadow-sm rounded-lg'>
      {/* Part Name */}
      <Title level={5} style={{ marginBottom: 16 }}>
        {part.PartName}
      </Title>

      {/* Image */}
      {part.image && (
        <div style={{ marginBottom: 20 }}>
          <Image
            src={part.image}
            alt='Speaking Visual'
            width='100%'
            style={{ borderRadius: 10 }}
            placeholder
          />
        </div>
      )}

      {/* Questions */}
      <Card size='small' title='Questions'>
        {part.questions?.map((q, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#1c2f6d',
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 600,
              }}
            >
              {idx + 1}
            </div>

            <Text style={{ fontSize: 15 }}>{q.value}</Text>
          </div>
        ))}
      </Card>
    </Card>
  );
};

export default SpeakingPartDetail;
