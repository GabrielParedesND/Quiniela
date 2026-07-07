'use client';

interface RankingUser {
  name: string;
  pts: number;
  phase: string;
}

interface RankingTableProps {
  users: RankingUser[];
  userPosition?: number;
}

export default function RankingTable({ users, userPosition }: RankingTableProps) {
  const getPhaseColor = (phase: string) => {
    if (phase === 'Cita con la Historia') return { bg: 'var(--color-accent)', text: 'var(--color-primaryText)' };
    if (phase === 'Duelo de Gigantes') return { bg: 'var(--color-danger)', text: 'var(--color-primaryText)' };
    if (phase === 'Zona de Campeones') return { bg: 'var(--color-primary)', text: 'var(--color-primaryText)' };
    return { bg: 'var(--color-muted)', text: 'var(--color-primaryText)' };
  };

  if (!users || users.length === 0) {
    return (
      <div
        className="shadow-sm rounded-3xl border overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <span className="text-3xl mb-2">🏆</span>
          <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>Proximamente...</p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--color-muted)' }}>El ranking se actualizara cuando inicie la competencia.</p>
        </div>
      </div>
    );
  }

  // Separate the current user if they're outside the top 20
  const meEntry = users.find((u) => u.name.includes('(Tú)'));
  const meInTop20 = users.slice(0, 20).some((u) => u.name.includes('(Tú)'));
  const displayUsers = meInTop20 ? users : users.filter((u) => !u.name.includes('(Tú)'));

  return (
    <div
      className="shadow-sm rounded-3xl border overflow-x-auto"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <table className="min-w-full">
        <thead style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
          <tr>
            <th
              className="px-2 sm:px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest"
              style={{ color: 'var(--color-muted)' }}
            >
              Pos
            </th>
            <th
              className="px-2 sm:px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest"
              style={{ color: 'var(--color-muted)' }}
            >
              Usuario
            </th>
            <th
              className="px-2 sm:px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest"
              style={{ color: 'var(--color-muted)' }}
            >
              Pts
            </th>
            <th
              className="px-2 sm:px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest"
              style={{ color: 'var(--color-muted)' }}
            >
              Fase
            </th>
          </tr>
        </thead>
        <tbody className="divide-y text-[11px]" style={{ borderColor: 'var(--color-border)' }}>
          {displayUsers.map((u, i) => {
            const isMe = u.name.includes('(Tú)');
            const displayPosition = isMe && userPosition ? userPosition : i + 1;
            const phaseColors = getPhaseColor(u.phase);
            return (
              <tr
                key={i}
                className={isMe ? 'border-l-4' : ''}
                style={{
                  backgroundColor: isMe ? 'var(--color-surface2)' : 'var(--color-surface)',
                  borderLeftColor: isMe ? 'var(--color-primary)' : 'transparent',
                }}
              >
                <td
                  className="px-2 sm:px-4 py-3 font-black"
                  style={{ color: i < 3 ? 'var(--color-primary)' : 'var(--color-muted)' }}
                >
                  #{displayPosition}
                </td>
                <td className="px-2 sm:px-4 py-3 font-bold whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                  {u.name}
                </td>
                <td className="px-2 sm:px-4 py-3 text-center font-black" style={{ color: 'var(--color-text)' }}>
                  {u.pts}
                </td>
                <td className="px-2 sm:px-4 py-3 text-center">
                  <span
                    className="inline-block whitespace-nowrap px-2 py-0.5 rounded-full text-[7px] font-black uppercase italic"
                    style={{ backgroundColor: phaseColors.bg, color: phaseColors.text }}
                  >
                    {u.phase}
                  </span>
                </td>
              </tr>
            );
          })}
          {/* Show current user below the top 20 with their real position */}
          {!meInTop20 && meEntry && userPosition && (
            <>
              <tr>
                <td colSpan={4} className="px-4 py-1 text-center">
                  <span className="text-[9px] font-bold tracking-widest" style={{ color: 'var(--color-muted)' }}>...</span>
                </td>
              </tr>
              <tr
                className="border-l-4"
                style={{
                  backgroundColor: 'var(--color-surface2)',
                  borderLeftColor: 'var(--color-primary)',
                }}
              >
                <td
                  className="px-2 sm:px-4 py-3 font-black"
                  style={{ color: 'var(--color-muted)' }}
                >
                  #{userPosition}
                </td>
                <td className="px-2 sm:px-4 py-3 font-bold whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                  {meEntry.name}
                </td>
                <td className="px-2 sm:px-4 py-3 text-center font-black" style={{ color: 'var(--color-text)' }}>
                  {meEntry.pts}
                </td>
                <td className="px-2 sm:px-4 py-3 text-center">
                  <span
                    className="inline-block whitespace-nowrap px-2 py-0.5 rounded-full text-[7px] font-black uppercase italic"
                    style={{ backgroundColor: getPhaseColor(meEntry.phase).bg, color: getPhaseColor(meEntry.phase).text }}
                  >
                    {meEntry.phase}
                  </span>
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
