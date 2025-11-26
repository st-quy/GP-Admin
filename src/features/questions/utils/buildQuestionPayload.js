export const buildDropdownPayload = ({
  partId,
  dropdownContent,
  dropdownBlanks,
  audioUrl,
  imageUrl,
}) => {
  const content = (dropdownContent?.content || '').trim();

  // Chuẩn hoá options & correctAnswer đúng format BE
  const options = dropdownBlanks.map((blank) => ({
    key: String(blank.key),
    value: (blank.options || []).map((o) => o.value),
  }));

  const correctAnswer = dropdownBlanks.map((blank) => {
    const correctOpt = (blank.options || []).find(
      (o) => o.id === blank.correctAnswer
    );
    return {
      key: String(blank.key),
      value: correctOpt ? correctOpt.value : null,
    };
  });

  return {
    PartID: partId,
    SkillName: 'READING',
    PartType: 'dropdown-list',
    Description: content,
    questions: [
      {
        Type: 'dropdown-list',
        AudioKeys: audioUrl ? [audioUrl] : null,
        ImageKeys: imageUrl ? [imageUrl] : [],
        Content: content,
        Sequence: 1,
        GroupContent: null,
        SubContent: null,
        AnswerContent: {
          content,
          options, // [{ key: '0', value: ['opt1','opt2'] }, ...]
          correctAnswer, // [{ key: '0', value: 'opt1' }, ...]
          partID: partId,
          type: 'dropdown-list',
        },
      },
    ],
  };
};

export const buildOrderingPayload = ({
  partId,
  intro,
  items,
  audioUrl,
  imageUrl,
}) => {
  const content = (intro || '').trim();

  // Loại bỏ câu trống, giữ đúng thứ tự hiện tại (thứ tự ĐÚNG)
  const normalizedItems = (items || [])
    .map((it) => ({
      ...it,
      text: (it.text || '').trim(),
    }))
    .filter((it) => it.text.length > 0);

  // options = danh sách câu cần sắp xếp (đúng thứ tự)
  const options = normalizedItems.map((it) => it.text);

  // correctAnswer = [{ key: text, value: vị trí đúng 1..n }]
  const correctAnswer = normalizedItems.map((it, index) => ({
    key: it.text,
    value: index + 1,
  }));

  return {
    PartID: partId,
    SkillName: 'READING',
    PartType: 'ordering',
    Description: content,
    questions: [
      {
        Type: 'ordering',
        AudioKeys: audioUrl ? [audioUrl] : null,
        ImageKeys: imageUrl ? [imageUrl] : [],
        Content: content,
        Sequence: 1,
        GroupContent: null,
        SubContent: null,

        // để BE fallback (buildReadingAnswerContent) vẫn có dữ liệu nếu cần
        options, // ["...", "...", ...]
        correctAnswer, // [{ key, value }, ...]

        // AnswerContent chuẩn theo mẫu anh đưa
        AnswerContent: {
          content,
          options,
          correctAnswer,
          partID: partId,
          type: 'ordering',
        },
      },
    ],
  };
};

export const buildMatchingPayload = ({
  partId,
  instruction,
  leftItems,
  rightItems,
  mapping, // mảng { leftIndex, rightId }
  audioUrl,
  imageUrl,
}) => {
  const content = (instruction || '').trim();

  // Chuẩn hoá dữ liệu, loại bỏ item trống
  const normalizedLeft = (leftItems || [])
    .map((it) => ({ ...it, text: (it.text || '').trim() }))
    .filter((it) => it.text.length > 0);

  const normalizedRight = (rightItems || [])
    .map((it) => ({ ...it, text: (it.text || '').trim() }))
    .filter((it) => it.text.length > 0);

  const leftTexts = normalizedLeft.map((it) => it.text);
  const rightTexts = normalizedRight.map((it) => it.text);

  // Build correctAnswer: [{ left: 'Paragraph 1', right: 'The economy during the Golden Age' }, ...]
  const correctAnswer = normalizedLeft
    .map((leftItem, leftIndex) => {
      const mapRow = (mapping || []).find((m) => m.leftIndex === leftIndex);
      if (!mapRow || !mapRow.rightId) return null;

      const rightItem = normalizedRight.find((r) => r.id === mapRow.rightId);
      if (!rightItem || !rightItem.text.trim()) return null;

      return {
        left: leftItem.text,
        right: rightItem.text,
      };
    })
    .filter(Boolean); // bỏ các mapping chưa chọn

  return {
    PartID: partId,
    SkillName: 'READING',
    PartType: 'matching',
    Description: content,
    questions: [
      {
        Type: 'matching',
        AudioKeys: audioUrl ? [audioUrl] : null,
        ImageKeys: imageUrl ? [imageUrl] : [],
        Content: content,
        Sequence: 1,
        GroupContent: null,
        SubContent: null,

        // Để BE fallback buildReadingAnswerContent vẫn có data nếu cần
        leftItems: leftTexts,
        rightItems: rightTexts,
        correctAnswer,

        // AnswerContent giống hệt mẫu anh gửi
        AnswerContent: {
          content,
          leftItems: leftTexts,
          rightItems: rightTexts,
          correctAnswer,
          partID: partId,
          type: 'matching',
        },
      },
    ],
  };
};

