'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api-client';
import { IS_DEMO_MODE } from '@/lib/demo-mode';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface LeaveGroupButtonProps {
  groupId: string;
  currentUserRole: 'owner' | 'admin' | 'member';
}

export default function LeaveGroupButton({ groupId, currentUserRole }: LeaveGroupButtonProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Owners use GroupSettings instead — render nothing
  if (currentUserRole === 'owner') {
    return null;
  }

  const handleLeaveGroup = async () => {
    setError(null);

    if (IS_DEMO_MODE) {
      setLoading(true);
      setTimeout(() => {
        router.push('/groups');
      }, 500);
      return;
    }

    try {
      setLoading(true);
      const res = await authFetch(`/api/groups/${groupId}/leave`, { method: 'POST' });
      if (res.ok) {
        router.push('/groups');
        return;
      }
      const data = await res.json();
      if (res.status === 409 && data.error === 'MUST_TRANSFER_OWNERSHIP') {
        setError('Debes transferir la propiedad a otro miembro antes de poder abandonar el grupo.');
      } else {
        setError(data.error || 'Ocurrió un error. Intenta de nuevo.');
      }
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setError(null);
          setDialogOpen(true);
        }}
        className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition hover:opacity-80"
        style={{
          backgroundColor: 'rgba(239,68,68,0.1)',
          color: 'var(--color-danger)',
          border: '1px solid rgba(239,68,68,0.3)',
        }}
      >
        Abandonar grupo
      </button>

      <ConfirmDialog
        open={dialogOpen}
        title="Abandonar grupo"
        message="¿Estás seguro de que quieres abandonar este grupo? Perderás acceso al leaderboard y contenido del grupo. Esta acción no se puede deshacer."
        confirmText="Sí, abandonar"
        cancelText="Cancelar"
        confirmStyle="danger"
        loading={loading}
        loadingText="Saliendo..."
        error={error}
        onConfirm={handleLeaveGroup}
        onCancel={() => {
          if (!loading) {
            setDialogOpen(false);
            setError(null);
          }
        }}
      />
    </>
  );
}

export type { LeaveGroupButtonProps };
