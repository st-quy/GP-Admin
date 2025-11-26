import * as yup from 'yup';

export const createReadingSchema = yup.object().shape({
  PartID: yup.string().required('Part is required'),
  Content: yup.string().required('Instruction text is required'),

  blanks: yup
    .array()
    .of(
      yup.object().shape({
        key: yup.string().required(),
        options: yup
          .array()
          .of(
            yup.object().shape({
              value: yup.string().required('Option text is required'),
            })
          )
          .min(1, 'Each blank must have at least 1 option'),
        correctAnswer: yup.string().required('Correct answer is required'),
      })
    )
    .min(1, 'At least one blank is required'),
});
