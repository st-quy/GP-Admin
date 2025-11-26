// schema.js
import * as yup from 'yup';

export const createSpeakingSchema = yup.object().shape({
  partName: yup.string().required('Title is required'),
  partType: yup.string().required('Please select a part type'),
  description: yup.string().required('Description is required'),

  questions: yup
    .array()
    .of(
      yup.object().shape({
        value: yup.string().required('Question cannot be empty'),
      })
    )
    .min(1, 'At least 1 question is required'),
  image: yup
    .array()
    .min(1, 'Image is required')
    .test('fileType', 'Only JPG/PNG images allowed', (value) => {
      if (!value || value.length === 0) return false;
      const file = value[0].originFileObj;
      return ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
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

export const readingOrderingSchema = yup.object().shape({
  PartID: yup.string().required('Part is required'),

  Content: yup.string().trim().required('Instruction text is required'),

  items: yup
    .array()
    .of(yup.string().trim().required('Sentence cannot be empty'))
    .min(2, 'At least 2 sentences are required for ordering'),
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
