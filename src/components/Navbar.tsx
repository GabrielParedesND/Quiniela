'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth/cognito';
import { useBranding } from '@/contexts/BrandingContext';

interface NavbarProps {
  username: string;
  avatarUrl: string;
}

export default function Navbar({ username, avatarUrl }: NavbarProps) {
  const router = useRouter();
  const { config } = useBranding();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!menuRef.current) return;
      const target = event.target as Node;
      if (!menuRef.current.contains(target)) setMenuOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    signOut();
    router.push('/');
  };

  const handleHome = () => {
    router.push('/dashboard');
  };

  const handleEditProfile = () => {
    setMenuOpen(false);
    router.push('/profile');
  };

  return (
    <nav className="text-white shadow-lg z-[70] sticky top-0" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={handleHome}>
          <img src={config.assets.logos.main} alt="Logo" className="w-28 h-auto" />
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="group flex items-center gap-2 rounded-full px-1 py-0.5 transition"
            style={{
              backgroundColor: menuOpen ? 'rgba(255,255,255,0.12)' : 'transparent',
            }}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Abrir menú de usuario"
          >
            <span
              className="text-[11px] font-bold leading-none max-w-[90px] sm:max-w-[180px] truncate text-right"
              style={{ color: 'var(--color-primaryText)' }}
            >
              {username}
            </span>
            <div
              className="w-8 h-8 rounded-full border overflow-hidden flex items-center justify-center shadow-sm"
              style={{ borderColor: 'var(--color-accent)', backgroundColor: 'var(--color-surface2)' }}
            >
              <img src={avatarUrl} className="w-full h-full object-contain p-0.5" alt="Avatar" />
            </div>
            <span
              className={`text-[9px] font-black transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
              style={{ color: 'var(--color-primaryText)' }}
            >
              ▼
            </span>
          </button>

          <div
            className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-sm transition-all duration-200 origin-top-right ${
              menuOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
            }`}
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              zIndex: 90,
            }}
            role="menu"
            aria-label="Opciones de usuario"
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface2)' }}>
              <p className="text-[10px] uppercase font-black tracking-widest" style={{ color: 'var(--color-muted)' }}>
                Cuenta
              </p>
              <p className="text-xs font-bold truncate mt-1" style={{ color: 'var(--color-text)' }}>
                {username}
              </p>
            </div>
            <button
              onClick={handleEditProfile}
              className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest transition flex items-center justify-between hover:opacity-90"
              style={{ color: 'var(--color-text)', backgroundColor: 'var(--color-surface)' }}
              role="menuitem"
            >
              <span>Editar perfil</span>
              <span aria-hidden="true">›</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest transition border-t flex items-center justify-between hover:opacity-90"
              style={{
                color: 'var(--color-danger)',
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
              role="menuitem"
            >
              <span>Salir</span>
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
