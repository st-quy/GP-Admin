// GrammarVocabPart2.jsx
import React from 'react';
import { Card, Typography } from 'antd';

const { Text, Title } = Typography;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const GrammarVocabPart2 = ({ part, title }) => {
  if (!part) return null;

  return (
    <Card title={part.PartName}>
      {part.groups?.map((g, groupIndex) => {
        return (
          <Card
            key={g.GroupID}
            size='small'
            className='mb-5 border rounded'
            title={`Group ${groupIndex + 1}`}
          >
            {/* Instruction */}
            <div style={{ marginBottom: 10 }}>
              <Text strong>Instruction:</Text>
              <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>
                {g.content}
              </div>
            </div>

            {/* Left */}
            <Card size='small' title='Contents' className='mb-3'>
              {g.leftItems?.map((text, idx) => (
                <div key={idx}>
                  <Text>
                    <strong>{idx + 1}.</strong> {text}
                  </Text>
                </div>
              ))}
            </Card>

            {/* Right */}
            <Card size='small' title='Options' className='mb-3'>
              {g.rightItems?.map((text, idx) => (
                <div key={idx}>
                  <Text>
                    <strong>{LETTERS[idx]}.</strong> {text}
                  </Text>
                </div>
              ))}
            </Card>

            {/* Mapping */}
            <Card size='small' title='Correct Mapping'>
              {g.mapping?.map((m, idx) => {
                const rightIndex = g.rightItems.indexOf(m.right);
                const letter = LETTERS[rightIndex];

                return (
                  <div key={idx} style={{ marginBottom: 4 }}>
                    <Text strong>
                      {m.left} → {letter}. {m.right}
                    </Text>
                  </div>
                );
              })}
            </Card>
          </Card>
        );
      })}
    </Card>
  );
};

export default GrammarVocabPart2;
