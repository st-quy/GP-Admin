// schema.js
import * as yup from 'yup';

export const createSpeakingSchema = yup.object().shape({
  parts: yup.object().shape({
    part1: yup.object().shape({
      name: yup.string().trim().required('Part 1 name is required'),
      questions: yup
        .array()
        .of(
          yup.object().shape({
            value: yup.string().trim().required('Question is required'),
          })
        )
        .min(3, 'Part 1 requires at least 3 questions'),
    }),

    part2: yup.object().shape({
      name: yup.string().trim().required('Part 2 name is required'),
      questions: yup
        .array()
        .of(
          yup.object().shape({
            value: yup.string().trim().required('Question is required'),
          })
        )
        .min(3, 'Part 2 requires at least 3 questions'),
    }),

    part3: yup.object().shape({
      name: yup.string().trim().required('Part 3 name is required'),
      questions: yup
        .array()
        .of(
          yup.object().shape({
            value: yup.string().trim().required('Question is required'),
          })
        )
        .min(3, 'Part 3 requires at least 3 questions'),
    }),

    part4: yup.object().shape({
      name: yup.string().trim().required('Part 4 name is required'),
      questions: yup
        .array()
        .of(
          yup.object().shape({
            value: yup.string().trim().required('Question is required'),
          })
        )
        .min(3, 'Part 4 requires at least 3 questions'),
    }),
  }),
});

export const readingDropdownSchema = yup.object().shape({
  PartID: yup.string().required('Part is required'),

  Content: yup.string().trim().required('Instruction text is required'),

  blanks: yup
    .array()
    .of(
      yup.object().shape({
        key: yup.string().required(),

        options: yup
          .array()
          .of(
            yup.object().shape({
              value: yup.string().trim().required('Option text is required'),
            })
          )
          .min(1, 'Each blank must have at least 1 option'),

        correctAnswer: yup
          .string()
          .trim()
          .required('Correct answer is required'),
      })
    )
    .min(1, 'At least 1 blank is required'),
});

export const readingMatchingSchema = yup.object().shape({
  PartID: yup.string().required('Part is required'),
  Content: yup.string().trim().required('Instruction text is required'),

  leftItems: yup
    .array()
    .of(yup.string().trim().required('Content item cannot be empty'))
    .min(1, 'At least 1 content item is required'),

  rightItems: yup
    .array()
    .of(yup.string().trim().required('Option cannot be empty'))
    .min(1, 'At least 1 option is required'),

  mapping: yup
    .array()
    .of(
      yup.object().shape({
        leftIndex: yup.number().min(0).required(),
        rightId: yup.mixed().nullable(),
      })
    )
    .test(
      'all-left-mapped',
      'Each content item must have a mapped option',
      function (value) {
        const { leftItems } = this.parent;
        if (!leftItems || !leftItems.length) return true;

        const mapped = (value || [])
          .filter((m) => m.rightId !== null && m.rightId !== undefined)
          .map((m) => m.leftIndex);

        return leftItems.every((_, idx) => mapped.includes(idx));
      }
    ),
});

export const grammarMatchingSchema = yup.object().shape({
  PartID: yup.string().required('Part is required'),
  Content: yup.string().trim().required('Instruction text is required'),
  leftItems: yup
    .array()
    .of(yup.string().trim().required('Left item cannot be empty'))
    .min(1, 'At least 1 left item is required'),
  rightItems: yup
    .array()
    .of(yup.string().trim().required('Right option cannot be empty'))
    .min(1, 'At least 1 right option is required'),
  mapping: yup
    .array()
    .of(
      yup.object().shape({
        leftIndex: yup.number().min(0).required(),
        rightId: yup.mixed().nullable(),
      })
    )
    .test(
      'all-left-mapped',
      'Each left item must have a mapped option',
      function (value) {
        const { leftItems } = this.parent;
        if (!leftItems || !leftItems.length) return true;
        const mapped = (value || [])
          .filter((m) => m.rightId !== null && m.rightId !== undefined)
          .map((m) => m.leftIndex);
        return leftItems.every((_, idx) => mapped.includes(idx));
      }
    ),
});

