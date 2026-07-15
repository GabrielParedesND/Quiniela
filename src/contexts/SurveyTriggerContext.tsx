'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { SurveyTrigger } from '@/lib/branding/types';

interface SurveyTriggerContextValue {
  activeTrigger: SurveyTrigger | null;
  fireTrigger: (trigger: SurveyTrigger) => void;
  clearTrigger: () => void;
}

const SurveyTriggerContext = createContext<SurveyTriggerContextValue | undefined>(undefined);

export function SurveyTriggerProvider({ children }: { children: React.ReactNode }) {
  const [activeTrigger, setActiveTrigger] = useState<SurveyTrigger | null>(null);

  const fireTrigger = useCallback((trigger: SurveyTrigger) => {
    setActiveTrigger(trigger);
  }, []);

  const clearTrigger = useCallback(() => {
    setActiveTrigger(null);
  }, []);

  const value = useMemo(
    () => ({ activeTrigger, fireTrigger, clearTrigger }),
    [activeTrigger, fireTrigger, clearTrigger]
  );

  return (
    <SurveyTriggerContext.Provider value={value}>
      {children}
    </SurveyTriggerContext.Provider>
  );
}

export const useSurveyTrigger = (): SurveyTriggerContextValue => {
  const context = useContext(SurveyTriggerContext);
  if (!context) {
    throw new Error('useSurveyTrigger must be used within SurveyTriggerProvider');
  }
  return context;
};
