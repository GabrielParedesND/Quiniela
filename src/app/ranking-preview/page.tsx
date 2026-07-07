'use client';

import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';

// Mock data for preview
const mockUsers = [
  { name: 'Carlos Mendoza', pts: 85, phase: 'Cita con la Historia', exacts: 8 },
  { name: 'Ana Rodriguez', pts: 78, phase: 'Duelo de Gigantes', exacts: 7 },
  { name: 'Luis Hernandez', pts: 72, phase: 'Duelo de Gigantes', exacts: 6 },
  { name: 'Maria Lopez', pts: 65, phase: 'Zona de Campeones', exacts: 5 },
  { name: 'Pedro Garcia', pts: 60, phase: 'Zona de Campeones', exacts: 5 },
  { name: 'Sofia Martinez', pts: 55, phase: 'Zona de Campeones', exacts: 4 },
  { name: 'Diego Ramirez', pts: 52, phase: 'Zona de Campeones', exacts: 4 },
  { name: 'Lucia Morales', pts: 48, phase: 'Zona de Campeones', exacts: 3 },
  { name: 'Fernando Diaz', pts: 45, phase: 'Zona de Campeones', exacts: 3 },
  { name: 'Camila Flores', pts: 42, phase: 'Zona de Campeones', exacts: 3 },
  { name: 'Roberto Cruz', pts: 38, phase: 'Inicio del Camino', exacts: 2 },
  { name: 'Andrea Soto', pts: 35, phase: 'Inicio del Camino', exacts: 2 },
  { name: 'Miguel Torres', pts: 32, phase: 'Inicio del Camino', exacts: 2 },
  { name: 'Valentina Rios', pts: 28, phase: 'Inicio del Camino', exacts: 1 },
  { name: 'Juan Perez', pts: 25, phase: 'Inicio del Camino', exacts: 1 },
  { name: 'Carolina Vega', pts: 22, phase: 'Inicio del Camino', exacts: 1 },
  { name: 'Andres Castillo', pts: 20, phase: 'Inicio del Camino', exacts: 1 },
  { name: 'Daniela Ramos', pts: 18, phase: 'Inicio del Camino', exacts: 0 },
  { name: 'Gabriel Paredes (Tu)', pts: 15, phase: 'Inicio del Camino', exacts: 1 },
  { name: 'Oscar Monzon', pts: 12, phase: 'Inicio del Camino', exacts: 0 },
];

const userPosition = 19;

function getMedalEmoji(pos: number): string {
  if (pos === 1) return '🥇';
  if (pos === 2) return '🥈';
  if (pos === 3) return '🥉';
  return '';
}

function getRowStyle(pos: number, isMe: boolean) {
  if (isMe) {
    return {
      background: 'linear-gradient(90deg, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.02) 100%)',
      borderLeft: '3px solid var(--color-primary)',
    };
  }
  if (pos <= 3) {
    return {
      background: pos === 1
        ? 'linear-gradient(90deg, rgba(255,215,0,0.08) 0%, transparent 100%)'
        : pos === 2
        ? 'linear-gradient(90deg, rgba(192,192,192,0.08) 0%, transparent 100%)'
        : 'linear-gradient(90deg, rgba(205,127,50,0.06) 0%, transparent 100%)',
      borderLeft: 'none',
    };
  }
  return {};
}

function getPositionStyle(pos: number) {
  if (pos === 1) return { color: '#B8860B', fontWeight: 900, fontSize: '14px' };
  if (pos === 2) return { color: '#6B7280', fontWeight: 900, fontSize: '13px' };
  if (pos === 3) return { color: '#92400E', fontWeight: 900, fontSize: '13px' };
  if (pos <= 10) return { color: 'var(--color-primary)', fontWeight: 800, fontSize: '12px' };
  return { color: 'var(--color-muted)', fontWeight: 700, fontSize: '11px' };
}

function getPointsBarWidth(pts: number, maxPts: number) {
  return maxPts > 0 ? Math.max((pts / maxPts) * 100, 4) : 4;
}

