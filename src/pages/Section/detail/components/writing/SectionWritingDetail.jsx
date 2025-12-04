import React from 'react';
import { Card, Space, Tag, Typography } from 'antd';
import { useGetSectionDetail } from '@features/sections/hooks';

import WritingDetailBlock from './WritingDetailBlock';

const { Title } = Typography;

const SectionWritingDetail = ({ id }) => {
  const { data: detail } = useGetSectionDetail(id, 'WRITING');
  if (!detail) return <div>Loading...</div>;

  const { SectionName, part1, part2, part3, part4 } = detail;

  return (
    <Space direction='vertical' size='large' style={{ width: '100%' }}>
      <Card>
        <Title level={3}>{SectionName}</Title>
        <Tag color='purple'>WRITING</Tag>
      </Card>

      <WritingDetailBlock
        part1={part1}
        part2={part2}
        part3={part3}
        part4={part4}
      />
    </Space>
  );
};

export default SectionWritingDetail;
