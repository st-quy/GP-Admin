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
function buildDropdownContent(rawContent, blanks) {
  let result = rawContent;

  blanks.forEach((b) => {
    const key = b.key;

    // format: (finds / sdsdsdsd)
    const optionsText = b.options.map((o) => o.value).join(' / ');

    // final replace: [0] -> 0. (finds / sdsdsdsd)
    const replaceText = `${key}. (${optionsText})`;

    // replace [0] with new text
    result = result.replace(`[${key}]`, replaceText);
  });

  return result;
}

export const buildFullReadingPayload = (values) => {
  const result = {
    SkillName: 'READING',
    SectionName: values.sectionName,
    parts: [],
  };

  /* ======================================================
        PART 1 — DROPDOWN
  ====================================================== */
  const p1 = values.part1;

  const finalContent = buildDropdownContent(p1.content, p1.blanks);

  const p1Options = p1.blanks.map((b) => ({
    key: b.key,
    value: b.options.map((o) => o.value),
  }));

  const p1Correct = p1.blanks.map((b) => ({
    key: b.key,
    value: b.options.find((o) => o.id === b.correctAnswer)?.value || '',
  }));

  result.parts.push({
    PartID: p1.id || null,
    PartName: p1.name,
    Type: 'dropdown-list',
    Sequence: 1,
    Content: finalContent,
    AnswerContent: {
      type: 'dropdown-list',
      content: finalContent,
      options: p1Options,
      correctAnswer: p1Correct,
    },
  });

  /* ======================================================
        PART 2A — ORDERING
  ====================================================== */
  const p2a = values.part2A;

  const p2aOptions = p2a.items.map((i) => i.text.trim());

  const p2aCorrect = p2a.items.map((i, index) => ({
    key: i.text.trim(),
    value: index + 1,
  }));

  result.parts.push({
    PartID: p2a.id || null,
    PartName: p2a.name,
    Type: 'ordering',
    Sequence: 2,
    Content: p2a.intro.trim(),
    AnswerContent: {
      type: 'ordering',
      content: p2a.intro.trim(),
      options: p2aOptions,
      correctAnswer: p2aCorrect,
    },
  });

  /* ======================================================
        PART 2B — ORDERING
  ====================================================== */
  const p2b = values.part2B;

  const p2bOptions = p2b.items.map((i) => i.text.trim());

  const p2bCorrect = p2b.items.map((i, index) => ({
    key: i.text.trim(),
    value: index + 1,
  }));

  result.parts.push({
    PartID: p2b.id || null,
    PartName: p2b.name,
    Type: 'ordering',
    Sequence: 3,
    Content: p2b.intro.trim(),
    AnswerContent: {
      type: 'ordering',
      content: p2b.intro.trim(),
      options: p2bOptions,
      correctAnswer: p2bCorrect,
    },
  });

  /* ======================================================
        PART 3 — MATCHING (dropdown matching)
  ====================================================== */
  const p3 = values.part3;

  const p3Left = p3.leftItems.map((i) => i.text.trim()); // giữ nguyên
  const p3Right = p3.rightItems.map((i) => i.text.trim());

  const p3Correct = p3.mapping.map((m) => ({
    key: String(m.leftIndex + 1),
    value: p3.rightItems.find((r) => r.id === m.rightId)?.text.trim() || '',
  }));

  result.parts.push({
    PartID: p3.id || null,
    PartName: p3.name,
    Type: 'dropdown-list',
    Sequence: 4,
    Content: p3.content.trim(),
    AnswerContent: {
      type: 'dropdown-list',
      content: p3.content.trim(),
      leftItems: p3Left,
      rightItems: p3Right,
      correctAnswer: p3Correct,
    },
  });

  /* ======================================================
        PART 4 — FULL MATCHING
  ====================================================== */
  const p4 = values.part4;

  const p4Left = p4.leftItems.map((i) => i.text.trim());
  const p4Right = p4.rightItems.map((i) => i.text.trim());

  const p4Correct = p4.mapping.map((m) => ({
    left: p4.leftItems[m.leftIndex]?.text.trim() || '',
    right: p4.rightItems.find((r) => r.id === m.rightId)?.text.trim() || '',
  }));

  result.parts.push({
    PartID: p4.id || null,
    PartName: p4.name,
    Type: 'matching',
    Sequence: 5,
    Content: p4.content.trim(),
    AnswerContent: {
      type: 'matching',
      content: p4.content.trim(),
      leftItems: p4Left,
      rightItems: p4Right,
      correctAnswer: p4Correct,
    },
  });

  return result;
};

export function buildWritingFullPayload(values) {
  if (!values) return null;

  return {
    SkillName: 'WRITING',
    SectionName: values.sectionName?.trim() || 'Untitled Writing Section',
    parts: {
      part1: {
        PartID: values.part1?.PartID || null,
        name: values.part1?.title?.trim() || '',
        questions:
          values.part1?.questions?.map((q) => ({
            question: q.question?.trim() || '',
          })) || [],
      },

      part2: {
        PartID: values.part2?.PartID || null,
        name: values.part2?.title?.trim() || '',
        question: values.part2?.question?.trim() || '',
        wordLimit: values.part2?.wordLimit || null,
        fields: values.part2?.fields || [],
      },

      part3: {
        PartID: values.part3?.PartID || null,
        name: values.part3?.title?.trim() || '',
        chats:
          values.part3?.chats?.map((c) => ({
            speaker: c.speaker?.trim() || '',
            question: c.question?.trim() || '',
            wordLimit: c.wordLimit || null,
          })) || [],
      },

      part4: {
        PartID: values.part4?.PartID || null,
        name: values.part4?.partName?.trim() || '',
        subContent: values.part4?.emailText?.trim() || '',
        q1: values.part4?.q1?.trim() || '',
        q1_wordLimit: values.part4?.q1_wordLimit || null,
        q2: values.part4?.q2?.trim() || '',
        q2_wordLimit: values.part4?.q2_wordLimit || null,
      },
    },
  };
}
