import { useState, useEffect, useRef, useCallback } from 'react';
import { QuestionApi, SectionApi } from '@features/questions/api';

const AUTOSAVE_DEBOUNCE_MS = 2000;

export const useDbDraft = (skillName) => {
  const [draftSectionId, setDraftSectionId] = useState(null);
  const [draftData, setDraftData] = useState(null);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const debounceTimerRef = useRef(null);
  const payloadRef = useRef(null);
  const draftIdRef = useRef(null);

  const initializeDraft = useCallback(async () => {
    try {
      const { data } = await SectionApi.createDraft(skillName);
      const sectionId = data.data.ID;
      const isExisting = data.isExisting;
      setDraftSectionId(sectionId);
      draftIdRef.current = sectionId;

      if (isExisting) {
        const detailRes = await QuestionApi.getDetail({ skillName, sectionId });
        setDraftData(detailRes.data.data);
        return { sectionId, isExisting, draftData: detailRes.data.data };
      }

      return { sectionId, isExisting, draftData: null };
    } catch (error) {
      console.error('Failed to initialize draft:', error);
      return null;
    }
  }, [skillName]);

  const scheduleAutosave = useCallback((payload) => {
    payloadRef.current = payload;
    setIsAutosaving(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (payloadRef.current && draftIdRef.current) {
        try {
          await QuestionApi.update({ sectionId: draftIdRef.current, payload: payloadRef.current });
        } catch (error) {
          console.error('Autosave failed:', error);
        } finally {
          setIsAutosaving(false);
          payloadRef.current = null;
        }
      } else {
        setIsAutosaving(false);
      }
    }, AUTOSAVE_DEBOUNCE_MS);
  }, []);

  const discardDraft = useCallback(async () => {
    if (!draftIdRef.current) return;
    try {
      await SectionApi.deleteDraft(draftIdRef.current);
    } catch (error) {
      console.error('Failed to discard draft:', error);
    } finally {
      setDraftSectionId(null);
      setDraftData(null);
      draftIdRef.current = null;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    draftSectionId,
    draftData,
    isAutosaving,
    initializeDraft,
    scheduleAutosave,
    discardDraft,
  };
};

export default useDbDraft;