export const grammarMultipleChoiceSchema = yup.object().shape({
  PartID: yup.string().required('Part is required'),
  Title: yup.string().trim().required('Question text is required'),
  options: yup
    .array()
    .of(
      yup.object().shape({
        label: yup.string().required(), // A/B/C/D
        value: yup.string().trim().required('Option text is required'),
        isCorrect: yup.boolean().default(false),
      })
    )
    .min(2, 'At least 2 options are required')
    .test('has-correct', 'Please select 1 correct answer', (options) => {
      if (!options || !options.length) return false;
      return options.filter((o) => o.isCorrect).length === 1;
    }),
});

// Writing

export const schemaPart1 = yup.object().shape({
  title: yup.string().required(),
  questions: yup.array().of(
    yup.object().shape({
      question: yup.string().required(),
    })
  ),
});

export const schemaPart2 = yup.object().shape({
  title: yup.string().required(),
  question: yup.string().required(),
});

export const schemaPart3 = yup.object().shape({
  title: yup.string().required(),
  chats: yup.array().of(
    yup.object().shape({
      speaker: yup.string().required(),
      question: yup.string().required(),
    })
  ),
});

export const schemaPart4 = yup.object().shape({
  emailText: yup.string().required(),
  q1: yup.string().required(),
  q2: yup.string().required(),
});

/* ============================================================
   PART 1 — DROPDOWN (Fill in Blank)
   content: string
   blanks: [
     {
       key: string,
       options: [{ value: string }],
       correctAnswer: string
     }
   ]
============================================================ */
export const readingPart1Schema = yup.object().shape({
  content: yup.string().trim().required('Content is required'),

  blanks: yup
    .array()
    .of(
      yup.object().shape({
        key: yup.string().required(),

        options: yup
          .array()
          .of(
            yup.object().shape({
              value: yup.string().trim().required('Option value is required'),
            })
          )
          .min(1, 'At least 1 option required'),

        correctAnswer: yup
          .string()
          .trim()
          .required('Correct answer is required'),
      })
    )
    .min(1, 'At least 1 blank is required'),
});

/* ============================================================
   PART 2 — ORDERING (intro + items)
============================================================ */
export const orderingSchema = yup.object().shape({
  intro: yup.string().trim().required('Introduction is required'),

  items: yup
    .array()
    .of(yup.string().trim().required('Item is required'))
    .min(2, 'At least 2 items are required'),
});

/* ============================================================
   PART 3 — DROPDOWN MATCHING (1 → NAME)
   leftItems: array of strings
   rightItems: array of strings
   mapping: [ { left: string, right: string } ]
============================================================ */
export const readingPart3Schema = yup.object().shape({
  leftItems: yup
    .array()
    .of(
      yup.object().shape({
        text: yup.string().required('Left item cannot be empty'),
      })
    )
    .min(1, 'At least 1 left content is required'),

  rightItems: yup
    .array()
    .of(
      yup.object().shape({
        text: yup.string().required('Right option cannot be empty'),
      })
    )
    .min(1, 'At least 1 right option is required'),

  mapping: yup
    .array()
    .of(
      yup.object().shape({
        leftIndex: yup.number().required(),
        rightId: yup.mixed().required('Each left item must have a match'),
      })
    )
    .test('mapping-full', 'All left items must be mapped', function (value) {
      const { leftItems } = this.parent;
      return value.length === leftItems.length;
    }),
});

/* ============================================================
   PART 4 — FULL MATCHING (content + L/R items + mapping)
============================================================ */
export const readingPart4Schema = yup.object().shape({
  content: yup.string().trim().required('Content is required'),

  leftItems: yup
    .array()
    .of(yup.string().trim().required('Left item is required'))
    .min(1, 'At least 1 left item'),

  rightItems: yup
    .array()
    .of(yup.string().trim().required('Right item is required'))
    .min(1, 'At least 1 right item'),

  mapping: yup.array().of(
    yup.object().shape({
      left: yup.string().trim().required('Left mapping is required'),
      right: yup.string().trim().required('Right mapping is required'),
    })
  ),
});

