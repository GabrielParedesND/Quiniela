'use client';

/**
 * Lateral ad spaces for the landing page.
 * 
 * Renders two fixed-position ad containers on left and right sides.
 * Container IDs: "ad-container-lateral-left" and "ad-container-lateral-right"
 * for Google Ad Manager targeting.
 * 
 * - Desktop: visible as sticky sidebars
 * - Mobile: hidden (following UX best practices)
 * - When AD_SCRIPT_ENABLED=true: renders empty containers for Ad Manager
 * - When AD_SCRIPT_ENABLED=false: shows lateral ad images
 */

const AD_SCRIPT_ENABLED = process.env.NEXT_PUBLIC_AD_SCRIPT_ENABLED === 'true';

const LEFT_AD = {
  imageUrl: '/assets/ADS/LATERAL/BANNER ANUNCIO 160X600.svg',
  redirectUrl: 'https://www.nuestrodiario.com',
  label: 'Anuncio lateral izquierdo',
};

const RIGHT_AD = {
  imageUrl: '/assets/ADS/LATERAL/BANNER ANUNCIO 160X600.svg',
  redirectUrl: 'https://www.nuestrodiario.com',
  label: 'Anuncio lateral derecho',
};

function AdSidebarSlot({ id, ad, side }: {
  id: string;
  ad: { imageUrl: string; redirectUrl: string; label: string };
  side: 'left' | 'right';
}) {
  if (AD_SCRIPT_ENABLED) {
    return (
      <div
        id={id}
        className="hidden 2xl:block fixed top-1/2 -translate-y-1/2 z-30"
        style={{ [side]: '8px', width: '160px', minHeight: '600px' }}
      />
    );
  }

  const content = (
    <img
      src={ad.imageUrl}
      alt={ad.label}
      className="w-full rounded-lg shadow-lg object-cover"
      style={{ width: '160px', height: '600px' }}
      loading="lazy"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );

  return (
    <div
      id={id}
      className="hidden 2xl:block fixed top-1/2 -translate-y-1/2 z-30"
      style={{ [side]: '8px', width: '160px', height: '600px' }}
    >
      {ad.redirectUrl ? (
        <a
          href={ad.redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
          aria-label={ad.label}
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

export default function AdSidebars() {
  return (
    <>
      <AdSidebarSlot id="ad-container-lateral-left" ad={LEFT_AD} side="left" />
      <AdSidebarSlot id="ad-container-lateral-right" ad={RIGHT_AD} side="right" />
    </>
  );
}
