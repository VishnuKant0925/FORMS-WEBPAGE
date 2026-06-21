import { useEffect, useRef, useState } from 'react';
import { formService } from '@/services/formService';
import type { FormType } from '@/types';

export function useAutoSave(
  formType: FormType,
  formData: Record<string, any> | undefined,
  language: string,
  initialDraftId: string | null = null,
  onDraftCreated?: (id: string) => void
) {
  const [draftId, setDraftId] = useState<string | null>(initialDraftId);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const onDraftCreatedRef = useRef(onDraftCreated);
  useEffect(() => {
    onDraftCreatedRef.current = onDraftCreated;
  }, [onDraftCreated]);

  // Use refs to keep track of current values so our timeout does not trigger unnecessary runs
  const formDataRef = useRef(formData);
  const languageRef = useRef(language);
  const draftIdRef = useRef(draftId);

  useEffect(() => {
    formDataRef.current = formData;
    languageRef.current = language;
    draftIdRef.current = draftId;
  }, [formData, language, draftId]);

  useEffect(() => {
    if (!formData || Object.keys(formData).length === 0) return;

    // Debounce timer for auto-save (e.g. 30 seconds)
    const delay = 30000;
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const currentData = formDataRef.current || {};
        const currentLang = languageRef.current;
        const currentDraftId = draftIdRef.current;

        if (currentDraftId) {
          await formService.updateDraft(currentDraftId, currentData, currentLang);
          setSaveStatus('saved');
          setLastSaved(new Date());
        } else {
          const submission = await formService.saveDraft(formType, currentLang, currentData);
          setDraftId(submission._id);
          if (onDraftCreatedRef.current) {
            onDraftCreatedRef.current(submission._id);
          }
          setSaveStatus('saved');
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error('Auto-save draft failed:', error);
        setSaveStatus('error');
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [formData, formType]);

  const save = async () => {
    if (!formDataRef.current) return;
    setSaveStatus('saving');
    try {
      const currentData = formDataRef.current || {};
      const currentLang = languageRef.current;
      const currentDraftId = draftIdRef.current;

      if (currentDraftId) {
        await formService.updateDraft(currentDraftId, currentData, currentLang);
      } else {
        const submission = await formService.saveDraft(formType, currentLang, currentData);
        setDraftId(submission._id);
        if (onDraftCreatedRef.current) {
          onDraftCreatedRef.current(submission._id);
        }
      }
      setSaveStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      console.error('Manual save failed:', error);
      setSaveStatus('error');
    }
  };

  return { draftId, saveStatus, lastSaved, save, setDraftId };
}