export default function RankingPreviewPage() {
  const maxPts = mockUsers[0]?.pts || 1;

  return (
    <AppShell>
      <section className="space-y-4 pb-8">
        <PageHeader title="Ranking Global" showBackButton backTo="/results" />

        {/* Stats bar */}
        <div className="flex gap-2">
          <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-black" style={{ color: 'var(--color-primary)' }}>#{userPosition}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Tu posicion</p>
          </div>
          <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-black" style={{ color: 'var(--color-text)' }}>15</p>
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Tus puntos</p>
          </div>
          <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-black" style={{ color: 'var(--color-text)' }}>{mockUsers.length}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Participantes</p>
          </div>
        </div>

        {/* Ranking table - unified, clean, competitive */}
        <div
          className="rounded-2xl border overflow-hidden shadow-sm"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {/* Table rows */}
          {mockUsers.map((u, i) => {
            const pos = i + 1;
            const isMe = u.name.includes('(Tu)');
            const medal = getMedalEmoji(pos);
            const rowStyle = getRowStyle(pos, isMe);
            const posStyle = getPositionStyle(pos);
            const barWidth = getPointsBarWidth(u.pts, maxPts);

            // Visual separator between top 3 and rest
            const showTopSeparator = pos === 4;
            // Visual separator between top 10 and rest
            const showMidSeparator = pos === 11;

            return (
              <div key={pos}>
                {showTopSeparator && (
                  <div className="h-[1px] mx-4" style={{ background: 'linear-gradient(90deg, transparent, var(--color-border), transparent)' }} />
                )}
                {showMidSeparator && (
                  <div className="px-4 py-1.5" style={{ backgroundColor: 'var(--color-surface2)' }}>
                    <p className="text-[8px] font-black uppercase tracking-[0.15em]" style={{ color: 'var(--color-muted)' }}>Clasificacion general</p>
                  </div>
                )}
                <div
                  className="flex items-center px-3 py-2.5 gap-2.5 transition-colors"
                  style={rowStyle}
                >
                  {/* Position + Medal */}
                  <div className="w-9 flex items-center justify-center flex-shrink-0">
                    {medal ? (
                      <span className="text-base">{medal}</span>
                    ) : (
                      <span style={posStyle}>{pos}</span>
                    )}
                  </div>

                  {/* Name + points bar */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[11px] font-bold truncate ${isMe ? 'underline decoration-2 underline-offset-2' : ''}`}
                      style={{
                        color: 'var(--color-text)',
                        ...(pos <= 3 ? { fontSize: '12px' } : {}),
                      }}
                    >
                      {u.name}
                    </p>
                    {/* Progress bar representing points relative to leader */}
                    <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${barWidth}%`,
                          background: pos <= 3
                            ? 'linear-gradient(90deg, var(--color-primary), var(--color-accent))'
                            : pos <= 10
                            ? 'var(--color-primary)'
                            : 'var(--color-muted)',
                          opacity: pos <= 3 ? 1 : pos <= 10 ? 0.7 : 0.4,
                        }}
                      />
                    </div>
                  </div>

                  {/* Points */}
                  <div className="flex-shrink-0 text-right w-12">
                    <p
                      className="font-black"
                      style={{
                        color: pos <= 3 ? 'var(--color-primary)' : 'var(--color-text)',
                        fontSize: pos <= 3 ? '14px' : pos <= 10 ? '13px' : '12px',
                      }}
                    >
                      {u.pts}
                    </p>
                    <p className="text-[7px] font-bold uppercase" style={{ color: 'var(--color-muted)' }}>pts</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivational footer */}
        <div className="text-center py-2">
          <p className="text-[10px] font-medium" style={{ color: 'var(--color-muted)' }}>
            Te faltan {mockUsers[userPosition - 2]?.pts - mockUsers[userPosition - 1]?.pts || 3} puntos para subir una posicion
          </p>
        </div>
      </section>
    </AppShell>
  );
}
