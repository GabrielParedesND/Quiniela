'use client';

import { useEffect } from 'react';
import { applyTheme } from '@/lib/theme/theme';
import { useBranding } from '@/contexts/BrandingContext';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { config, loading } = useBranding();

  useEffect(() => {
    // Avoid overriding preloaded theme during hydration.
    if (loading) return;
    if (config?.theme) applyTheme(config.theme);
  }, [config, loading]);

  return <>{children}</>;
}
