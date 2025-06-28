export const yupSync = (schema) => ({
  type: 'custom',
  validator: async ({ field }, value) => {
    try {
      await schema.validateSyncAt(field, { [field]: value });
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }
}); 