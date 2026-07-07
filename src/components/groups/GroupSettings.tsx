'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api-client';
import { IS_DEMO_MODE } from '@/lib/demo-mode';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import TransferOwnershipDialog from '@/components/groups/TransferOwnershipDialog';
import type { TransferMember } from '@/components/groups/TransferOwnershipDialog';

interface GroupInfo {
  groupId: string;
  name: string;
  description?: string;
  memberCount: number;
  maxMembers: number;
  privacy: string;
  inviteCode?: string;
  ownerUserId: string;
}

interface PendingRequest {
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

interface GroupSettingsProps {
  group: GroupInfo;
  currentUserRole: 'owner' | 'admin' | 'member';
  onGroupUpdated: () => void;
}

export default function GroupSettings({ group, currentUserRole, onGroupUpdated }: GroupSettingsProps) {
  const router = useRouter();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [privacy, setPrivacy] = useState(group.privacy);
  const [maxMembers, setMaxMembers] = useState(String(group.maxMembers));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [regenerating, setRegenerating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Leave group state
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  // Transfer ownership dialog state (dialog component created in task 4.1)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferMembers, setTransferMembers] = useState<TransferMember[]>([]);
  const [codeCopied, setCodeCopied] = useState(false);

  const isOwner = currentUserRole === 'owner';

  useEffect(() => {
    fetchPendingRequests();
  }, [group.groupId]);

  const fetchPendingRequests = async () => {
    if (IS_DEMO_MODE) {
      setPendingRequests([]);
      return;
    }
    try {
      setLoadingRequests(true);
      const res = await authFetch(`/api/groups/${group.groupId}/requests`);
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.data || []);
      }
    } catch {
      // Silently fail for pending requests
    } finally {
      setLoadingRequests(false);
    }
  };

  // Fetch members for the transfer ownership dialog when it opens
  useEffect(() => {
    if (!transferDialogOpen) return;
    const fetchMembersForTransfer = async () => {
      if (IS_DEMO_MODE) {
        setTransferMembers([]);
        return;
      }
      try {
        const res = await authFetch(`/api/groups/${group.groupId}/members?limit=100&offset=0`);
        if (res.ok) {
          const data = await res.json();
          const allMembers: TransferMember[] = data.data || [];
          // Exclude current owner from eligible members
          setTransferMembers(allMembers.filter((m) => m.role !== 'owner'));
        }
      } catch {
        // If fetch fails, dialog will show empty state
        setTransferMembers([]);
      }
    };
    fetchMembersForTransfer();
  }, [transferDialogOpen, group.groupId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      setSaveError('El nombre debe tener entre 1 y 100 caracteres');
      return;
    }
    if (description.length > 500) {
      setSaveError('La descripción no puede exceder 500 caracteres');
      return;
    }
    const maxMembersNum = parseInt(maxMembers, 10);
    if (isNaN(maxMembersNum) || maxMembersNum < 2 || maxMembersNum > 500) {
      setSaveError('El máximo de miembros debe ser entre 2 y 500');
      return;
    }

    try {
      setSaving(true);
      const res = await authFetch(`/api/groups/${group.groupId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: trimmedName,
          description: description.trim() || undefined,
          privacy,
          maxMembers: maxMembersNum,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }
      setSaveSuccess(true);
      onGroupUpdated();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateCode = async () => {
    if (!confirm('¿Regenerar el código? El código anterior dejará de funcionar.')) return;
    try {
      setRegenerating(true);
      const res = await authFetch(`/api/groups/${group.groupId}/regenerate-code`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al regenerar código');
      }
      onGroupUpdated();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRegenerating(false);
    }
  };

  const handleApproveRequest = async (userId: string) => {
    try {
      setActionLoading(userId);
      const res = await authFetch(`/api/groups/${group.groupId}/requests/${userId}/approve`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al aprobar');
      }
      await fetchPendingRequests();
      onGroupUpdated();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (userId: string) => {
    try {
      setActionLoading(userId);
      const res = await authFetch(`/api/groups/${group.groupId}/requests/${userId}/reject`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al rechazar');
      }
      await fetchPendingRequests();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      setDeleting(true);
      const res = await authFetch(`/api/groups/${group.groupId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar grupo');
      }
      router.push('/groups');
    } catch (err: any) {
      alert(err.message);
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  const handleLeaveGroup = async () => {
    setLeaveError(null);

    if (IS_DEMO_MODE) {
      setLeaveLoading(true);
      setTimeout(() => {
        router.push('/groups');
      }, 500);
      return;
    }

    try {
      setLeaveLoading(true);
      const res = await authFetch(`/api/groups/${group.groupId}/leave`, { method: 'POST' });
      if (res.ok) {
        router.push('/groups');
        return;
      }
      const data = await res.json();
      if (res.status === 409 && data.error === 'MUST_TRANSFER_OWNERSHIP') {
        setLeaveError('Debes transferir la propiedad a otro miembro antes de poder abandonar el grupo.');
      } else {
        setLeaveError(data.error || 'Ocurrió un error. Intenta de nuevo.');
      }
    } catch {
      setLeaveError('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLeaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Edit form */}
      <form onSubmit={handleSave} className="space-y-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
          Editar Grupo
        </h3>

        {saveError && (
          <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)' }}>
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
            Cambios guardados correctamente
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-muted)' }}>Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--color-surface2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-muted)' }}>Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{ backgroundColor: 'var(--color-surface2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-muted)' }}>Privacidad</label>
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--color-surface2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          >
            <option value="invite-only">Solo invitación</option>
            <option value="private">Privado (requiere aprobación)</option>
            <option value="public">Público</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-muted)' }}>Máximo de miembros</label>
          <input
            type="number"
            value={maxMembers}
            onChange={(e) => setMaxMembers(e.target.value)}
            min={2}
            max={500}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--color-surface2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>

      {/* Invite code section */}
      <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
          Código de Invitación
        </h3>
        {group.inviteCode && (
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono font-bold px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-surface2)', color: 'var(--color-text)' }}>
              {group.inviteCode}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(group.inviteCode || '');
                setCodeCopied(true);
                setTimeout(() => setCodeCopied(false), 2000);
              }}
              className="px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition hover:opacity-80"
              style={{ backgroundColor: 'var(--color-surface2)', color: codeCopied ? '#16a34a' : 'var(--color-primary)' }}
            >
              {codeCopied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
        )}
        <button
          onClick={handleRegenerateCode}
          disabled={regenerating}
          className="text-xs font-bold transition hover:opacity-80 disabled:opacity-50"
          style={{ color: 'var(--color-primary)' }}
        >
          {regenerating ? 'Regenerando...' : 'Regenerar código'}
        </button>
      </div>

