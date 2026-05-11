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
        <header className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
          <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-4">
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
                className="w-28 h-auto cursor-pointer"
                onClick={() => router.push('/')}
              />
            ) : null}
            <h1 className="text-sm font-bold text-white uppercase tracking-wider truncate">{title}</h1>
          </div>
        </header>

        {/* Content */}
        <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-8">
          <div className="rounded-2xl border p-6 md:p-8 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="text-white py-12 px-4 mt-auto" style={{ backgroundColor: 'var(--color-surface2)' }}>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center md:text-left">
                {config.assets?.logos?.large && (
                  <img src={config.assets.logos.large} alt="Logo" className="w-40 h-auto mx-auto md:mx-0 mb-4" />
                )}
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  {config.meta?.appDescription || ''}
                </p>
              </div>
              <div className="text-center">
                <h5 className="text-sm font-black uppercase mb-3" style={{ color: 'var(--color-text)' }}>Enlaces</h5>
                <ul className="space-y-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                  <li><a href="/como-jugar" className="hover:opacity-70 transition">Como Jugar</a></li>
                  <li><a href="/premios" className="hover:opacity-70 transition">Premios</a></li>
                  <li><a href="/reglas" className="hover:opacity-70 transition">Reglas</a></li>
                  <li><a href="/soporte" className="hover:opacity-70 transition">Soporte</a></li>
                </ul>
              </div>
              <div className="text-center md:text-right">
                <h5 className="text-sm font-black uppercase mb-3" style={{ color: 'var(--color-text)' }}>Legal</h5>
                <ul className="space-y-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                  <li><a href="/terminos" className="hover:opacity-70 transition">Terminos y Condiciones</a></li>
                  <li><a href="/privacidad" className="hover:opacity-70 transition">Politica de Privacidad</a></li>
                  <li><a href="/contacto" className="hover:opacity-70 transition">Contacto</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t pt-6 text-center" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                © {new Date().getFullYear()} {config.content?.pageTitle || 'Quiniela Mundialista'} - Todos los derechos reservados
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
