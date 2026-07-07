'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBranding } from '@/contexts/BrandingContext';

interface ContentPageLayoutProps {
  title: string;
  children: ReactNode;
}

export default function ContentPageLayout({ title, children }: ContentPageLayoutProps) {
  const router = useRouter();
  const { config } = useBranding();
  const [bgLoaded, setBgLoaded] = useState(false);

  const bgUrl = config.assets?.backgrounds?.dashboard;

  useEffect(() => {
    if (!bgUrl) return;
    const img = new Image();
    img.src = bgUrl;
    img.onload = () => setBgLoaded(true);
  }, [bgUrl]);

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Background image */}
      {bgUrl && (
        <img
          src={bgUrl}
          alt=""
          aria-hidden="true"
          className="fixed inset-0 w-full h-full object-cover object-top transition-opacity duration-700 pointer-events-none"
          style={{ opacity: bgLoaded ? 1 : 0, zIndex: 0 }}
        />
      )}

      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>
        {/* Header */}
        <header className="sticky top-0 z-50 shadow-lg relative overflow-hidden" style={{ backgroundColor: 'var(--color-primary)' }}>
          {/* Background image matching main app Navbar */}
          <img
            src="/assets/LAYOUT/header.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          <div className="relative max-w-4xl mx-auto px-4 py-2 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-white hover:opacity-70 transition"
              aria-label="Volver"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            {config.assets?.logos?.main ? (
              <img
                src={config.assets.logos.main}
                alt="Logo"
                className="w-20 h-auto cursor-pointer"
                onClick={() => router.push('/')}
              />
            ) : null}
            <h1 className="text-xs font-bold text-white uppercase tracking-wider truncate" style={{ color: 'var(--color-primaryText)' }}>{title}</h1>
          </div>
        </header>

        {/* Content */}
        <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-8">
          <div className="rounded-2xl border p-6 md:p-8 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            {children}
          </div>
        </main>

        {/* Footer - matching AppShell */}
        <footer className="py-8 px-4 mt-auto relative overflow-hidden" style={{ backgroundColor: 'var(--color-surface2)' }}>
          <img
            src="/assets/LAYOUT/footer.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          <div className="relative max-w-4xl mx-auto sm:px-4 text-white">
            <div className="flex flex-col items-center mb-6">
              {config.assets?.logos?.large && (
                <img src={config.assets.logos.large} alt="Logo" className="w-32 h-auto mb-3" />
              )}
            </div>
            <div className="border-t border-white/20 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-[10px] font-semibold">
                {config.content?.pageTitle || 'Quiniela Mundialista'}
              </p>
              <p className="text-[9px] uppercase tracking-wider opacity-70">
                © {new Date().getFullYear()} • Todos los derechos reservados
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
