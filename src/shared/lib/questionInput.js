export const MAX_QUESTION_INPUT_LENGTH = 2000;
export const QUESTION_INPUT_REGEX = /^[a-zA-Z0-9 ,.\-_()"':?!\n\[\]]*$/;

export function sanitizeQuestionInput(value = '') {
  return value.replace(/[^a-zA-Z0-9 ,.\-_()"':?!\n\[\]]/g, '');
}

export function questionInputRule(fieldName = 'This field') {
  return {
    validator: (_, value) => {
      const normalized = typeof value === 'string' ? value.trim() : '';

      if (!normalized) {
        return Promise.reject(new Error(`${fieldName} is required`));
      }

      if (normalized.length > MAX_QUESTION_INPUT_LENGTH) {
        return Promise.reject(
          new Error(`${fieldName} must be at most ${MAX_QUESTION_INPUT_LENGTH} characters`)
        );
      }

      if (!QUESTION_INPUT_REGEX.test(normalized)) {
        return Promise.reject(
          new Error(`${fieldName} contains invalid characters`)
        );
      }

      return Promise.resolve();
    },
  };
}
