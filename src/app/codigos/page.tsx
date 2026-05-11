'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId, isAuthenticated } from '@/lib/auth/cognito';
import { useUser } from '@/contexts/UserContext';
import { isProfileComplete } from '@/lib/db/users';
import AppShell from '@/components/AppShell';
import LoadingContent from '@/components/LoadingContent';

export default function CodigosPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [userId, setUserId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; multiplier?: number; error?: string } | null>(null);
  const [activeMultiplier, setActiveMultiplier] = useState<{ multiplier: number; code: string } | null>(null);
  const [checkingMultiplier, setCheckingMultiplier] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (loading) return;
      const authenticated = await isAuthenticated();
      if (!authenticated) { router.push('/'); return; }
      if (!user) return;
      if (!isProfileComplete(user)) { router.push('/onboarding'); return; }

      const uid = await getUserId();
      setUserId(uid);

      // Check for active multiplier today
      try {
        const res = await fetch(`/api/printed-codes?userId=${encodeURIComponent(uid || '')}`);
        const data = await res.json();
        if (data.hasActiveMultiplier) {
          setActiveMultiplier({ multiplier: data.multiplier, code: data.code });
        }
      } catch { /* ignore */ }
      setCheckingMultiplier(false);
    };
    init();
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !code.trim()) return;

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/printed-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), userId }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, message: data.message, multiplier: data.multiplier });
        setActiveMultiplier({ multiplier: data.multiplier, code: code.trim().toUpperCase() });
        setCode('');
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch {
      setResult({ success: false, error: 'Error de conexión' });
    }
    setSubmitting(false);
  };

  if (loading || !user) {
    return <AppShell><LoadingContent /></AppShell>;
  }

  return (
    <AppShell>
      <section className="fade-in space-y-6 max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            Ingresa tu código de ejemplar
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Canjea el código de tu periódico impreso para multiplicar tus puntos del día
          </p>
        </div>

        {/* Active multiplier banner */}
        {!checkingMultiplier && activeMultiplier && (
          <div
            className="rounded-2xl p-4 text-center border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
              Multiplicador activo hoy
            </p>
            <p className="text-2xl font-black mt-1" style={{ color: 'var(--color-primary)' }}>
              x{activeMultiplier.multiplier}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Código: {activeMultiplier.code}
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
              El multiplicador se aplicará al cierre del día sobre los puntos generados hoy.
            </p>
          </div>
        )}

        {/* Code input form */}
        {!activeMultiplier && (
          <form onSubmit={handleSubmit}>
            <div
              className="rounded-2xl p-6 border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Código de ejemplar
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123XYZ"
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl border text-center text-lg font-mono tracking-widest uppercase"
                style={{
                  backgroundColor: 'var(--color-surface2)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
                autoFocus
              />
              <button
                type="submit"
                disabled={submitting || !code.trim()}
                className="w-full mt-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-primaryText)',
                }}
              >
                {submitting ? 'Validando...' : 'Canjear código'}
              </button>
            </div>
          </form>
        )}

        {/* Result message */}
        {result && (
          <div
            className="rounded-2xl p-4 text-center border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: result.success ? 'var(--color-success)' : 'var(--color-danger)',
            }}
          >
            <p className="text-2xl mb-2">{result.success ? '🎉' : '❌'}</p>
            <p className="text-sm font-medium" style={{ color: result.success ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {result.success ? result.message : result.error}
            </p>
          </div>
        )}

        <div
          className="rounded-2xl p-4 border"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--color-text)' }}>¿Cómo funciona?</h3>
          <ul className="text-xs space-y-1" style={{ color: 'var(--color-muted)' }}>
            <li>1. Encuentra el código en tu ejemplar impreso</li>
            <li>2. Ingresa el código aquí</li>
            <li>3. Tus puntos del día se multiplicarán automáticamente</li>
            <li>4. El multiplicador se aplica al cierre del día</li>
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
