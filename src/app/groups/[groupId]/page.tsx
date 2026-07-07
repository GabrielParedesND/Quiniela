'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { isAuthenticated, getUserId } from '@/lib/auth/cognito';
import { authFetch } from '@/lib/api-client';
import { IS_DEMO_MODE } from '@/lib/demo-mode';
import AppShell from '@/components/AppShell';
import LoadingContent from '@/components/LoadingContent';
import PageHeader from '@/components/PageHeader';
import GroupLeaderboard from '@/components/groups/GroupLeaderboard';
import GroupMembers from '@/components/groups/GroupMembers';
import GroupSettings from '@/components/groups/GroupSettings';
import LeaveGroupButton from '@/components/groups/LeaveGroupButton';
import { useTournament } from '@/contexts/TournamentContext';

interface GroupDetail {
  groupId: string;
  name: string;
  description?: string;
  memberCount: number;
  maxMembers: number;
  privacy: string;
  inviteCode?: string;
  ownerUserId: string;
  status: string;
}

interface MembershipInfo {
  role: 'owner' | 'admin' | 'member';
  status: string;
}

type Tab = 'leaderboard' | 'members' | 'settings';

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;
  const { selectedTournamentId: tournamentId } = useTournament();

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [membership, setMembership] = useState<MembershipInfo | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard');
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    const init = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.push('/');
        return;
      }
      const userId = await getUserId();
      setCurrentUserId(userId);
      fetchGroupDetail();
    };
    init();
  }, [groupId]);

  const fetchGroupDetail = async () => {
    try {
      setLoading(true);

      // Demo mode: return mock group from localStorage
      if (IS_DEMO_MODE) {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('quiniela_demo_groups') : null;
        const groups = stored ? JSON.parse(stored) : [];
        const found = groups.find((g: any) => g.groupId === groupId);
        if (found) {
          setGroup({ ...found, maxMembers: 100, privacy: found.privacy || 'invite-only', inviteCode: 'DEMO1234', ownerUserId: 'demo-user-001', status: 'active', description: 'Grupo de demostración' });
          setMembership({ role: 'owner', status: 'active' });
        } else {
          setError('Grupo no encontrado');
        }
        setLoading(false);
        return;
      }

      const res = await authFetch(`/api/groups/${groupId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Grupo no encontrado');
        if (res.status === 403) throw new Error('No tienes acceso a este grupo');
        throw new Error('Error al cargar el grupo');
      }
      const data = await res.json();
      setGroup(data.group || data);
      setMembership(data.membership || null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el grupo');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <LoadingContent />
      </AppShell>
    );
  }

  if (error || !group) {
    return (
      <AppShell>
        <section className="fade-in space-y-4">
          <PageHeader title="Grupo" showBackButton backTo="/groups" />
          <div className="p-4 rounded-xl text-sm text-center" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)' }}>
            {error || 'Grupo no encontrado'}
          </div>
        </section>
      </AppShell>
    );
  }

  const isOwnerOrAdmin = membership?.role === 'owner' || membership?.role === 'admin';

  const tabs: { key: Tab; label: string; show: boolean }[] = [
    { key: 'leaderboard', label: 'Leaderboard', show: true },
    { key: 'members', label: 'Miembros', show: true },
    { key: 'settings', label: 'Configuración', show: isOwnerOrAdmin },
  ];

  return (
    <AppShell>
      <section className="fade-in space-y-4 sm:space-y-6">
        <PageHeader title={group.name} showBackButton backTo="/groups" />

        {/* Content container */}
        <div className="rounded-2xl border p-4 sm:p-5" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

        {/* Group info */}
        <div className="mb-4">
          <div className="flex items-start justify-between">
            <div>
              {group.description && (
                <p className="text-xs mt-1 break-words" style={{ color: 'var(--color-muted)', overflowWrap: 'anywhere' }}>
                  {group.description}
                </p>
              )}
              <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
                {group.memberCount}/{group.maxMembers} miembros
              </p>
            </div>
            <span
              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0"
              style={{
                backgroundColor: group.privacy === 'public' ? 'rgba(34,197,94,0.1)' : 'rgba(99,102,241,0.1)',
                color: group.privacy === 'public' ? '#16a34a' : '#6366f1',
              }}
            >
              {group.privacy === 'public' ? 'Público' : group.privacy === 'private' ? 'Privado' : 'Invitación'}
            </span>
          </div>

          {/* Invite code for owner/admin */}
          {isOwnerOrAdmin && group.inviteCode && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                Código de invitación
              </p>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm font-mono font-bold px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-surface2)', color: 'var(--color-text)' }}>
                  {group.inviteCode}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(group.inviteCode || '');
                    setCodeCopied(true);
                    setTimeout(() => setCodeCopied(false), 2000);
                  }}
                  className="text-[10px] font-bold uppercase px-2 py-1 rounded transition hover:opacity-80"
                  style={{ color: codeCopied ? '#16a34a' : 'var(--color-primary)' }}
                >
                  {codeCopied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          )}

          {/* Leave group button (visible for all roles; component returns null for owners) */}
          <div className="mt-3">
            <LeaveGroupButton groupId={groupId} currentUserRole={membership?.role || 'member'} />
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ backgroundColor: 'var(--color-surface2)' }}>
          {tabs.filter(t => t.show).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2 px-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition text-center"
              style={{
                backgroundColor: activeTab === tab.key ? 'var(--color-surface)' : 'transparent',
                color: activeTab === tab.key ? 'var(--color-text)' : 'var(--color-muted)',
                boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'leaderboard' && (
          <GroupLeaderboard groupId={groupId} currentUserId={currentUserId} tournamentId={tournamentId} />
        )}
        {activeTab === 'members' && (
          <GroupMembers
            groupId={groupId}
            currentUserId={currentUserId}
            currentUserRole={membership?.role || 'member'}
          />
        )}
        {activeTab === 'settings' && isOwnerOrAdmin && (
          <GroupSettings
            group={group}
            currentUserRole={membership?.role || 'member'}
            onGroupUpdated={fetchGroupDetail}
          />
        )}

        </div>{/* End content container */}
      </section>
    </AppShell>
  );
}
