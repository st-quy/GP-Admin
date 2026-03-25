// WritingPreview.jsx
import React from 'react';
import { WRITING_PART_TYPES } from '@features/questions/constant/writingType';
import { Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';

const Label = ({ children }) => (
  <span className='text-sm font-semibold text-gray-600'>{children}</span>
);

const Muted = ({ children }) => (
  <span className='text-xs text-gray-500 italic'>{children}</span>
);

const WritingPreview = ({ partType, data }) => {
  if (!data) {
    return (
      <div className='text-gray-400 italic'>
        Preview will appear here when you enter content.
      </div>
    );
  }

  /* ---------- PART 1 — Short Answers ---------- */
  if (partType === WRITING_PART_TYPES.PART1_SHORT_ANSWERS) {
    const { title, questions = [] } = data;

    return (
      <div className='space-y-4'>
        <p className='font-medium text-gray-900 whitespace-pre-wrap'>
          {title || 'Instruction preview...'}
        </p>

        <ol className='space-y-3'>
          {questions.map((q, idx) => (
            <div key={idx} className=''>
              <p className='text-gray-900 whitespace-pre-wrap'>
                {q?.question || (
                  <span className='text-gray-400'>Question text...</span>
                )}
              </p>
              <Input placeholder='Enter your answer here' />
            </div>
          ))}
        </ol>
      </div>
    );
  }

  /* ---------- PART 2 — Form Filling ---------- */
  if (partType === WRITING_PART_TYPES.PART2_FORM_FILLING) {
    const { title, question, wordLimit, fields = [] } = data;

    return (
      <div className='space-y-4'>
        <p className='font-medium text-gray-900 whitespace-pre-wrap'>
          {title || 'Form introduction preview...'}
        </p>

        <p className='text-gray-900 whitespace-pre-wrap'>
          {question || (
            <span className='text-gray-400 italic'>
              Instruction text preview...
            </span>
          )}
        </p>
        <TextArea
          showCount
          maxLength={wordLimit}
          placeholder='Enter your answer here'
        />

        <div className='mt-4 space-y-3'>
          {fields.map((f, idx) => (
            <div key={idx} className='border rounded-md p-3 bg-gray-50'>
              <Label>Field {idx + 1}</Label>
              <p className='text-gray-900 whitespace-pre-wrap mt-1'>
                {f || (
                  <span className='text-gray-400 italic'>
                    Field description...
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- PART 3 — Chat Room ---------- */
  if (partType === WRITING_PART_TYPES.PART3_CHAT_ROOM) {
    const { title, chats = [] } = data;

    return (
      <div className='space-y-4'>
        <p className='font-medium text-gray-900 whitespace-pre-wrap'>
          {title || 'Chat room introduction preview...'}
        </p>

        <div className='space-y-3'>
          {chats.map((c, idx) => (
            <div
              key={idx}
              className='border border-gray-200 rounded-lg p-3 bg-gray-50'
            >
              <p className='mb-1'>
                <span className='font-semibold text-blue-900'>
                  {c?.speaker || 'Speaker'}:
                </span>{' '}
                <span className='text-gray-900 whitespace-pre-wrap'>
                  {c?.question || (
                    <span className='text-gray-400 italic'>
                      Question text...
                    </span>
                  )}
                </span>
              </p>
              <TextArea
                showCount
                maxLength={c?.wordLimit}
                placeholder='Enter your answer here'
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- PART 4 — Email Writing ---------- */
  if (partType === WRITING_PART_TYPES.PART4_EMAIL_WRITING) {
    const { emailText, q1, q1_wordLimit, q2, q2_wordLimit } = data;

    return (
      <div className='space-y-5'>
        <div className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
          <p className='text-gray-900 whitespace-pre-wrap mt-2'>
            {emailText || (
              <span className='text-gray-400'>Instruction text preview...</span>
            )}
          </p>
        </div>

        <div className='space-y-4'>
          <div>
            <p className='text-gray-900 whitespace-pre-wrap mt-1'>
              {q1 || <span className='text-gray-400'>Question 1 ...</span>}
            </p>
            <TextArea
              showCount
              maxLength={q1_wordLimit}
              placeholder='Enter your answer here'
            />
            {/* {q1_wordLimit && (
              <Muted>Write about {q1_wordLimit} words. (Recommended)</Muted>
            )} */}
          </div>

          <div>
            <p className='text-gray-900 whitespace-pre-wrap mt-1'>
              {q2 || <span className='text-gray-400'>Question 2 ...</span>}
            </p>
            <TextArea
              showCount
              maxLength={q2_wordLimit}
              placeholder='Enter your answer here'
            />
            {/* {q2_wordLimit && (
              <Muted>Write about {q2_wordLimit} words. (Recommended)</Muted>
            )} */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='text-gray-400 italic'>
      Please select a writing part type.
    </div>
  );
};

export default WritingPreview;
