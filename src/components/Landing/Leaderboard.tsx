'use client';

import { useEffect, useRef, useState } from 'react';

const mockLeaderboard = [
  { position: 1, name: 'Carlos M.', points: 245, badge: '🥇' },
  { position: 2, name: 'María G.', points: 238, badge: '🥈' },
  { position: 3, name: 'José R.', points: 230, badge: '🥉' },
  { position: 4, name: 'Ana L.', points: 225, badge: '' },
  { position: 5, name: 'Pedro S.', points: 220, badge: '' },
];

export default function Leaderboard() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-text mb-4">
            Ranking en Tiempo Real
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Compite con miles de aficionados. Consulta tu posición y la de los líderes
          </p>
        </div>

        <div className={`max-w-3xl mx-auto transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Leaderboard Card */}
          <div className="bg-bg rounded-xl border-2 border-border overflow-hidden shadow-xl">
            <div className="bg-primary p-4">
              <h3 className="text-xl font-bold text-primaryText text-center">
                Top 5 - Jornada Actual
              </h3>
            </div>

            <div className="divide-y divide-border">
              {mockLeaderboard.map((player) => (
                <div
                  key={player.position}
                  className="flex items-center justify-between p-4 hover:bg-surface2 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface2 rounded-full flex items-center justify-center font-bold text-text border-2 border-border">
                      {player.badge || player.position}
                    </div>
                    <div>
                      <div className="font-bold text-text">{player.name}</div>
                      <div className="text-sm text-muted">Posición #{player.position}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-primary">{player.points}</div>
                    <div className="text-xs text-muted">puntos</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-surface2 p-4 text-center">
              <p className="text-sm text-muted">
                El ranking se actualiza después de cada partido
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-bg p-6 rounded-xl border border-border text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-bold text-text mb-1">Actualización Instantánea</div>
              <div className="text-sm text-muted">Resultados en tiempo real</div>
            </div>
            <div className="bg-bg p-6 rounded-xl border border-border text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-bold text-text mb-1">Categorías</div>
              <div className="text-sm text-muted">Bronce, Plata, Oro, Diamante</div>
            </div>
            <div className="bg-bg p-6 rounded-xl border border-border text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-bold text-text mb-1">Estadísticas</div>
              <div className="text-sm text-muted">Historial completo de aciertos</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
