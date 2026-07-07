'use client';

import { useState, useEffect } from 'react';
import { computeTimeRemaining, isUrgent, type TimeRemaining } from '@/lib/countdown';

interface CountdownTimerProps {
  /** ISO 8601 deadline timestamp for the active jornada */
  deadline: string | null;
  /** Optional informational message displayed below the countdown */
  infoMessage?: string;
}

export default function CountdownTimer({ deadline, infoMessage }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState<TimeRemaining>(() => {
    if (!deadline) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return computeTimeRemaining(deadline);
  });

  useEffect(() => {
    if (!deadline) {
      setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
      return;
    }

    // Compute immediately on mount / deadline change
    setRemaining(computeTimeRemaining(deadline));

    const intervalId = setInterval(() => {
      setRemaining(computeTimeRemaining(deadline));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [deadline]);

  const urgent = isUrgent(remaining);

  if (remaining.expired || !deadline) {
    return (
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Jornada cerrada
        </span>
      </div>
    );
  }

  const segments: { value: number; label: string }[] = [
    { value: remaining.days, label: 'días' },
    { value: remaining.hours, label: 'hrs' },
    { value: remaining.minutes, label: 'min' },
    { value: remaining.seconds, label: 'seg' },
  ];

  const accentColor = urgent ? 'var(--color-danger)' : '#ffffff';

  return (
    <div
      style={{
        backgroundColor: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}>
        {segments.map((seg, idx) => (
          <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '2.75rem',
                padding: '0.375rem 0.5rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: `1px solid ${urgent ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.12)'}`,
              }}
            >
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  color: accentColor,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {String(seg.value).padStart(2, '0')}
              </span>
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {seg.label}
              </span>
            </div>
            {idx < segments.length - 1 && (
              <span
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '1rem',
                  fontWeight: 700,
                }}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
      {infoMessage && (
        <p style={{ color: '#ffffff', fontSize: '0.625rem', textAlign: 'center', margin: 0, opacity: 0.8 }}>
          {infoMessage}
        </p>
      )}
    </div>
  );
}
