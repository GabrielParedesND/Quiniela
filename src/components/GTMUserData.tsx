'use client';

import { useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

/**
 * Pushes user_id and logged_in to the GTM dataLayer
 * so all subsequent GTM events carry these values.
 */
export default function GTMUserData() {
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      user_id: user?.userId ?? null,
      logged_in: !!user,
    });
  }, [user, loading]);

  return null;
}
