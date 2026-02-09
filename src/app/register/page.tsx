'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp, confirmSignUp, resendConfirmationCode, signIn } from '@/lib/auth/cognito';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'register' | 'confirm'>('register');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const field = id.replace('reg-', '');
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
      });

      setStep('confirm');
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await confirmSignUp(formData.email, formData.verificationCode);
      await signIn({
        email: formData.email,
        password: formData.password,
      });

      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Código de verificación inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      await resendConfirmationCode(formData.email);
      alert('Código reenviado a tu correo');
    } catch (err: any) {
      setError(err.message || 'Error al reenviar código');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'confirm') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        <section className="fade-in max-w-md w-full mt-6">
          <div className="p-6 rounded-2xl shadow-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="mb-6 text-center">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-xl font-black uppercase tracking-tighter italic" style={{ color: 'var(--color-text)' }}>
                Verifica tu Correo
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest mt-2" style={{ color: 'var(--color-muted)' }}>
                Código enviado a
              </p>
              <p className="text-sm font-bold mt-1" style={{ color: 'var(--color-primary)' }}>{formData.email}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 border rounded-xl text-sm" style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleConfirm} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>
                  Código de Verificación
                </label>
                <input
                  type="text"
                  id="reg-verificationCode"
                  placeholder="000000"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  required
                  maxLength={6}
                  className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none text-sm text-center font-mono text-2xl tracking-widest transition-all"
                  style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-black py-4 rounded-xl transition-all shadow-md hover:shadow-lg uppercase tracking-widest text-xs disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primaryText)' }}
                >
                  {loading ? 'Verificando...' : 'Verificar Cuenta'}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                ¿No recibiste el código?{' '}
                <button
                  onClick={handleResendCode}
                  disabled={loading}
                  className="font-bold hover:underline disabled:opacity-50"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Reenviar
                </button>
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <section className="fade-in max-w-md w-full mt-6">
        <div className="p-6 rounded-2xl shadow-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="mb-6">
            <h2 className="text-xl font-black uppercase tracking-tighter italic" style={{ color: 'var(--color-text)' }}>
              Crear Cuenta
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
              Copa Mundial 2026
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 border rounded-xl text-sm" style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>
                Correo Electrónico
              </label>
              <input
                type="email"
                id="reg-email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none text-sm transition-all"
                style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>
                Contraseña (mínimo 8 caracteres)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reg-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full p-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none text-sm transition-all"
                  style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {showPassword ? (
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
                  id="reg-confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full font-black py-4 rounded-xl transition-all shadow-md hover:shadow-lg uppercase tracking-widest text-xs disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primaryText)' }}
              >
                {loading ? 'Creando cuenta...' : 'Continuar'}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => router.push('/')}
                className="font-bold hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
