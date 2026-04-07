import { useState, useEffect, useCallback, useRef } from 'react';

const DRAFT_PREFIX = 'question_draft_';
const AUTOSAVE_DEBOUNCE_MS = 2000;

export const useQuestionDraft = (skill, options = {}) => {
  const { enableAutosave = false } = options;
  const storageKey = `${DRAFT_PREFIX}${skill}`;

  const [draftData, setDraftData] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);

  const debounceTimerRef = useRef(null);
  const pendingDataRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDraftData(parsed);
        setHasDraft(true);
      } catch (e) {
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey]);

  const saveDraft = useCallback((data) => {
    localStorage.setItem(storageKey, JSON.stringify(data));
    setDraftData(data);
    setHasDraft(true);
    setIsAutosaving(false);
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    setDraftData(null);
    setHasDraft(false);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, [storageKey]);

  const loadDraft = useCallback(() => {
    return draftData;
  }, [draftData]);

  const scheduleAutosave = useCallback((data) => {
    if (!enableAutosave) return;

    pendingDataRef.current = data;
    setIsAutosaving(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (pendingDataRef.current) {
        saveDraft(pendingDataRef.current);
        pendingDataRef.current = null;
      }
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [enableAutosave, saveDraft]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    hasDraft,
    draftData,
    saveDraft,
    clearDraft,
    loadDraft,
    scheduleAutosave,
    isAutosaving,
  };
};

export default useQuestionDraft;
