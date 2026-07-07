'use client';

import { useEffect, useState } from 'react';
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

interface GroupMembersProps {
  groupId: string;
  currentUserId: string | null;
  currentUserRole: 'owner' | 'admin' | 'member';
}

interface PendingRequest {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  status: string;
  joinedAt: string;
}

export default function GroupMembers({ groupId, currentUserId, currentUserRole }: GroupMembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  useEffect(() => {
    fetchMembers();
    if (currentUserRole === 'owner' || currentUserRole === 'admin') {
      fetchPendingRequests();
    }
  }, [groupId, currentUserRole]);

  const fetchMembers = async () => {
    try {
      setLoading(true);

      // Demo mode: return mock member (current user as owner)
      if (IS_DEMO_MODE) {
        setMembers([{ userId: 'demo-user-001', displayName: 'Usuario Demo', role: 'owner', status: 'active', joinedAt: new Date().toISOString() }]);
        setLoading(false);
        return;
      }
      const res = await authFetch(`/api/groups/${groupId}/members?limit=100&offset=0`);
      if (!res.ok) throw new Error('Error al cargar miembros');
      const data = await res.json();
      setMembers(data.data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar miembros');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    if (IS_DEMO_MODE) {
      setPendingRequests([]);
      return;
    }
    try {
      const res = await authFetch(`/api/groups/${groupId}/requests`);
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.data || []);
      }
    } catch {
      // Silently fail for pending requests
    }
  };

  const handleApproveRequest = async (userId: string) => {
    try {
      setActionLoading(userId);
      const res = await authFetch(`/api/groups/${groupId}/requests/${userId}/approve`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al aprobar');
      }
      await fetchPendingRequests();
      await fetchMembers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (userId: string) => {
    try {
      setActionLoading(userId);
      const res = await authFetch(`/api/groups/${groupId}/requests/${userId}/reject`, { method: 'POST' });
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

  const handleChangeRole = async (targetUserId: string, newRole: 'admin' | 'member') => {
    try {
      setActionLoading(targetUserId);
      const res = await authFetch(`/api/groups/${groupId}/members/${targetUserId}`, {
        method: 'PATCH',
        body: JSON.stringify({ targetUserId, newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al cambiar rol');
      }
      await fetchMembers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!confirm('¿Estás seguro de que quieres expulsar a este miembro?')) return;
    try {
      setActionLoading(targetUserId);
      const res = await authFetch(`/api/groups/${groupId}/members/${targetUserId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al expulsar miembro');
      }
      await fetchMembers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      owner: { bg: 'rgba(234,179,8,0.1)', color: '#ca8a04', label: 'Propietario' },
      admin: { bg: 'rgba(99,102,241,0.1)', color: '#6366f1', label: 'Admin' },
      member: { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', label: 'Miembro' },
    };
    const style = styles[role] || styles.member;
    return (
      <span
        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        {style.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Cargando miembros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)' }}>
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pending requests section (owner/admin only) */}
      {pendingRequests.length > 0 && (
        <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.3)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#ca8a04' }}>
            Solicitudes Pendientes ({pendingRequests.length})
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.userId}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface2)' }}>
                  <img
                    src={req.avatarUrl || '/assets/PROFILE/unknown-football-shirt-svgrepo-com.svg'}
                    alt=""
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
                <p className="flex-1 text-xs font-bold truncate" style={{ color: 'var(--color-text)' }}>
                  {req.displayName}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleApproveRequest(req.userId)}
                    disabled={actionLoading === req.userId}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white transition hover:opacity-80 disabled:opacity-50"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleRejectRequest(req.userId)}
                    disabled={actionLoading === req.userId}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition hover:opacity-80 disabled:opacity-50"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="space-y-2">
      {members.map((member) => {
        const isCurrentUser = member.userId === currentUserId;
        const canManage = currentUserRole === 'owner' && !isCurrentUser && member.role !== 'owner';
        const canRemove =
          (currentUserRole === 'owner' && member.role !== 'owner') ||
          (currentUserRole === 'admin' && member.role === 'member');
        const isActionTarget = actionLoading === member.userId;

        return (
          <div
            key={member.userId}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-surface2)' }}
            >
              <img
                src={member.avatarUrl || '/assets/PROFILE/unknown-football-shirt-svgrepo-com.svg'}
                alt=""
                className="w-full h-full object-contain p-0.5"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold truncate" style={{ color: 'var(--color-text)' }}>
                  {member.displayName}
                  {isCurrentUser && <span className="ml-1 font-normal" style={{ color: 'var(--color-primary)' }}>(tú)</span>}
                </p>
                {getRoleBadge(member.role)}
              </div>
            </div>

            {/* Actions */}
            {!isCurrentUser && (canManage || canRemove) && (
              <div className="flex items-center gap-1 shrink-0">
                {canManage && (
                  <button
                    onClick={() => handleChangeRole(member.userId, member.role === 'admin' ? 'member' : 'admin')}
                    disabled={isActionTarget}
                    className="text-[10px] font-bold px-2 py-1 rounded transition hover:opacity-80"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {member.role === 'admin' ? 'Degradar' : 'Promover'}
                  </button>
                )}
                {canRemove && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    disabled={isActionTarget}
                    className="text-[10px] font-bold px-2 py-1 rounded transition hover:opacity-80"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    Expulsar
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
