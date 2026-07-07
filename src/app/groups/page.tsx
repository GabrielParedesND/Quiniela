'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth/cognito';
import { authFetch } from '@/lib/api-client';
import { IS_DEMO_MODE } from '@/lib/demo-mode';
import AppShell from '@/components/AppShell';
import LoadingContent from '@/components/LoadingContent';
import PageHeader from '@/components/PageHeader';

interface GroupSummary {
  groupId: string;
  name: string;
  memberCount: number;
  privacy: string;
}

interface GroupsResponse {
  data: GroupSummary[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

type Tab = 'my-groups' | 'join-group';

export default function GroupsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('my-groups');

  // My Groups state
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Join Group state
  const [code, setCode] = useState('');
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<{ groupId: string; groupName: string; status: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.push('/');
        return;
      }
      fetchGroups(0);
    };
    checkAuth();
  }, []);

  const fetchGroups = async (currentOffset: number) => {
    try {
      setLoading(true);

      // Demo mode: return mock groups from localStorage
      if (IS_DEMO_MODE) {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('quiniela_demo_groups') : null;
        const mockGroups: GroupSummary[] = stored ? JSON.parse(stored) : [];
        setGroups(mockGroups);
        setHasMore(false);
        setLoading(false);
        return;
      }

      const res = await authFetch(`/api/groups?limit=${limit}&offset=${currentOffset}`);
      if (!res.ok) throw new Error('Error al cargar grupos');
      const data: GroupsResponse = await res.json();
      if (currentOffset === 0) {
        setGroups(data.data);
      } else {
        setGroups((prev) => [...prev, ...data.data]);
      }
      setHasMore(data.pagination.hasMore);
      setOffset(currentOffset + data.pagination.limit);
    } catch (err: any) {
      setError(err.message || 'Error al cargar grupos');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchGroups(offset);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    setJoinSuccess(null);

    const trimmedCode = code.trim();
    if (!trimmedCode || trimmedCode.length < 8) {
      setJoinError('El código debe tener al menos 8 caracteres');
      return;
    }

    // Demo mode: simulate joining a group
    if (IS_DEMO_MODE) {
      setJoinSuccess({ groupId: 'demo-group-joined', groupName: 'Grupo Demo', status: 'joined' });
      const stored = typeof window !== 'undefined' ? localStorage.getItem('quiniela_demo_groups') : null;
      const groups: GroupSummary[] = stored ? JSON.parse(stored) : [];
      groups.push({ groupId: 'demo-group-joined', name: 'Grupo Demo', memberCount: 5, privacy: 'invite-only' });
      localStorage.setItem('quiniela_demo_groups', JSON.stringify(groups));
      setTimeout(() => setActiveTab('my-groups'), 1500);
      return;
    }

    try {
      setJoinSubmitting(true);
      const res = await authFetch('/api/groups/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode: trimmedCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessages: Record<string, string> = {
          INVALID_INVITE_CODE: 'Código de invitación inválido',
          INVITE_CODE_EXPIRED: 'El código de invitación ha expirado',
          GROUP_CLOSED: 'El grupo ya no está disponible',
          ALREADY_MEMBER: 'Ya eres miembro de este grupo',
          GROUP_FULL: 'El grupo está lleno',
          USER_BANNED: 'No tienes permiso para unirte a este grupo',
        };
        throw new Error(errorMessages[data.error] || data.error || 'Error al unirse al grupo');
      }

      const result = data.data || data;
      setJoinSuccess({
        groupId: result.groupId,
        groupName: result.groupName,
        status: result.status,
      });

      // Redirect after a short delay on success
      if (result.status === 'joined') {
        setTimeout(() => {
          router.push(`/groups/${result.groupId}`);
        }, 1500);
      }
    } catch (err: any) {
      setJoinError(err.message || 'Error al unirse al grupo');
    } finally {
      setJoinSubmitting(false);
    }
  };

  if (loading && groups.length === 0) {
    return (
      <AppShell>
        <LoadingContent />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="fade-in space-y-4 sm:space-y-6">
        {/* Header - same style as other pages */}
        <PageHeader title="Grupos" showBackButton />

        {/* Content container */}
        <div className="rounded-2xl border p-4 sm:p-5" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

        {/* Tab navigation */}
        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ backgroundColor: 'var(--color-surface2)' }}>
          <button
            onClick={() => setActiveTab('my-groups')}
            className="flex-1 py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition"
            style={{
              backgroundColor: activeTab === 'my-groups' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'my-groups' ? 'var(--color-text)' : 'var(--color-muted)',
              boxShadow: activeTab === 'my-groups' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Mis Grupos
          </button>
          <button
            onClick={() => setActiveTab('join-group')}
            className="flex-1 py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition"
            style={{
              backgroundColor: activeTab === 'join-group' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'join-group' ? 'var(--color-text)' : 'var(--color-muted)',
              boxShadow: activeTab === 'join-group' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Unirse a un Grupo
          </button>
        </div>

        {/* Tab content: Mis Grupos */}
        {activeTab === 'my-groups' && (
          <div className="space-y-3">
            {/* Create group button */}
            <div className="flex justify-end">
              <button
                onClick={() => router.push('/groups/create')}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                + Crear Grupo
              </button>
            </div>

            {/* Error state */}
            {error && (
              <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)' }}>
                {error}
              </div>
            )}

            {/* Empty state */}
            {!loading && groups.length === 0 && !error && (
              <div className="text-center py-12">
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  Aún no perteneces a ningún grupo.
                </p>
                <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
                  Crea uno o únete con un código de invitación.
                </p>
              </div>
            )}

            {/* Groups list */}
            {groups.map((group) => (
              <div
                key={group.groupId}
                onClick={() => router.push(`/groups/${group.groupId}`)}
                className="p-4 rounded-xl border cursor-pointer transition hover:shadow-md"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold break-words" style={{ color: 'var(--color-text)', overflowWrap: 'anywhere' }}>
                      {group.name}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                      {group.memberCount} miembro{group.memberCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: group.privacy === 'public' ? 'rgba(34,197,94,0.1)' : 'rgba(99,102,241,0.1)',
                        color: group.privacy === 'public' ? '#16a34a' : '#6366f1',
                      }}
                    >
                      {group.privacy === 'public' ? 'Público' : group.privacy === 'private' ? 'Privado' : 'Invitación'}
                    </span>
                    <svg className="w-4 h-4" style={{ color: 'var(--color-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}

            {/* Load more */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition hover:opacity-80"
                style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                {loading ? 'Cargando...' : 'Cargar más'}
              </button>
            )}
          </div>
        )}

        {/* Tab content: Unirse a un Grupo */}
        {activeTab === 'join-group' && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Ingresa el código de invitación que te compartieron para unirte a un grupo.
            </p>

            <div className="max-w-md mx-auto space-y-4">

            {/* Success message */}
            {joinSuccess && (
              <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                {joinSuccess.status === 'joined' ? (
                  <p>¡Te has unido a <strong>{joinSuccess.groupName}</strong>! Redirigiendo...</p>
                ) : (
                  <p>Tu solicitud para unirte a <strong>{joinSuccess.groupName}</strong> está pendiente de aprobación.</p>
                )}
              </div>
            )}

            {/* Error message */}
            {joinError && (
              <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)' }}>
                {joinError}
              </div>
            )}

            {!joinSuccess && (
              <form onSubmit={handleJoinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text)' }}>
                    Código de invitación
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl text-sm font-mono outline-none transition tracking-wider"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    placeholder="Ej: A1B2C3D4E5"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={joinSubmitting || !code.trim()}
                  className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {joinSubmitting ? 'Verificando...' : 'Unirse al Grupo'}
                </button>
              </form>
            )}

            {joinSuccess && joinSuccess.status === 'pending_approval' && (
              <button
                onClick={() => {
                  setJoinSuccess(null);
                  setCode('');
                  setActiveTab('my-groups');
                }}
                className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition hover:opacity-80"
                style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                Volver a Mis Grupos
              </button>
            )}
            </div>{/* End centered form */}
          </div>
        )}

        </div>{/* End content container */}
      </section>
    </AppShell>
  );
}
