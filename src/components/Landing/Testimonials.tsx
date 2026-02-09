'use client';

import { useEffect, useRef, useState } from 'react';

const testimonials = [
  {
    name: 'Roberto M.',
    location: 'Guatemala',
    quote: 'Gané una TV en la segunda semana. ¡No podía creerlo! Ahora participo todos los días.',
    prize: 'Smart TV 55"',
    avatar: 'RM',
  },
  {
    name: 'Lucía P.',
    location: 'Quetzaltenango',
    quote: 'Es muy fácil participar desde el celular. Ya llevo 3 premios semanales acumulados.',
    prize: 'Cupones y productos',
    avatar: 'LP',
  },
  {
    name: 'Miguel A.',
    location: 'Escuintla',
    quote: 'La emoción de ver el ranking actualizarse después de cada partido es increíble.',
    prize: 'Certificado de regalo',
    avatar: 'MA',
  },
];

const videos = [
  {
    title: 'El Gallo recomienda el partido del día',
    duration: '1:30',
    thumbnail: 'video1',
  },
  {
    title: 'Así ganó Carlos su refrigeradora',
    duration: '2:15',
    thumbnail: 'video2',
  },
  {
    title: 'Tips para acumular más puntos',
    duration: '1:45',
    thumbnail: 'video3',
  },
];

export default function Testimonials() {
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
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-text mb-4">
            Historias de Ganadores
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Miles de personas ya están ganando. ¡Tú puedes ser el próximo!
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              data-index={index}
              className={`bg-bg p-6 rounded-xl border-2 border-border hover:border-primary transition-all duration-500 ${
                visibleCards.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-primaryText font-bold text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-text">{testimonial.name}</div>
                  <div className="text-sm text-muted">{testimonial.location}</div>
                </div>
              </div>
              
              <p className="text-muted italic mb-4">"{testimonial.quote}"</p>
              
              <div className="flex items-center gap-2 text-sm">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-accent">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                </svg>
                <span className="text-accent font-medium">Ganó: {testimonial.prize}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Videos */}
        <div>
          <h3 className="text-2xl font-bold text-text text-center mb-8">
            Videos Destacados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <div
                key={index}
                className="group cursor-pointer"
              >
                <div className="relative bg-surface2 rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-all duration-300 aspect-video mb-3">
                  {/* Video Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-primaryText ml-1">
                        <path d="M5 3L19 12L5 21V3Z" fill="currentColor" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 bg-bg/90 px-2 py-1 rounded text-xs font-bold text-text">
                    {video.duration}
                  </div>
                </div>
                <h4 className="font-bold text-text group-hover:text-primary transition-colors">
                  {video.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
