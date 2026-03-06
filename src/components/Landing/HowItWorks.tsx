'use client';

import { useEffect, useRef, useState } from 'react';

const steps = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M8 3V21M16 3V21M3 8H21M3 16H21" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    title: 'Ingresa a la plataforma',
    description: 'Accede desde tu dispositivo para ver la jornada y los partidos disponibles',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="8" y="8" width="8" height="8" fill="currentColor" />
      </svg>
    ),
    title: 'Inicia sesión',
    description: 'Entra con tu cuenta y deja todo listo para comenzar a pronosticar',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    title: 'Completa tu perfil',
    description: 'Configura tus datos una sola vez y continua participando sin friccion',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Haz tu Pronóstico',
    description: 'Elige ganador o empate. Marca el resultado exacto para puntos extra',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
      </svg>
    ),
    title: 'Acumula puntos',
    description: '5 pts por resultado correcto, +3 por marcador exacto, +2 en partido destacado',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M7 8H17M7 12H17M7 16H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Sigue el Ranking',
    description: 'Consulta tu posición en tiempo real y compite con otros aficionados',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" />
        <path d="M12 3L8 7H16L12 3Z" fill="currentColor" />
      </svg>
    ),
    title: '¡Gana Premios!',
    description: 'Premios semanales y el gran premio final. ¡Cada acierto cuenta!',
  },
];

export default function HowItWorks() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setVisibleCards((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.1 }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="como-funciona" className="relative py-20 bg-slate-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/10 to-transparent" />
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
            Mecánica rápida
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            ¿Cómo Funciona?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            En menos de un minuto ya estas participando. Este flujo esta disenado para entrar, pronosticar y competir sin friccion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              data-index={index}
              className={`group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 ${
                visibleCards.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
                {index + 1}
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-primary group-hover:from-primary group-hover:to-accent group-hover:text-white transition-all">
                    {step.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-2">Paso {index + 1}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            * Los pronosticos deben realizarse antes del inicio de cada partido segun calendario oficial
          </p>
        </div>
      </div>
    </section>
  );
}
