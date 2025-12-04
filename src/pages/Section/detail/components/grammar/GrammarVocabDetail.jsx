// GrammarVocabDetail.jsx
import React from 'react';
import { Card, Typography, Divider, Tag } from 'antd';

import GrammarVocabPart1 from './GrammarVocabPart1';
import GrammarVocabPart2 from './GrammarVocabPart2';
import { useGetSectionDetail } from '@features/sections/hooks';

const { Title } = Typography;

const GrammarVocabDetail = ({ id }) => {
  const { data: detail } = useGetSectionDetail(id, 'GRAMMAR AND VOCABULARY');

  if (!detail) return null;

  return (
    <div className='flex flex-col gap-6 pb-20'>
      <Card>
        <Title level={3}>{detail.SectionName}</Title>
        <Tag color='blue'>GRAMMAR AND VOCABULARY</Tag>
      </Card>

      {/* PART 1 */}
      {detail.part1 && (
        <GrammarVocabPart1
          part={detail.part1}
          title='PART 1 — Multiple Choice'
        />
      )}

      {/* PART 2 */}
      {detail.part2 && (
        <GrammarVocabPart2
          part={detail.part2}
          title='PART 2 — Matching Groups'
        />
      )}
    </div>
  );
};

export default GrammarVocabDetail;
