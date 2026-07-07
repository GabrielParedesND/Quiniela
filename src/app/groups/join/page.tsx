'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '@/lib/api-client';
import AppShell from '@/components/AppShell';

function JoinGroupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ groupId: string; groupName: string; status: string } | null>(null);

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setCode(codeParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedCode = code.trim();
    if (!trimmedCode || trimmedCode.length < 8) {
      setError('El código debe tener al menos 8 caracteres');
      return;
    }

    try {
      setSubmitting(true);
      const res = await authFetch('/api/groups/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode: trimmedCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Código de invitación inválido');
      }

      setSuccess({
        groupId: data.groupId,
        groupName: data.groupName,
        status: data.status,
      });

      // Redirect after a short delay on success
      if (data.status === 'joined') {
        setTimeout(() => {
          router.push(`/groups/${data.groupId}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Error al unirse al grupo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <section className="fade-in space-y-4 sm:space-y-6 max-w-lg mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push('/groups')}
          className="text-xs font-bold uppercase tracking-wider transition hover:opacity-80"
          style={{ color: 'var(--color-primary)' }}
        >
          ← Volver a Grupos
        </button>

        <h1 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--color-text)' }}>
          Unirse a un Grupo
        </h1>

        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          Ingresa el código de invitación que te compartieron para unirte a un grupo.
        </p>

        {/* Success message */}
        {success && (
          <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
            {success.status === 'joined' ? (
              <p>¡Te has unido a <strong>{success.groupName}</strong>! Redirigiendo...</p>
            ) : (
              <p>Tu solicitud para unirte a <strong>{success.groupName}</strong> está pendiente de aprobación.</p>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)' }}>
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={submitting || !code.trim()}
              className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {submitting ? 'Verificando...' : 'Unirse al Grupo'}
            </button>
          </form>
        )}

        {success && success.status === 'pending_approval' && (
          <button
            onClick={() => router.push('/groups')}
            className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition hover:opacity-80"
            style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            Volver a Mis Grupos
          </button>
        )}
      </section>
    </AppShell>
  );
}

export default function JoinGroupPage() {
  return (
    <Suspense>
      <JoinGroupContent />
    </Suspense>
  );
}
