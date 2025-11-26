// GrammarMultipleChoicePreview.jsx
import React from 'react';

const GrammarMultipleChoicePreview = ({
  questionText,
  options = [],
  correctOptionId,
}) => {
  if (!options.length && !questionText) {
    return (
      <div className='text-gray-400 italic'>
        Preview will appear here after you enter question & options.
      </div>
    );
  }

  return (
    <div className='bg-gray p-6 rounded-lg border border-gray-200 shadow-sm'>
      {/* Question text */}
      <p className='text-base font-medium text-gray-900 mb-4'>
        {questionText || 'Question text preview...'}
      </p>

      {/* Options list */}
      <div className='flex flex-col gap-2'>
        {options.map((opt) => {
          const isCorrect = opt.id === correctOptionId;

          return (
            <div
              key={opt.id}
              className={`w-full flex items-stretch rounded-lg border overflow-hidden transition-shadow duration-150 ease-out ${
                isCorrect
                  ? 'bg-blue-50 border-blue-200 shadow-sm'
                  : 'bg-white border-gray-200 hover:shadow-sm'
              }`}
            >
              {/* Letter block */}
              <div
                className={`w-16 flex items-center justify-center text-sm font-semibold ${
                  isCorrect
                    ? 'bg-blue-900 text-white'
                    : 'bg-white text-gray-900'
                }`}
              >
                {opt.label}
              </div>

              {/* Option text */}
              <div className='flex-1 px-4 py-3 text-sm text-gray-900'>
                {opt.value ? (
                  opt.value
                ) : (
                  <span className='text-gray-400 italic'>Option text...</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GrammarMultipleChoicePreview;
