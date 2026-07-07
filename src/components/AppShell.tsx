'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { isProfileAvatarOption } from '@/lib/assets';
import { useBranding } from '@/contexts/BrandingContext';
import AdSpace from './AdSpace';
import Navbar from './Navbar';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { user } = useUser();
  const { config } = useBranding();
  const [bgLoaded, setBgLoaded] = useState(() => {
    // Check if image is already cached from a previous render
    if (typeof window !== 'undefined') {
      const img = new Image();
      img.src = config.assets.backgrounds.dashboard;
      return img.complete;
    }
    return false;
  });

  useEffect(() => {
    const img = new Image();
    img.src = config.assets.backgrounds.dashboard;
    img.onload = () => setBgLoaded(true);
    // If image is already cached, mark as loaded immediately
    if (img.complete) setBgLoaded(true);
  }, [config.assets.backgrounds.dashboard]);

  const fullName = user ? `${user.nombres} ${user.apellidos}` : 'Usuario';
  const avatarUrl = user?.avatar && isProfileAvatarOption(user.avatar)
    ? user.avatar
    : '/assets/PROFILE/unknown-football-shirt-svgrepo-com.svg';

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: 'var(--color-bg, #f1f5f9)' }}>
      {/* Background image - fixed, behind content */}
      <img
        src={config.assets.backgrounds.dashboard}
        alt=""
        aria-hidden="true"
        className="fixed inset-0 w-full h-full object-cover object-top transition-opacity duration-700 pointer-events-none"
        style={{ opacity: bgLoaded ? 1 : 0, zIndex: 0 }}
      />

      {/* All content above background */}
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>
        <Navbar username={fullName} avatarUrl={avatarUrl} />
        {/* <AdSpace /> */}
        <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
        <footer className="py-8 px-4 mt-auto relative overflow-hidden" style={{ backgroundColor: 'var(--color-surface2)' }}>
          <img
            src="/assets/LAYOUT/footer.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          <div className="relative max-w-4xl mx-auto sm:px-4 text-white">
            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <img src={config.assets.logos.large} alt="Logo" className="w-32 h-auto mb-3" />
            </div>
            
            {/* Bottom bar */}
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
