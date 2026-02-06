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
}: ResultCardProps) {
  const getColorByPoints = (pts: number) => {
    if (pts === 5) return 'var(--color-accent)';
    if (pts === 3) return 'var(--color-primary)';
    return 'var(--color-muted)';
  };

  return (
    <div
      className="border rounded-2xl overflow-hidden p-4 flex items-center justify-between hover:opacity-90 transition"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <div className="flex items-center space-x-4">
        <div className="flex -space-x-2">
          <img
            src={teamA.flagUrl}
            className="w-8 h-5 object-cover rounded shadow-sm border-2"
            style={{ borderColor: 'var(--color-surface)' }}
            alt={teamA.short}
          />
          <img
            src={teamB.flagUrl}
            className="w-8 h-5 object-cover rounded shadow-sm border-2"
            style={{ borderColor: 'var(--color-surface)' }}
            alt={teamB.short}
          />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-tighter" style={{ color: 'var(--color-text)' }}>
            {teamA.short} vs {teamB.short}
          </p>
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
