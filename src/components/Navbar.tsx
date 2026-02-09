'use client';

import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth/cognito';
import ImagePlaceholder from './ImagePlaceholder';

interface NavbarProps {
  username: string;
  avatarUrl: string;
  onAvatarClick?: () => void;
}

export default function Navbar({ username, avatarUrl, onAvatarClick }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    signOut();
    router.push('/');
  };

  const handleHome = () => {
    router.push('/dashboard');
  };

  return (
    <nav className="text-white shadow-lg z-50 sticky top-20" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={handleHome}>
          <ImagePlaceholder width={40} height={40} label="LOGO" tooltipPosition="right" />
          <h1 className="font-bold text-lg tracking-tight italic uppercase" style={{ color: 'var(--color-primaryText)' }}>
            Copa<span className="font-light not-italic">Mundial</span>
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex flex-col items-end mr-1">
            <span className="text-[11px] font-bold opacity-90 leading-none" style={{ color: 'var(--color-primaryText)' }}>{username}</span>
            <button 
              onClick={handleLogout}
              className="text-[8px] hover:opacity-80 transition uppercase font-black tracking-tighter"
              style={{ color: 'var(--color-accent)' }}
            >
              Salir
            </button>
          </div>
          <div 
            className="w-8 h-8 rounded-full border overflow-hidden cursor-pointer"
            style={{ borderColor: 'var(--color-accent)', backgroundColor: 'var(--color-surface2)' }}
            onClick={onAvatarClick}
          >
            <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
          </div>
        </div>
      </div>
    </nav>
  );
}
