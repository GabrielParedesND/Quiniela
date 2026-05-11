'use client';

interface Team {
  short: string;
  flagUrl: string;
}

interface ResultCardProps {
  teamA: Team;
  teamB: Team;
  officialScoreA: number;
  officialScoreB: number;
  predictionA: string;
  predictionB: string;
  points: number;
  description: string;
  isSpecial?: boolean;
  multiplier?: number;
}

export default function ResultCard({
  teamA,
  teamB,
  officialScoreA,
  officialScoreB,
  predictionA,
  predictionB,
  points,
  description,
  isSpecial,
  multiplier,
}: ResultCardProps) {
  const getColorByPoints = (pts: number) => {
    if (pts >= 5) return 'var(--color-accent)';
    if (pts >= 3) return 'var(--color-primary)';
    return 'var(--color-muted)';
  };

  return (
    <div
      className="border rounded-2xl overflow-hidden p-4 flex items-center justify-between hover:opacity-90 transition"
      style={{
        borderColor: isSpecial ? 'var(--color-accent)' : 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        borderWidth: isSpecial ? '2px' : '1px',
      }}
    >
      <div className="flex items-center space-x-4">
        <div className="flex space-x-3">
          <img
            src={teamA.flagUrl}
            className="h-6 w-auto"
            alt={teamA.short}
          />
          <img
            src={teamB.flagUrl}
            className="h-6 w-auto"
            alt={teamB.short}
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-black uppercase tracking-tighter" style={{ color: 'var(--color-text)' }}>
              {teamA.short} vs {teamB.short}
            </p>
            {isSpecial && (
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
                ⚡ x{multiplier || 2}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
              Oficial: {officialScoreA}-{officialScoreB}
            </span>
            <span className="text-[9px] font-black" style={{ color: 'var(--color-primary)' }}>
              | Tuyo: {predictionA}-{predictionB}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <span
          className="block text-[8px] font-black uppercase tracking-widest"
          style={{ color: getColorByPoints(points) }}
        >
          {description}
        </span>
        <span className="text-xs font-black" style={{ color: getColorByPoints(points) }}>
          +{points} pts
        </span>
      </div>
    </div>
  );
}
