'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { authFetch } from '@/lib/api-client';
import { IS_DEMO_MODE } from '@/lib/demo-mode';

interface Member {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: 'owner' | 'admin' | 'member';
  status: string;
  joinedAt: string;
}

interface TransferOwnershipDialogProps {
  open: boolean;
  groupId: string;
  members: Member[];
  onTransferred: () => void;
  onCancel: () => void;
}

export default function TransferOwnershipDialog({
  open,
  groupId,
  members,
  onTransferred,
  onCancel,
}: TransferOwnershipDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = 'transfer-ownership-dialog-title';

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedUserId(null);
      setError(null);
      setLoading(false);
      cancelButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    },
    [onCancel, loading]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown]);

  const handleTransfer = async () => {
    if (!selectedUserId) return;

    setError(null);
    setLoading(true);

    try {
      if (IS_DEMO_MODE) {
        // Simulate network delay for demo mode
        await new Promise((resolve) => setTimeout(resolve, 800));
        onTransferred();
        return;
      }

      const res = await authFetch(`/api/groups/${groupId}/transfer`, {
        method: 'POST',
        body: JSON.stringify({ newOwnerUserId: selectedUserId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error || 'Error al transferir la propiedad. Intenta de nuevo.'
        );
      }

      onTransferred();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-xl p-6 shadow-xl flex flex-col"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          maxHeight: '80vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2
          id={titleId}
          className="text-sm font-bold uppercase tracking-wider mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Transferir Propiedad
        </h2>

        {/* Description */}
        <p className="text-xs mb-4" style={{ color: 'var(--color-muted)' }}>
          Selecciona al miembro que recibirá la propiedad del grupo. Esta acción
          no se puede deshacer.
        </p>

        {/* Error message */}
        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-xs"
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              color: 'var(--color-danger)',
            }}
          >
            {error}
          </div>
        )}

        {/* Member list - scrollable */}
        <div
          className="flex-1 overflow-y-auto space-y-2 mb-4 -mx-1 px-1"
          style={{ maxHeight: '40vh' }}
        >
          {members.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: 'var(--color-muted)' }}>
              No hay miembros elegibles.
            </p>
          ) : (
            members.map((member) => {
              const isSelected = selectedUserId === member.userId;
              return (
                <button
                  key={member.userId}
                  type="button"
                  onClick={() => setSelectedUserId(member.userId)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition hover:opacity-90 disabled:opacity-50 text-left"
                  style={{
                    backgroundColor: isSelected
                      ? 'rgba(99,102,241,0.1)'
                      : 'var(--color-surface2)',
                    border: isSelected
                      ? '2px solid var(--color-primary)'
                      : '2px solid transparent',
                  }}
                  aria-pressed={isSelected}
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                  >
                    <img
                      src={
                        member.avatarUrl ||
                        '/assets/PROFILE/unknown-football-shirt-svgrepo-com.svg'
                      }
                      alt=""
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>

                  {/* Name */}
                  <span
                    className="text-xs font-bold truncate"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {member.displayName}
                  </span>

                  {/* Selection indicator */}
                  {isSelected && (
                    <span
                      className="ml-auto shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Buttons - stacked on mobile, side-by-side on larger */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition hover:opacity-80 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-surface2)',
              color: 'var(--color-muted)',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleTransfer}
            disabled={loading || !selectedUserId}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition hover:opacity-80 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
            }}
          >
            {loading ? 'Transfiriendo...' : 'Transferir'}
          </button>
        </div>
      </div>
    </div>
  );
}

export type { TransferOwnershipDialogProps, Member as TransferMember };
