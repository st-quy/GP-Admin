// SectionSpeakingDetail.jsx
import React from 'react';
import { Card, Space, Tag, Typography } from 'antd';
import { useGetSectionDetail } from '@features/sections/hooks';
import SpeakingPartBlock from './SpeakingPartBlock';

const { Title } = Typography;

const SectionSpeakingDetail = ({ id }) => {
  const { data: detail } = useGetSectionDetail(id, 'SPEAKING');
  if (!detail) return <div>Loading...</div>;

  const { SectionName, part1, part2, part3, part4 } = detail;

  return (
    <Space direction='vertical' size='large' style={{ width: '100%' }}>
      <Card>
        <Title level={3}>{SectionName}</Title>
        <Tag color='blue'>SPEAKING</Tag>
      </Card>

      <SpeakingPartBlock part={part1} title='PART 1 — Short Q&A' />
      <SpeakingPartBlock part={part2} title='PART 2 — Describe the Picture' />
      <SpeakingPartBlock part={part3} title='PART 3 — Compare Pictures' />
      <SpeakingPartBlock part={part4} title='PART 4 — Opinion Questions' />
    </Space>
  );
};

export default SectionSpeakingDetail;
