'use client';

import { useState } from 'react';

const copyVariants = {
  emotional: {
    headline: '¡Vive la Pasión del Mundial 2026!',
    subheadline: 'Demuestra que eres el verdadero conocedor del fútbol y gana increíbles premios',
  },
  competitive: {
    headline: '¿Crees que Sabes de Fútbol?',
    subheadline: 'Compite contra miles de aficionados y demuestra quién es el mejor pronosticador',
  },
  prizes: {
    headline: 'Pronostica y Gana Premios Increíbles',
    subheadline: 'Cada acierto te acerca al gran premio. ¡Participa todos los días del Mundial!',
  },
};

export default function Hero() {
  const [variant] = useState<keyof typeof copyVariants>('emotional');
  const copy = copyVariants[variant];

  const handleCTA = (action: string) => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: action });
    }
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    handleCTA('click_how_it_works');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="stadium" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="1" className="text-primary" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="1" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stadium)" />
        </svg>
      </div>



      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">


        <h1 className="text-5xl md:text-7xl font-black text-text mb-6 leading-tight">
          {copy.headline}
        </h1>
        
        <p className="text-xl md:text-2xl text-muted mb-12 max-w-3xl mx-auto">
          {copy.subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/"
            onClick={() => handleCTA('click_register')}
            className="w-full sm:w-auto bg-primary text-primaryText px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-200 inline-block text-center"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primaryText)' }}
          >
            Iniciar Sesión
          </a>
          <a
            href="#como-funciona"
            onClick={(e) => handleSmoothScroll(e, 'como-funciona')}
            className="w-full sm:w-auto bg-surface text-text px-8 py-4 rounded-xl text-lg font-bold border-2 transition-all inline-block text-center"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
          >
            ¿Cómo Funciona?
          </a>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 inline-flex items-center gap-2 bg-surface2 px-6 py-3 rounded-full">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
          </svg>
          <span className="text-muted text-sm">Miles de participantes ya están jugando</span>
        </div>
      </div>
    </section>
  );
}
