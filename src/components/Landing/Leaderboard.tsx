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
    <section ref={sectionRef} className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-flex items-center rounded-full border border-cyan-300/40 bg-cyan-50 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 mb-4">
            Competencia en vivo
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Ranking en Tiempo Real
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Compite con miles de aficionados. Consulta tu posición y la de los líderes
          </p>
        </div>

        <div className={`max-w-3xl mx-auto transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Leaderboard Card */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xl bg-white">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4">
              <h3 className="text-xl font-bold text-white text-center">
                Top 5 - Jornada Actual
              </h3>
            </div>

            <div className="divide-y divide-slate-200">
              {mockLeaderboard.map((player) => (
                <div
                  key={player.position}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-900 border border-slate-200">
                      {player.badge || player.position}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{player.name}</div>
                      <div className="text-sm text-slate-500">Posición #{player.position}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-primary">{player.points}</div>
                    <div className="text-xs text-slate-500">puntos</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-600">
                El ranking se actualiza después de cada partido
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center shadow-sm">
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-bold text-slate-900 mb-1">Actualización Instantánea</div>
              <div className="text-sm text-slate-600">Resultados en tiempo real</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center shadow-sm">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-bold text-slate-900 mb-1">Categorías</div>
              <div className="text-sm text-slate-600">Bronce, Plata, Oro, Diamante</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center shadow-sm">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-bold text-slate-900 mb-1">Estadísticas</div>
              <div className="text-sm text-slate-600">Historial completo de aciertos</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
