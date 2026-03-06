'use client';

import { useEffect, useRef, useState } from 'react';

const activations = [
  {
    title: 'Partido destacado',
    badge: '2X',
    description: 'Doble puntuación en el partido destacado de cada jornada',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
      </svg>
    ),
    color: 'blue',
  },
  {
    title: 'Racha ganadora',
    badge: '🎁',
    description: 'Premio instantáneo si aciertas 3 días consecutivos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor" />
      </svg>
    ),
    color: 'violet',
  },
  {
    title: 'Activacion especial',
    badge: '+5',
    description: 'Participa en dinamicas del torneo y suma puntos extra',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: 'emerald',
  },
];

export default function Activations() {
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-flex items-center rounded-full border border-violet-300/40 bg-violet-50 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-violet-700 mb-4">
            Dinámicas especiales
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Activaciones Especiales
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Mas formas de ganar puntos y premios durante el Mundial
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activations.map((activation, index) => (
            <div
              key={index}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              data-index={index}
              className={`relative group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 ${
                visibleCards.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Badge */}
              <div className="absolute top-4 right-4 rounded-full bg-slate-900 px-3 py-1 text-sm font-bold text-white">
                {activation.badge}
              </div>

              {/* Icon */}
              <div
                className={`inline-flex h-20 w-20 items-center justify-center rounded-2xl mb-6 transition-transform group-hover:scale-110 ${
                  activation.color === 'blue'
                    ? 'bg-blue-100 text-blue-600'
                    : activation.color === 'violet'
                      ? 'bg-violet-100 text-violet-600'
                      : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                {activation.icon}
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-3">{activation.title}</h3>
              <p className="text-slate-600 leading-relaxed">{activation.description}</p>

              {/* Decorative Element */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/8 rounded-full group-hover:scale-150 transition-transform duration-500" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-2xl border border-cyan-300/30 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-3">
              No te pierdas ninguna activacion
            </h3>
            <p className="text-slate-200 mb-6">
              Revisa las novedades de la jornada para aprovechar cada oportunidad de sumar puntos
            </p>
            <a
              href="/"
              className="inline-block rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-3 font-black text-slate-900 transition-all shadow-md hover:scale-[1.02]"
            >
              Ir al inicio
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
