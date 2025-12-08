// GrammarVocabPart1.jsx
import React from 'react';
import { Card, Typography } from 'antd';

const { Text, Title } = Typography;

const GrammarVocabPart1 = ({ part, title }) => {
  if (!part) return null;

  return (
    <Card title={part.PartName}>
      {part.questions?.map((q, idx) => (
        <Card
          key={q.QuestionID}
          size='small'
          className='mb-4 border rounded'
          title={`Question ${idx + 1}`}
        >
          <div style={{ marginBottom: 8, whiteSpace: 'pre-wrap' }}>
            <Text>{q.instruction}</Text>
          </div>

          <div className='pl-2'>
            {q.options.map((opt) => (
              <div key={opt.key}>
                <Text>
                  <strong>{opt.key}.</strong> {opt.value}
                </Text>
              </div>
            ))}
          </div>

          <div className='mt-2'>
            <Text strong>
              Correct Answer:{' '}
              <span style={{ color: 'green' }}>{q.correctAnswer}</span>
            </Text>
          </div>
        </Card>
      ))}
    </Card>
  );
};

export default GrammarVocabPart1;
