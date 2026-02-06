'use client';

interface RankingUser {
  name: string;
  pts: number;
  category: string;
}

interface RankingTableProps {
  users: RankingUser[];
}

export default function RankingTable({ users }: RankingTableProps) {
  const getCategoryColor = (category: string) => {
    if (category === 'Champion') return { bg: 'var(--color-accent)', text: 'var(--color-primaryText)' };
    if (category === 'Aguador') return { bg: 'var(--color-danger)', text: 'var(--color-primaryText)' };
    return { bg: 'var(--color-primary)', text: 'var(--color-primaryText)' };
  };

  return (
    <div
      className="shadow-sm rounded-3xl border overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <table className="min-w-full">
        <thead style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
          <tr>
            <th
              className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest"
              style={{ color: 'var(--color-muted)' }}
            >
              Pos
            </th>
            <th
              className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest"
              style={{ color: 'var(--color-muted)' }}
            >
              Usuario
            </th>
            <th
              className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest"
              style={{ color: 'var(--color-muted)' }}
            >
              Categoría
            </th>
            <th
              className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest"
              style={{ color: 'var(--color-muted)' }}
            >
              Pts
            </th>
          </tr>
        </thead>
        <tbody className="divide-y text-[11px]" style={{ borderColor: 'var(--color-border)' }}>
          {users.map((u, i) => {
            const isMe = u.name.includes('(Tú)');
            const catColors = getCategoryColor(u.category);
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
                  className="px-4 py-3 font-black"
                  style={{ color: i < 3 ? 'var(--color-primary)' : 'var(--color-muted)' }}
                >
                  #{i + 1}
                </td>
                <td className="px-4 py-3 font-bold" style={{ color: 'var(--color-text)' }}>
                  {u.name}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="px-2 py-0.5 rounded-full text-[7px] font-black uppercase italic"
                    style={{ backgroundColor: catColors.bg, color: catColors.text }}
                  >
                    {u.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-black" style={{ color: 'var(--color-text)' }}>
                  {u.pts}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
