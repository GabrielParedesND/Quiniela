'use client';

import { useEffect } from 'react';
import { useBranding } from '@/contexts/BrandingContext';

/**
 * Component that applies background image from branding config
 * to the document body
 */
export default function BackgroundImage() {
  const { config } = useBranding();

  useEffect(() => {
    const backgroundUrl = config.assets?.backgrounds?.main;
    
    if (backgroundUrl && typeof document !== 'undefined') {
      document.body.style.backgroundImage = `url('${backgroundUrl}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundRepeat = 'no-repeat';
    } else {
      // Clear background if no image is set
      document.body.style.backgroundImage = '';
    }

    // Cleanup function
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.backgroundImage = '';
      }
    };
  }, [config.assets?.backgrounds?.main]);

  return null;
}
