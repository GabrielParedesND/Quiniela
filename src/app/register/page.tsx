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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <section className="fade-in max-w-md w-full mt-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
            <div className="mb-6 text-center">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">
                Verifica tu Correo
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">
                Código enviado a
              </p>
              <p className="text-sm text-blue-600 font-bold mt-1">{formData.email}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleConfirm} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
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
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-center font-mono text-2xl tracking-widest"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition shadow-lg uppercase tracking-widest text-xs disabled:opacity-50"
                >
                  {loading ? 'Verificando...' : 'Verificar Cuenta'}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-slate-500">
                ¿No recibiste el código?{' '}
                <button
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-blue-600 font-bold hover:underline disabled:opacity-50"
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <section className="fade-in max-w-md w-full mt-6">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">
              Crear Cuenta
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Copa Mundial 2026
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="reg-email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                Contraseña (mínimo 8 caracteres)
              </label>
              <input
                type="password"
                id="reg-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                id="reg-confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition shadow-lg uppercase tracking-widest text-xs disabled:opacity-50"
              >
                {loading ? 'Creando cuenta...' : 'Continuar'}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 font-bold hover:underline"
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
