'use client';

import { useState, useCallback } from 'react';

interface SurveyViewRecord {
  date: string; // ISO date string YYYY-MM-DD (local time)
  count: number; // views on that day
}

export interface UseSurveyFrequencyReturn {
  canShow: boolean;
  recordView: () => void;
  viewsToday: number;
}

function getLocalStorageKey(userId: string): string {
  return `survey-views-${userId}`;
}

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function readViewRecord(userId: string): SurveyViewRecord {
  try {
    const key = getLocalStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return { date: getTodayDateString(), count: 0 };
    }
    const parsed = JSON.parse(raw) as SurveyViewRecord;
    if (
      typeof parsed.date !== 'string' ||
      typeof parsed.count !== 'number' ||
      !Number.isFinite(parsed.count)
    ) {
      return { date: getTodayDateString(), count: 0 };
    }
    // If stored date is different from today, reset counter
    const today = getTodayDateString();
    if (parsed.date !== today) {
      return { date: today, count: 0 };
    }
    return parsed;
  } catch {
    // localStorage not available or data corrupt — fallback: allow display
    return { date: getTodayDateString(), count: 0 };
  }
}

function writeViewRecord(userId: string, record: SurveyViewRecord): void {
  try {
    const key = getLocalStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(record));
  } catch {
    // Silently fail — if we can't write, next read will also fallback
  }
}

export function useSurveyFrequency(
  userId: string,
  maxFrequency: number
): UseSurveyFrequencyReturn {
  const [viewsToday, setViewsToday] = useState<number>(() => {
    const record = readViewRecord(userId);
    return record.count;
  });

  const canShow = viewsToday < maxFrequency;

  const recordView = useCallback(() => {
    const record = readViewRecord(userId);
    const newCount = record.count + 1;
    const newRecord: SurveyViewRecord = { date: record.date, count: newCount };
    writeViewRecord(userId, newRecord);
    setViewsToday(newCount);
  }, [userId]);

  return { canShow, recordView, viewsToday };
}
