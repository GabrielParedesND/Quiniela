'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from '@/lib/auth/cognito';
import { useBranding } from '@/contexts/BrandingContext';

interface NavbarProps {
  username: string;
  avatarUrl: string;
}

const NAV_LINKS = [
  { label: 'Inicio', href: '/dashboard' },
  { label: 'Pronósticos', href: '/predictions' },
  { label: 'Resultados', href: '/results' },
  { label: 'Grupos', href: '/groups' },
];

const MORE_LINKS = [
  { label: 'Posiciones de Equipos', href: '/teams' },
];

export default function Navbar({ username, avatarUrl }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { config } = useBranding();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false);
      if (moreRef.current && !moreRef.current.contains(target)) setMoreOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); setMoreOpen(false); }
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

  const handleEditProfile = () => {
    setMenuOpen(false);
    router.push('/profile');
  };

  const navigate = (href: string) => {
    setMoreOpen(false);
    router.push(href);
  };

  return (
    <nav className="text-white shadow-lg z-[70] sticky top-0 relative" style={{ backgroundColor: 'var(--color-primary)' }}>
      {/* Background image */}
      <img
        src="/assets/LAYOUT/header.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-none"
        style={{ clipPath: 'inset(0)' }}
      />
      <div className="relative max-w-4xl mx-auto px-3 py-1 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center cursor-pointer shrink-0" onClick={() => router.push('/dashboard')}>
          <img src={config.assets.logos.main} alt="Logo" className="w-20 h-auto" />
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <button
                key={link.label}
                onClick={() => navigate(link.href)}
                className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
                style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: 'var(--color-primaryText)',
                  opacity: isActive ? 1 : 0.8,
                }}
              >
                <span>{link.label}</span>
              </button>
            );
          })}

          {/* More dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((p) => !p)}
              className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
              style={{
                backgroundColor: moreOpen ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: 'var(--color-primaryText)',
                opacity: 0.8,
              }}
            >
              <span>Más</span>
              <span className={`text-[8px] transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            <div
              className={`absolute right-0 mt-2 w-44 rounded-xl border shadow-xl overflow-hidden transition-all duration-200 origin-top-right ${
                moreOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
              }`}
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', zIndex: 100 }}
            >
              {MORE_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.href)}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 hover:opacity-80"
                  style={{ color: 'var(--color-text)' }}
                >
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="group flex items-center gap-2 rounded-full pl-3 pr-1.5 py-1 transition"
            style={{ backgroundColor: menuOpen ? 'rgba(255,255,255,0.12)' : 'transparent' }}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Abrir menú de usuario"
          >
            {/* Name */}
            <span className="text-[11px] font-bold max-w-[90px] sm:max-w-[120px] truncate text-right" style={{ color: 'var(--color-primaryText)' }}>
              {username}
            </span>
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full border-2 overflow-hidden flex items-center justify-center"
              style={{ borderColor: 'var(--color-accent)', backgroundColor: 'var(--color-surface2)' }}
            >
              <img src={avatarUrl} className="w-full h-full object-contain p-0.5" alt="Avatar" />
            </div>
            {/* Dropdown arrow */}
            <span
              className={`text-[8px] font-black transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
              style={{ color: 'var(--color-primaryText)' }}
            >
              ▼
            </span>
          </button>

          {/* User dropdown */}
          <div
            className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-sm transition-all duration-200 origin-top-right ${
              menuOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
            }`}
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', zIndex: 100 }}
            role="menu"
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface2)' }}>
              <p className="text-[10px] uppercase font-black tracking-widest" style={{ color: 'var(--color-muted)' }}>Cuenta</p>
              <p className="text-xs font-bold truncate mt-1" style={{ color: 'var(--color-text)' }}>{username}</p>
            </div>

            {/* Mobile-only nav links inside menu */}
            <div className="md:hidden border-b" style={{ borderColor: 'var(--color-border)' }}>
              {[...NAV_LINKS, ...MORE_LINKS].map((link) => (
                <button
                  key={link.label}
                  onClick={() => { setMenuOpen(false); navigate(link.href); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 hover:opacity-80"
                  style={{ color: 'var(--color-text)' }}
                  role="menuitem"
                >
                  <span>{link.label}</span>
                </button>
              ))}
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
              style={{ color: 'var(--color-danger)', borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
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
