'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { forgotPassword, confirmForgotPassword } from '@/lib/auth/cognito';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Error al enviar código');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      await confirmForgotPassword(email, code, newPassword);
      alert('Contraseña restablecida exitosamente');
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'reset') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        <section className="fade-in max-w-md w-full">
          <div className="p-8 rounded-2xl shadow-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🔑</div>
              <h2 className="text-2xl font-bold tracking-tighter uppercase italic" style={{ color: 'var(--color-text)' }}>
                Nueva Contraseña
              </h2>
              <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
                Código enviado a {email}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 border rounded-xl text-sm" style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>
                  Código de Verificación
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none text-sm text-center font-mono text-2xl tracking-widest transition-all"
                  style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>
                  Nueva Contraseña (mínimo 8 caracteres)
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full p-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none text-sm transition-all"
                    style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {showNewPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full p-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none text-sm transition-all"
                    style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {showConfirmPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg uppercase tracking-widest text-xs disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primaryText)' }}
              >
                {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setStep('email')}
                className="text-xs font-bold hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                Volver
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <section className="fade-in max-w-md w-full">
        <div className="p-8 rounded-2xl shadow-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold tracking-tighter uppercase italic" style={{ color: 'var(--color-text)' }}>
              Recuperar Contraseña
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
              Ingresa tu correo para recibir un código
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 border rounded-xl text-sm" style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSendCode} className="space-y-4">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none text-sm transition-all"
              style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg uppercase tracking-widest text-xs disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primaryText)' }}
            >
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-xs font-bold hover:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
