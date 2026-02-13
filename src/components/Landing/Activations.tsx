'use client';

import { useEffect, useRef, useState } from 'react';

const activations = [
  {
    title: 'Partido Gallo',
    badge: '2X',
    description: 'Doble puntuación en el partido destacado de cada jornada',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
      </svg>
    ),
    color: 'primary',
  },
  {
    title: 'Canta el Gallo',
    badge: '🎁',
    description: 'Premio instantáneo si aciertas 3 días consecutivos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor" />
      </svg>
    ),
    color: 'accent',
  },
  {
    title: 'Activación en Tienda',
    badge: '+5',
    description: 'Escanea QR en tiendas participantes y gana puntos extra',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: 'primary',
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
    <section className="py-20 bg-bg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-text mb-4">
            Activaciones Especiales
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Más formas de ganar puntos y premios durante el Mundial
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activations.map((activation, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              data-index={index}
              className={`relative bg-surface p-8 rounded-xl border-2 border-border hover:border-primary transition-all duration-500 hover:shadow-2xl group overflow-hidden ${
                visibleCards.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Badge */}
              <div className="absolute top-4 right-4 bg-primary text-primaryText px-3 py-1 rounded-full text-sm font-bold">
                {activation.badge}
              </div>

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-20 h-20 bg-${activation.color}/10 rounded-full mb-6 text-${activation.color} group-hover:scale-110 transition-transform`}>
                {activation.icon}
              </div>

              <h3 className="text-2xl font-bold text-text mb-3">{activation.title}</h3>
              <p className="text-muted leading-relaxed">{activation.description}</p>

              {/* Decorative Element */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-surface p-8 rounded-xl border-2 border-primary">
            <h3 className="text-2xl font-bold text-text mb-3">
              ¡No Te Pierdas Ninguna Activación!
            </h3>
            <p className="text-muted mb-6">
              Mantente atento al diario y a nuestras redes sociales para conocer las activaciones del día
            </p>
            <a
              href="/"
              className="inline-block px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primaryText)' }}
            >
              Iniciar Sesión
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
