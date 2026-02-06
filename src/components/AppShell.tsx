'use client';

import { ReactNode } from 'react';
import { useUser } from '@/contexts/UserContext';
import SponsorBanner from './SponsorBanner';
import Navbar from './Navbar';

interface AppShellProps {
  children: ReactNode;
  onAvatarClick?: () => void;
}

export default function AppShell({ children, onAvatarClick }: AppShellProps) {
  const { user } = useUser();

  const fullName = user ? `${user.nombres} ${user.apellidos}` : 'Usuario';
  const avatarUrl = user 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0284c7&color=fff`
    : 'https://ui-avatars.com/api/?name=U&background=0284c7&color=fff';

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <SponsorBanner />
      <Navbar username={fullName} avatarUrl={avatarUrl} onAvatarClick={onAvatarClick} />
      <main className="flex-grow w-full max-w-4xl mx-auto p-4 relative">
        {children}
      </main>
      <footer className="bg-slate-900 text-slate-500 py-10 px-4 mt-auto">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex justify-center space-x-2">
            <span className="text-white text-xl">🏆</span>
            <h4 className="font-bold text-white uppercase italic tracking-tighter self-center">
              Copa Mundial 2026
            </h4>
          </div>
          <p className="text-[8px] leading-relaxed uppercase opacity-50 tracking-widest">
            USA 2026 • Plataforma de Quinielas
          </p>
        </div>
      </footer>
    </div>
  );
}
