'use client';

import { useEffect } from 'react';
import { useBranding } from '@/contexts/BrandingContext';

export default function BrandingMetaUpdater() {
  const { config } = useBranding();

  useEffect(() => {
    const title = config.meta.appTitle?.trim();
    const description = config.meta.appDescription?.trim();

    if (title) document.title = title;

    if (!description) return;
    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.setAttribute('name', 'description');
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.setAttribute('content', description);
  }, [config.meta.appTitle, config.meta.appDescription]);

  return null;
}
