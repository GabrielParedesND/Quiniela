'use client';

import ContentPageLayout from '@/components/ContentPageLayout';
import { useBranding } from '@/contexts/BrandingContext';

export default function SoportePage() {
  const { config } = useBranding();
  const content = config.legal?.supportInfo;

  return (
    <ContentPageLayout title="Soporte">
      {content ? (
        <div className="prose prose-sm max-w-full mb-6" style={{ color: 'var(--color-text)', overflowWrap: 'break-word', wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: content }} />
      ) : null}

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
        {!config.support?.email && !config.support?.whatsapp && !content && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="text-3xl mb-2">📞</span>
            <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>Proximamente...</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--color-muted)' }}>La informacion de soporte estara disponible pronto.</p>
          </div>
        )}
      </div>
    </ContentPageLayout>
  );
}
