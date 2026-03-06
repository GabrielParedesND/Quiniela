'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getDefaultBrandingConfig } from '@/lib/branding/defaults';
import { AppBrandingConfig } from '@/lib/branding/types';

interface BrandingContextValue {
  config: AppBrandingConfig;
  loading: boolean;
  error: string;
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);
const BRANDING_CACHE_KEY = 'app-branding-config';

const readCachedBrandingConfig = (): AppBrandingConfig => {
  const fallback = getDefaultBrandingConfig();
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(BRANDING_CACHE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as AppBrandingConfig;
    if (!parsed?.theme || !parsed?.assets || !parsed?.sponsors || !parsed?.meta) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
};

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppBrandingConfig>(getDefaultBrandingConfig());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadBranding = async () => {
      setError('');

      // Resolve initial config from cache as early as possible.
      const cached = readCachedBrandingConfig();
      if (!cancelled) {
        setConfig(cached);
        setLoading(false);
      }

      try {
        const response = await fetch('/api/app-config', { cache: 'no-store' });
        if (!response.ok) throw new Error('No se pudo cargar configuracion visual');
        const data = (await response.json()) as AppBrandingConfig;
        if (!cancelled && data) {
          setConfig(data);
          window.localStorage.setItem(BRANDING_CACHE_KEY, JSON.stringify(data));
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Error al cargar configuracion visual';
          setError(message);
        }
      }
    };

    loadBranding();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      config,
      loading,
      error,
    }),
    [config, loading, error]
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export const useBranding = (): BrandingContextValue => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return context;
};
