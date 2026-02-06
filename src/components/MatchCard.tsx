'use client';

interface Team {
  id: number;
  name: string;
  short: string;
  flagUrl: string;
}

interface MatchCardProps {
  teamA: Team;
  teamB: Team;
  jornada: number;
  dateLabel: string;
  isLocked: boolean;
  predictionA: string;
  predictionB: string;
  onPredictionChange?: (team: 'a' | 'b', value: string) => void;
}

export default function MatchCard({
  teamA,
  teamB,
  jornada,
  dateLabel,
  isLocked,
  predictionA,
  predictionB,
  onPredictionChange,
}: MatchCardProps) {
  return (
    <div
      className={`rounded-2xl shadow-sm border overflow-hidden ${isLocked ? 'opacity-60' : ''}`}
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div
        className="p-2 flex justify-between items-center text-[8px] font-black uppercase tracking-widest"
        style={{ backgroundColor: 'var(--color-surface2)', color: 'var(--color-muted)' }}
      >
        <span>
          Jornada {jornada} • {dateLabel}
        </span>
        <span className="font-bold" style={{ color: isLocked ? 'var(--color-muted)' : 'var(--color-accent)' }}>
          {isLocked ? 'Cerrado' : 'Abierto'}
        </span>
      </div>
      <div className="p-5 flex items-center justify-between">
        <div className="text-center w-1/3">
          <img
            src={teamA.flagUrl}
            className="w-10 h-7 mx-auto rounded-sm border mb-1 shadow-sm"
            style={{ borderColor: 'var(--color-border)' }}
            alt={teamA.name}
          />
          <p className="text-[9px] font-black uppercase" style={{ color: 'var(--color-text)' }}>
            {teamA.name}
          </p>
        </div>
        <div className="flex items-center space-x-2 w-1/3 justify-center">
          <input
            type="number"
            value={predictionA}
            onChange={(e) => onPredictionChange?.('a', e.target.value)}
            readOnly={isLocked}
            disabled={isLocked}
            className="w-9 h-9 text-center font-black border rounded-lg focus:ring-2 outline-none"
            style={{
              backgroundColor: isLocked ? 'var(--color-surface2)' : 'var(--color-surface2)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
          <span className="font-black" style={{ color: 'var(--color-muted)' }}>
            :
          </span>
          <input
            type="number"
            value={predictionB}
            onChange={(e) => onPredictionChange?.('b', e.target.value)}
            readOnly={isLocked}
            disabled={isLocked}
            className="w-9 h-9 text-center font-black border rounded-lg focus:ring-2 outline-none"
            style={{
              backgroundColor: isLocked ? 'var(--color-surface2)' : 'var(--color-surface2)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>
        <div className="text-center w-1/3">
          <img
            src={teamB.flagUrl}
            className="w-10 h-7 mx-auto rounded-sm border mb-1 shadow-sm"
            style={{ borderColor: 'var(--color-border)' }}
            alt={teamB.name}
          />
          <p className="text-[9px] font-black uppercase" style={{ color: 'var(--color-text)' }}>
            {teamB.name}
          </p>
        </div>
      </div>
    </div>
  );
}
