'use client';

interface JornadaNotAvailableProps {
  jornadaNumber: number;
}

export default function JornadaNotAvailable({ jornadaNumber }: JornadaNotAvailableProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
      }}
    >
      <span style={{ fontSize: '2.5rem' }}>⏳</span>
      <h2
        style={{
          color: 'var(--color-text)',
          fontSize: '1.125rem',
          fontWeight: 700,
          margin: '0.5rem 0 0.25rem',
        }}
      >
        Jornada {jornadaNumber}
      </h2>
      <p
        style={{
          color: 'var(--color-text)',
          fontSize: '0.875rem',
          margin: 0,
        }}
      >
        Esta jornada aún no está disponible
      </p>
      <p
        style={{
          color: 'var(--color-muted)',
          fontSize: '0.75rem',
          margin: '0.25rem 0 0',
        }}
      >
        Vuelve más tarde cuando los partidos estén publicados
      </p>
    </div>
  );
}