export const buildGrammarMatchingPayload = ({
  partId,
  instruction, // string: "Select a word from the list..."
  leftItems, // [{ id, text }]
  rightItems, // [{ id, text }]
  mapping, // [{ leftIndex, rightId }]
  audioUrl,
  imageUrl,
}) => {
  const content = (instruction || '').trim();

  const normalizedLeft = (leftItems || [])
    .map((it) => ({ ...it, text: (it.text || '').trim() }))
    .filter((it) => it.text.length > 0);

  const normalizedRight = (rightItems || [])
    .map((it) => ({ ...it, text: (it.text || '').trim() }))
    .filter((it) => it.text.length > 0);

  const leftTexts = normalizedLeft.map((it) => it.text);
  const rightTexts = normalizedRight.map((it) => it.text);

  const correctAnswer = normalizedLeft
    .map((leftItem, leftIndex) => {
      const mapRow = (mapping || []).find((m) => m.leftIndex === leftIndex);
      if (!mapRow || !mapRow.rightId) return null;

      const rightItem = normalizedRight.find((r) => r.id === mapRow.rightId);
      if (!rightItem || !rightItem.text.trim()) return null;

      return {
        left: leftItem.text,
        right: rightItem.text,
      };
    })
    .filter(Boolean);

  return {
    PartID: partId,
    SkillName: 'GRAMMAR & VOCABULARY',
    PartType: 'matching',
    Description: content,
    questions: [
      {
        Type: 'matching',
        AudioKeys: audioUrl ? [audioUrl] : null,
        ImageKeys: imageUrl ? [imageUrl] : [],
        Content: content,
        Sequence: 1,
        GroupContent: null,
        SubContent: null,

        // cho BE nếu có builder riêng
        leftItems: leftTexts,
        rightItems: rightTexts,
        correctAnswer,

        // AnswerContent ĐÚNG FORMAT mẫu anh gửi
        AnswerContent: {
          content,
          leftItems: leftTexts,
          rightItems: rightTexts,
          correctAnswer,
        },
      },
    ],
  };
};

export const buildGrammarMultipleChoicePayload = ({
  partId,
  questionText, // "I will wait for you ____ you finish your work."
  options, // [{ id, label: 'A', value: 'until', isCorrect: true }, ...]
  audioUrl,
  imageUrl,
}) => {
  const title = (questionText || '').trim();

  const normalizedOptions = (options || [])
    .map((opt, idx) => ({
      key: opt.label || ['A', 'B', 'C', 'D', 'E'][idx] || `Option${idx + 1}`,
      value: (opt.value || '').trim(),
      isCorrect: !!opt.isCorrect,
    }))
    .filter((opt) => opt.value.length > 0);

  const correct = normalizedOptions.find((o) => o.isCorrect);
  const correctAnswer = correct ? correct.value : '';

  return {
    PartID: partId,
    SkillName: 'GRAMMAR & VOCABULARY',
    PartType: 'multiple-choice',
    Description: title,
    questions: [
      {
        Type: 'multiple-choice',
        AudioKeys: audioUrl ? [audioUrl] : null,
        ImageKeys: imageUrl ? [imageUrl] : [],
        Content: title,
        Sequence: 1,
        GroupContent: null,
        SubContent: null,

        // có thể dùng cho BE builder
        options: normalizedOptions,
        correctAnswer,

        // AnswerContent ĐÚNG FORMAT mẫu
        AnswerContent: {
          title,
          options: normalizedOptions.map(({ key, value }) => ({
            key,
            value,
          })),
          correctAnswer,
        },
      },
    ],
  };
};

// Writing
// buildWritingPayload.js

export const buildPayloadPart1 = ({ title, questions, partId }) => {
  return {
    PartID: partId,
    SkillName: 'WRITING',
    PartType: 'part1-short-answers',
    Description: title,
    questions: questions.map((q, idx) => ({
      Type: 'writing',
      PartID: partId,
      Sequence: idx + 1,
      Content: q.question,
      WordLimit: q.wordLimit || null,
      AnswerContent: null,
    })),
  };
};

export const buildPayloadPart2 = ({
  title,
  question,
  fields,
  wordLimit,
  partId,
}) => ({
  PartID: partId,
  SkillName: 'WRITING',
  PartType: 'part2-form-filling',
  Description: title,
  questions: [
    {
      Type: 'writing',
      PartID: partId,
      Sequence: 1,
      Content: question,
      WordLimit: wordLimit || null,
      AnswerContent: {
        fields,
      },
    },
  ],
});

export const buildPayloadPart3 = ({ title, chats, partId }) => ({
  PartID: partId,
  SkillName: 'WRITING',
  PartType: 'part3-chat-room',
  Description: title,
  questions: chats.map((c, idx) => ({
    Type: 'writing',
    PartID: partId,
    Sequence: idx + 1,
    Content: c.question,
    Speaker: c.speaker,
    WordLimit: c.wordLimit || null,
    AnswerContent: null,
  })),
});

export const buildPayloadPart4 = ({
  emailText,
  q1,
  q1_wordLimit,
  q2,
  q2_wordLimit,
  partId,
}) => ({
  PartID: partId,
  SkillName: 'WRITING',
  PartType: 'part4-email-writing',
  Description: emailText,
  questions: [
    {
      Type: 'writing',
      PartID: partId,
      Sequence: 1,
      Content: q1,
      WordLimit: q1_wordLimit || null,
      GroupContent: emailText,
    },
    {
      Type: 'writing',
      PartID: partId,
      Sequence: 2,
      Content: q2,
      WordLimit: q2_wordLimit || null,
      GroupContent: emailText,
    },
  ],
});
