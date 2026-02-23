'use client';

import { useEffect, useRef, useState } from 'react';

const scoringRules = [
  { points: 5, label: 'Resultado Correcto', description: 'Aciertas ganador o empate' },
  { points: 3, label: 'Marcador Exacto', description: 'Puntos extra por marcador preciso' },
  { points: 2, label: 'Partido Gallo', description: 'Bonus en partidos destacados' },
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
    <section className="py-20 bg-bg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-text mb-4">
            Puntuación y Premios
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Cada acierto suma. Acumula puntos semanalmente y gana increíbles premios
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
              className={`bg-surface p-8 rounded-xl border-2 border-border text-center hover:border-primary transition-all duration-500 hover:shadow-xl ${
                visibleCards.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-4">
                <span className="text-4xl font-black text-primaryText">+{rule.points}</span>
              </div>
              <h3 className="text-xl font-bold text-text mb-2">{rule.label}</h3>
              <p className="text-muted">{rule.description}</p>
            </div>
          ))}
        </div>

        {/* Prizes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" onClick={handlePrizesClick}>
          {/* Weekly Prizes */}
          <div className="bg-surface2 p-8 rounded-xl border-2 border-border">
            <div className="flex items-center gap-3 mb-6">
              <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-accent">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
              </svg>
              <h3 className="text-2xl font-bold text-text">Premios Semanales</h3>
            </div>
            <ul className="space-y-3">
              {prizes.weekly.map((prize, index) => (
                <li key={index} className="flex items-center gap-3 text-muted">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-accent flex-shrink-0">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {prize}
                </li>
              ))}
            </ul>
          </div>

          {/* Top Prizes */}
          <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-8 rounded-xl border-2 border-primary">
            <div className="flex items-center gap-3 mb-6">
              <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-primary">
                <path d="M12 2L2 7V11C2 16.55 6.84 21.74 12 23C17.16 21.74 22 16.55 22 11V7L12 2Z" fill="currentColor" />
              </svg>
              <h3 className="text-2xl font-bold text-text">Premios Top</h3>
            </div>
            <ul className="space-y-3">
              {prizes.top.map((prize, index) => (
                <li key={index} className="flex items-center gap-3 text-text font-medium">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-primary flex-shrink-0">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {prize}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Grand Prize */}
        <div className="mt-8 bg-surface p-8 rounded-xl border-2 border-accent text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-full mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-bg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
            </svg>
          </div>
          <h3 className="text-3xl font-black text-text mb-2">Gran Premio Final</h3>
          <p className="text-xl text-accent font-bold mb-2">¡Equipa Toda Tu Casa!</p>
          <p className="text-sm text-muted max-w-2xl mx-auto">
            * Premios sujetos a términos y condiciones. Consulta bases completas en nuestro sitio web.
          </p>
        </div>
      </div>
    </section>
  );
}
