'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { brandAssets } from '@/lib/assets';
import SponsorBanner from './SponsorBanner';
import Navbar from './Navbar';

interface AppShellProps {
  children: ReactNode;
  onAvatarClick?: () => void;
}

export default function AppShell({ children, onAvatarClick }: AppShellProps) {
  const { user } = useUser();
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = brandAssets.backgrounds.dashboard;
    img.onload = () => setBgLoaded(true);
  }, []);

  const fullName = user ? `${user.nombres} ${user.apellidos}` : 'Usuario';
  const avatarUrl = user 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0284c7&color=fff`
    : 'https://ui-avatars.com/api/?name=U&background=0284c7&color=fff';

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: 'var(--color-bg, #f1f5f9)' }}>
      {/* Background image - fixed, behind content */}
      <img
        src={brandAssets.backgrounds.dashboard}
        alt=""
        aria-hidden="true"
        className="fixed inset-0 w-full h-full object-cover object-top transition-opacity duration-700 pointer-events-none"
        style={{ opacity: bgLoaded ? 1 : 0, zIndex: 0 }}
      />

      {/* All content above background */}
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>
        <Navbar username={fullName} avatarUrl={avatarUrl} onAvatarClick={onAvatarClick} />
        <SponsorBanner />
        <main className="flex-grow w-full max-w-4xl mx-auto p-4">
          {children}
        </main>
        <footer className="text-white py-12 px-4 mt-auto" style={{ backgroundColor: 'var(--color-surface2)' }}>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center md:text-left">
                <img src={brandAssets.logos.large} alt="Logo" className="w-40 h-auto mx-auto md:mx-0 mb-4" />
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  La plataforma oficial de quinielas para la Copa Mundial 2026
                </p>
              </div>
              
              <div className="text-center">
                <h5 className="text-sm font-black uppercase mb-3" style={{ color: 'var(--color-text)' }}>Enlaces</h5>
                <ul className="space-y-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                  <li><a href="#" className="hover:opacity-70 transition">Cómo Jugar</a></li>
                  <li><a href="#" className="hover:opacity-70 transition">Premios</a></li>
                  <li><a href="#" className="hover:opacity-70 transition">Reglas</a></li>
                  <li><a href="#" className="hover:opacity-70 transition">Soporte</a></li>
                </ul>
              </div>
              
              <div className="text-center md:text-right">
                <h5 className="text-sm font-black uppercase mb-3" style={{ color: 'var(--color-text)' }}>Legal</h5>
                <ul className="space-y-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                  <li><a href="#" className="hover:opacity-70 transition">Términos y Condiciones</a></li>
                  <li><a href="#" className="hover:opacity-70 transition">Política de Privacidad</a></li>
                  <li><a href="#" className="hover:opacity-70 transition">Contacto</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t pt-6 text-center" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                © 2024 Copa Mundial 2026 • Todos los derechos reservados
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
