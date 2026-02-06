'use client';

import { useEffect } from 'react';
import { loadTheme, applyTheme } from '@/lib/theme/theme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const theme = loadTheme('default');
    applyTheme(theme);
  }, []);

  return <>{children}</>;
}
