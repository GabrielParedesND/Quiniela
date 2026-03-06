'use client';

import { useEffect, useRef, useState } from 'react';

const scoringRules = [
  { points: 5, label: 'Resultado Correcto', description: 'Aciertas ganador o empate' },
  { points: 3, label: 'Marcador Exacto', description: 'Puntos extra por marcador preciso' },
  { points: 2, label: 'Partido Destacado', description: 'Bonus en partidos destacados' },
];

const prizes = {
  weekly: [
    'Cupones de descuento',
    'Certificados de regalo',
    'Productos exclusivos',
    'Merchandising oficial',
  ],
  top: [
    'Televisores Smart TV',
    'Refrigeradoras',
    'Electrodomésticos',
    'Experiencias VIP',
  ],
};

export default function Scoring() {
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

  const handlePrizesClick = () => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: 'click_prizes' });
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-flex items-center rounded-full border border-amber-300/40 bg-amber-50 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-700 mb-4">
            Sistema de puntos
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Puntuación y Premios
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Cada acierto se transforma en ventaja competitiva. Mientras más preciso seas, más cerca estás de llevarte premios grandes.
          </p>
        </div>

        {/* Scoring Rules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {scoringRules.map((rule, index) => (
            <div
              key={index}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              data-index={index}
              className={`rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 ${
                visibleCards.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-lg">
                <span className="text-4xl font-black text-white">+{rule.points}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{rule.label}</h3>
              <p className="text-slate-600">{rule.description}</p>
            </div>
          ))}
        </div>

        {/* Prizes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" onClick={handlePrizesClick}>
          {/* Weekly Prizes */}
          <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-accent">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
              </svg>
              <h3 className="text-2xl font-bold text-slate-900">Premios Semanales</h3>
            </div>
            <ul className="space-y-3">
              {prizes.weekly.map((prize, index) => (
                <li key={index} className="flex items-center gap-3 text-slate-600">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-accent flex-shrink-0">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {prize}
                </li>
              ))}
            </ul>
          </div>

          {/* Top Prizes */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 rounded-2xl border border-cyan-300/25 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-cyan-300">
                <path d="M12 2L2 7V11C2 16.55 6.84 21.74 12 23C17.16 21.74 22 16.55 22 11V7L12 2Z" fill="currentColor" />
              </svg>
              <h3 className="text-2xl font-bold text-white">Premios Top</h3>
            </div>
            <ul className="space-y-3">
              {prizes.top.map((prize, index) => (
                <li key={index} className="flex items-center gap-3 text-slate-100 font-medium">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-cyan-300 flex-shrink-0">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {prize}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Grand Prize */}
        <div className="mt-8 p-8 rounded-2xl border border-amber-300/35 text-center bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-bg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
            </svg>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-2">Gran Premio Final</h3>
          <p className="text-xl text-orange-600 font-bold mb-2">¡Equipa Toda Tu Casa!</p>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            * Premios sujetos a términos y condiciones. Consulta bases completas en nuestro sitio web.
          </p>
        </div>
      </div>
    </section>
  );
}
