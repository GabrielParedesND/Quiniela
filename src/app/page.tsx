'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth/cognito';
import { signIn } from '@/lib/auth/cognito';
import { useUser } from '@/contexts/UserContext';
import { isProfileComplete } from '@/lib/db/users';
import { brandAssets } from '@/lib/assets';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: userLoading, refreshUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      if (userLoading) return;

      const authenticated = await isAuthenticated();
      if (authenticated && user) {
        // Si tiene sesión activa, verificar perfil
        if (isProfileComplete(user)) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }
    };

    checkSession();
  }, [user, userLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn({ email, password });
      await refreshUser();
      // Navegar a onboarding, que redirigirá a dashboard si el perfil está completo
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = () => {
    alert('Registro con redes sociales próximamente');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <section className="fade-in max-w-md w-full">
        <div className="p-8 rounded-2xl shadow-xl text-center border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <img src={brandAssets.logos.large} alt="Logo" className="w-64 h-auto mx-auto mb-6" />
          <p className="mb-8 text-sm" style={{ color: 'var(--color-muted)' }}>Ingresa para gestionar tus pronósticos</p>

          <div className="space-y-3 mb-6">
            <button
              onClick={handleSocialLogin}
              className="w-full flex items-center justify-center space-x-3 py-3 rounded-xl font-semibold text-sm border-2 transition-all hover:shadow-md"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', backgroundColor: 'var(--color-surface2)' }}
            >
              <img
                src={brandAssets.social.google}
                className="w-5 h-5"
                alt="Google"
              />
              <span>Continuar con Google</span>
            </button>
            <button
              onClick={handleSocialLogin}
              className="w-full flex items-center justify-center space-x-3 py-3 rounded-xl font-semibold text-sm border-2 transition-all hover:shadow-md"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', backgroundColor: 'var(--color-surface2)' }}
            >
              <img
                src={brandAssets.social.facebook}
                className="w-5 h-5"
                alt="Facebook"
              />
              <span>Continuar con Facebook</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }}></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 font-bold" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-muted)' }}>O de forma manual</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 border rounded-xl text-sm" style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none text-sm transition-all"
              style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
            <div className="text-right">
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-xs font-bold hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg uppercase tracking-widest text-xs disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primaryText)' }}
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => router.push('/register')}
                className="font-bold hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
