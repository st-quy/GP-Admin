import { useState, useEffect } from "react";
import debounce from "lodash.debounce";

export function useDebouncedValue(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = debounce(() => setDebouncedValue(value), delay);
    handler();
    return () => {
      handler.cancel();
    };
  }, [value, delay]);

  return debouncedValue;
}