/* ============================================================
   FULL SCHEMA — 5 PARTS
============================================================ */
export const readingFullSchema = yup.object().shape({
  part1: readingPart1Schema,
  part2A: orderingSchema,
  part2B: orderingSchema,
  part3: readingPart3Schema,
  part4: readingPart4Schema,
});

export const buildListeningPayload = (values) => {
  const {
    sectionName,
    part1Name,
    part1,
    part2Name,
    part2,
    part3Name,
    part3,
    part4Name,
    part4,
  } = values;

  /** =========================
   * PART 1 — MULTIPLE CHOICE
   ========================= */
  const part1Payload = {
    name: part1Name,
    sequence: 1,
    questions: part1.map((q) => ({
      Type: 'multiple-choice',
      Content: q.instruction,
      AudioKeys: q.audioUrl,
      AnswerContent: {
        content: q.instruction,
        options: q.options.map((o) => o.value),
        correctAnswer: q.options.find((o) => o.id === q.correctId)?.value || '',
        type: 'multiple-choice',
        audioKeys: q.audioUrl,
      },
    })),
  };

  /** =========================
   * PART 2 — MATCHING
   ========================= */
  const part2Payload = {
    name: part2Name,
    sequence: 2,
    questions: [
      {
        Type: 'dropdown-list',
        Content: part2.instruction,
        AudioKeys: part2.audioUrl,
        AnswerContent: {
          content: part2.instruction,
          leftItems: part2.leftItems.map((i) => i.text),
          rightItems: part2.rightItems.map((i) => i.text),
          correctAnswer: part2.mapping.map((m) => ({
            key: part2.leftItems[m.leftIndex]?.text,
            value: part2.rightItems.find((r) => r.id === m.rightId)?.text,
          })),
          type: 'dropdown-list',
          audioKeys: part2.audioUrl,
        },
      },
    ],
  };

  /** =========================
   * PART 3 — MATCHING
   ========================= */
  const part3Payload = {
    name: part3Name,
    sequence: 3,
    questions: [
      {
        Type: 'dropdown-list',
        Content: part3.instruction,
        AudioKeys: part3.audioUrl,
        AnswerContent: {
          content: part3.instruction,
          leftItems: part3.leftItems.map((i) => i.text),
          rightItems: part3.rightItems.map((i) => i.text),
          correctAnswer: part3.mapping.map((m) => ({
            key: part3.leftItems[m.leftIndex]?.text,
            value: part3.rightItems.find((r) => r.id === m.rightId)?.text,
          })),
          type: 'dropdown-list',
          audioKeys: part3.audioUrl,
        },
      },
    ],
  };

  /** =========================
   * PART 4 — GROUP QUESTIONS
   ========================= */
  const part4Payload = {
    name: part4Name,
    sequence: 4,
    questions: part4.map((g) => ({
      Type: 'listening-questions-group',
      Content: g.instruction,
      AudioKeys: g.audioUrl,
      AnswerContent: {
        content: g.instruction,
        type: 'listening-questions-group',
        audioKeys: g.audioUrl,
        groupContent: {
          title: g.instruction,
          audioKey: g.audioUrl,
          listContent: g.subQuestions.map((s, idx) => ({
            ID: idx + 1,
            content: s.content,
            options: s.options.map((o) => o.value),
            correctAnswer:
              s.options.find((o) => o.id === s.correctId)?.value || '',
            type: 'multiple-choice',
          })),
        },
      },
    })),
  };

  /** =========================
   * FINAL PAYLOAD
   ========================= */
  return {
    SkillName: 'LISTENING',
    SectionName: sectionName,
    parts: {
      part1: part1Payload,
      part2: part2Payload,
      part3: part3Payload,
      part4: part4Payload,
    },
  };
};
