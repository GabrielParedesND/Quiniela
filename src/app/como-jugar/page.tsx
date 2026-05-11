'use client';

import ContentPageLayout from '@/components/ContentPageLayout';
import { useBranding } from '@/contexts/BrandingContext';

export default function ComoJugarPage() {
  const { config } = useBranding();
  const content = config.legal?.howToPlay;

  return (
    <ContentPageLayout title="Cómo Jugar">
      {content ? (
        <div className="prose prose-sm max-w-full" style={{ color: 'var(--color-text)', overflowWrap: 'break-word', wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-3xl mb-2">📄</span>
          <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>Proximamente...</p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--color-muted)' }}>Este contenido estara disponible pronto.</p>
        </div>
      )}
    </ContentPageLayout>
  );
}
