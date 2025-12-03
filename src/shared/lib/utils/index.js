// utils/yupSync.js
export const yupSync = (schema, pathOverride = null) => ({
  async validator(ruleContext, value) {
    const { field, form } = ruleContext;

    try {
      // CASE NESTED (dùng pathOverride chính xác)
      if (pathOverride) {
        const root = form?.getFieldsValue?.(true) || {};

        // inject value vào đúng pathOverride
        let cursor = root;
        for (let i = 0; i < pathOverride.length - 1; i++) {
          const key = pathOverride[i];
          const nextKey = pathOverride[i + 1];

          if (
            cursor[key] === undefined ||
            cursor[key] === null ||
            typeof cursor[key] !== 'object'
          ) {
            cursor[key] = typeof nextKey === 'number' ? [] : {};
          }
          cursor = cursor[key];
        }

        const lastKey = pathOverride[pathOverride.length - 1];
        cursor[lastKey] = value;

        await schema.validateAt(pathOverride.join('.'), root);
        return;
      }

      // CASE NON-NESTED (không phá form khác)
      await schema.validateSyncAt(field, { [field]: value });
    } catch (err) {
      return Promise.reject(err.message);
    }
  },
});
