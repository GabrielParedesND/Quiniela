'use client';

import { useBranding } from '@/contexts/BrandingContext';
import { IS_DEMO_MODE } from '@/lib/demo-mode';
import ComingSoon from './ComingSoon';

/**
 * Wraps app content and shows a "Coming Soon" page when no active project exists.
 * Allows /preview routes and demo mode to bypass the gate.
 */
export default function ActiveProjectGate({ children }: { children: React.ReactNode }) {
  const { isDefault, loading } = useBranding();

  // Demo mode always passes through
  if (IS_DEMO_MODE) return <>{children}</>;

  // Don't block during initial load
  if (loading) return <>{children}</>;

  // Check if we're on the preview page (bypass gate)
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/preview')) {
    return <>{children}</>;
  }

  // No active project — show coming soon
  if (isDefault) {
    return <ComingSoon />;
  }

  return <>{children}</>;
}
