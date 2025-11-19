import * as Yup from 'yup';

/**
 * Creates a form validator that skips validation for disabled fields
 * @param {Object} schema - Yup validation schema
 * @param {string[]} disabledFields - List of field names that are disabled
 */
export const createFormValidator = (schema, disabledFields = []) => {
  return async (rule, value) => {
    // Skip validation for disabled fields
    if (disabledFields.includes(rule.field)) {
      return Promise.resolve();
    }

    try {
      await schema.validateSyncAt(rule.field, { [rule.field]: value });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error.message);
    }
  };
};