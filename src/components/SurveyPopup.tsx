'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useBranding } from '@/contexts/BrandingContext';
import { useUser } from '@/contexts/UserContext';
import { useSurveyTrigger } from '@/contexts/SurveyTriggerContext';
import { useSurveyFrequency } from '@/hooks/useSurveyFrequency';

export default function SurveyPopup() {
  const { config } = useBranding();
  const { user } = useUser();
  const { activeTrigger, clearTrigger } = useSurveyTrigger();

  const survey = config.survey;
  const userId = user?.userId ?? '';

  const { canShow, recordView } = useSurveyFrequency(userId, survey?.surveyMaxFrequency ?? 1);

  const [visible, setVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const hasRecordedRef = useRef(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Determine if the popup should display
  const shouldShow =
    !!survey &&
    survey.surveyEnabled &&
    !!activeTrigger &&
    survey.surveyTriggers.includes(activeTrigger) &&
    canShow &&
    !!userId;

  // Show popup and record view when conditions are met
  useEffect(() => {
    if (shouldShow && !visible) {
      setVisible(true);
      setImageError(false);
      hasRecordedRef.current = false;
    }
  }, [shouldShow, visible]);

  // Animate in after visible
  useEffect(() => {
    if (visible) {
      // Small delay for animation trigger
      const timer = setTimeout(() => setAnimateIn(true), 10);
      // Record view once
      if (!hasRecordedRef.current) {
        recordView();
        hasRecordedRef.current = true;
      }
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      // Focus close button for accessibility
      closeButtonRef.current?.focus();
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      setAnimateIn(false);
    }
  }, [visible, recordView]);

  // Close on Escape key
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  const handleClose = useCallback(() => {
    setAnimateIn(false);
    // Wait for exit animation before hiding
    setTimeout(() => {
      setVisible(false);
      clearTrigger();
    }, 200);
  }, [clearTrigger]);

  if (!visible || !survey) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        opacity: animateIn ? 1 : 0,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="survey-popup-title"
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl transition-all duration-200 relative overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          transform: animateIn ? 'scale(1)' : 'scale(0.95)',
          opacity: animateIn ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition hover:opacity-70"
          style={{ backgroundColor: 'var(--color-surface2)', color: 'var(--color-muted)' }}
          aria-label="Cerrar encuesta"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Image */}
        {survey.surveyImageUrl && !imageError && (
          <div className="flex justify-center mb-4 mt-2">
            <img
              src={survey.surveyImageUrl}
              alt={survey.surveyTitle || 'Encuesta'}
              className="w-full max-h-40 object-contain rounded-xl"
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {/* Title */}
        <h2
          id="survey-popup-title"
          className="text-base font-bold text-center mb-4 px-4"
          style={{ color: 'var(--color-text)' }}
        >
          {survey.surveyTitle}
        </h2>

        {/* CTA Button */}
        <a
          href={survey.surveyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 rounded-xl text-center text-sm font-bold uppercase tracking-wider transition hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
          }}
        >
          {survey.surveyButtonText}
        </a>
      </div>
    </div>
  );
}
