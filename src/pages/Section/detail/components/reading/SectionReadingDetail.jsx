// SectionReadingDetail.jsx
import React from 'react';
import { Card, Space, Tag, Typography } from 'antd';

import { useGetSectionDetail } from '@features/sections/hooks';

import ReadingPart1Dropdown from './ReadingPart1Dropdown';
import ReadingOrderingBlock from './ReadingOrderingBlock';
import ReadingMatchingBlock from './ReadingMatchingBlock';
import ReadingMatchingFullBlock from './ReadingMatchingFullBlock';

const { Title } = Typography;

const SectionReadingDetail = ({ id }) => {
  // GỌI API ĐÚNG — skillName = 'READING'
  const { data: detail } = useGetSectionDetail(id, 'READING');

  if (!detail) return <div>Loading...</div>;

  const { SectionName, part1, part2A, part2B, part3, part4 } = detail;

  return (
    <Space direction='vertical' size='large' style={{ width: '100%' }}>
      {/* HEADER */}
      <Card>
        <Title level={3}>Section: {SectionName}</Title>
        <Tag color='green'>READING</Tag>
      </Card>

      {/* PART 1 — Fill-in-blank dropdown */}
      {part1 && <ReadingPart1Dropdown part={part1} />}

      {/* PART 2A — Ordering */}
      {part2A && (
        <ReadingOrderingBlock title='PART 2A — Ordering' part={part2A} />
      )}

      {/* PART 2B — Ordering */}
      {part2B && (
        <ReadingOrderingBlock title='PART 2B — Ordering' part={part2B} />
      )}

      {/* PART 3 — Dropdown Matching */}
      {part3 && <ReadingMatchingBlock title='PART 3 — Matching' part={part3} />}

      {/* PART 4 — Full Matching */}
      {part4 && (
        <ReadingMatchingFullBlock title='PART 4 — Full Matching' part={part4} />
      )}
    </Space>
  );
};

export default SectionReadingDetail;
