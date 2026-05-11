'use client';

import ContentPageLayout from '@/components/ContentPageLayout';
import { useBranding } from '@/contexts/BrandingContext';

export default function ContactoPage() {
  const { config } = useBranding();

  return (
    <ContentPageLayout title="Contacto">
      <div className="space-y-4">
        {config.support?.email && (
          <a
            href={`mailto:${config.support.email}`}
            className="flex items-center gap-3 p-4 rounded-xl border transition hover:opacity-80"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface2)' }}
          >
            <span className="text-xl">✉️</span>
            <div>
              <p className="text-xs font-bold uppercase" style={{ color: 'var(--color-muted)' }}>Email</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{config.support.email}</p>
            </div>
          </a>
        )}
        {config.support?.whatsapp && (
          <a
            href={`https://wa.me/${config.support.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl border transition hover:opacity-80"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface2)' }}
          >
            <span className="text-xl">💬</span>
            <div>
              <p className="text-xs font-bold uppercase" style={{ color: 'var(--color-muted)' }}>WhatsApp</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{config.support.whatsapp}</p>
            </div>
          </a>
        )}
        {config.support?.message && (
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface2)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text)' }}>{config.support.message}</p>
          </div>
        )}
        {!config.support?.email && !config.support?.whatsapp && !config.support?.message && (
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            La información de contacto aún no ha sido configurada.
          </p>
        )}
      </div>
    </ContentPageLayout>
  );
}