      {/* Danger zone section */}
      <div className="p-4 rounded-xl space-y-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid rgba(239,68,68,0.3)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-danger)' }}>
          Zona de Peligro
        </h3>

        {/* Delete group (owner only) */}
        {isOwner && (
          <div className="space-y-2">
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="text-xs font-bold transition hover:opacity-80"
                style={{ color: 'var(--color-danger)' }}
              >
                Eliminar grupo
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs" style={{ color: 'var(--color-danger)' }}>
                  ¿Estás seguro? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteGroup}
                    disabled={deleting}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-white transition hover:opacity-80 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-danger)' }}
                  >
                    {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-3 py-2 rounded-lg text-xs font-bold transition hover:opacity-80"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leave group - different behavior per role */}
        {isOwner ? (
          // Owner: informative message (info color, not error) + transfer CTA
          <div className="p-3 rounded-lg space-y-3" style={{ backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Como propietario del grupo, debes transferir la propiedad a otro miembro antes de poder abandonarlo.
            </p>
            <button
              onClick={() => setTransferDialogOpen(true)}
              className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition hover:opacity-80"
              style={{ backgroundColor: 'var(--color-primary)', color: '#ffffff' }}
            >
              Transferir propiedad
            </button>
          </div>
        ) : (
          // Member/admin: leave button opens confirm dialog
          <button
            onClick={() => {
              setLeaveError(null);
              setLeaveDialogOpen(true);
            }}
            className="text-xs font-bold transition hover:opacity-80"
            style={{ color: 'var(--color-danger)' }}
          >
            Abandonar grupo
          </button>
        )}
      </div>

      {/* Leave group confirm dialog (member/admin only) */}
      <ConfirmDialog
        open={leaveDialogOpen}
        title="Abandonar grupo"
        message="¿Estás seguro de que quieres abandonar este grupo? Perderás acceso al leaderboard y contenido del grupo. Esta acción no se puede deshacer."
        confirmText="Sí, abandonar"
        cancelText="Cancelar"
        confirmStyle="danger"
        loading={leaveLoading}
        loadingText="Saliendo..."
        error={leaveError}
        onConfirm={handleLeaveGroup}
        onCancel={() => {
          if (!leaveLoading) {
            setLeaveDialogOpen(false);
            setLeaveError(null);
          }
        }}
      />

      {/* Transfer ownership dialog (owner only) */}
      <TransferOwnershipDialog
        open={transferDialogOpen}
        groupId={group.groupId}
        members={transferMembers}
        onTransferred={() => {
          setTransferDialogOpen(false);
          onGroupUpdated();
        }}
        onCancel={() => setTransferDialogOpen(false)}
      />
    </div>
  );
}
