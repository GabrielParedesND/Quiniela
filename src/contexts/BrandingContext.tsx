'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getDefaultBrandingConfig } from '@/lib/branding/defaults';
import { AppBrandingConfig } from '@/lib/branding/types';
import { IS_DEMO_MODE } from '@/lib/demo-mode';

interface BrandingContextValue {
  config: AppBrandingConfig;
  loading: boolean;
  error: string;
  isDefault: boolean;
  setConfig?: (config: AppBrandingConfig) => void;
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
    // Ensure features field exists (backward compat)
    if (!parsed.features) parsed.features = { printedCodesEnabled: false };
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
    let fetchInProgress = false;

    const loadBranding = async () => {
      if (fetchInProgress) return;
      fetchInProgress = true;
      
      setError('');

      // In demo mode, use default config without API calls
      if (IS_DEMO_MODE) {
        const defaults = getDefaultBrandingConfig();
        if (!cancelled) {
          setConfig(defaults);
          setLoading(false);
        }
        fetchInProgress = false;
        return;
      }

      // Resolve initial config from cache as early as possible.
      const cached = readCachedBrandingConfig();
      const cachedIsReal = !cached.brandingId.includes('#default');
      if (!cancelled) {
        setConfig(cached);
        // If cache has a real project, we can show content immediately
        // while the API fetch refreshes in the background
        if (cachedIsReal) setLoading(false);
      }

      try {
        const response = await fetch('/api/app-config', { 
          cache: 'no-store',
          next: { revalidate: 60 } // Cache for 60 seconds
        });
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
      } finally {
        if (!cancelled) setLoading(false);
        fetchInProgress = false;
      }
    };

    loadBranding();

    return () => {
      cancelled = true;
    };
  }, []);

  const isDefault = config.brandingId.includes('#default');

  const value = useMemo(
    () => ({
      config,
      loading,
      error,
      isDefault,
      setConfig,
    }),
    [config, loading, error, isDefault]
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
