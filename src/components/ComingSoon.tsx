'use client';

import { useBranding } from '@/contexts/BrandingContext';

export default function ComingSoon() {
  const { config } = useBranding();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--color-bg, #0f172a)' }}
    >
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        {config.assets?.logos?.large ? (
          <img
            src={config.assets.logos.large}
            alt="Logo"
            className="w-48 h-auto mx-auto opacity-80"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="text-5xl">⚽</div>
        )}

        {/* Main message */}
        <div className="space-y-3">
          <h1
            className="text-3xl font-black tracking-tight"
            style={{ color: 'var(--color-text, #f8fafc)' }}
          >
            Próximamente
          </h1>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-muted, #94a3b8)' }}
          >
            Estamos preparando una nueva quiniela para ti.
            Vuelve pronto para participar, predecir resultados y ganar premios.
          </p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-12" style={{ backgroundColor: 'var(--color-border, #334155)' }} />
          <span className="text-lg">🏆</span>
          <div className="h-px w-12" style={{ backgroundColor: 'var(--color-border, #334155)' }} />
        </div>

        {/* Footer note */}
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: 'var(--color-muted, #64748b)' }}
        >
          Mantente atento
        </p>
      </div>
    </div>
  );
}
