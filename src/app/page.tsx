'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth/cognito';
import { signIn } from '@/lib/auth/cognito';
import { getSocialLoginUrl, type SocialProvider } from '@/lib/auth/oauth';
import { getSocialProviderConfig, type SocialProviderConfig } from '@/lib/auth/social-provider-manager';
import { validateLogin } from '@/lib/auth/login-guard';
import { useUser } from '@/contexts/UserContext';
import { isProfileComplete } from '@/lib/db/users';
import { useBranding } from '@/contexts/BrandingContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: userLoading, refreshUser } = useUser();
  const { config, loading: brandingLoading, isDefault: brandingIsDefault } = useBranding();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socialConfig, setSocialConfig] = useState<SocialProviderConfig>({ google: false, facebook: false });

  useEffect(() => {
    const loadSocialConfig = async () => {
      if (!config.brandingId || config.brandingId.includes('#default')) return;
      const result = await getSocialProviderConfig(config.brandingId);
      setSocialConfig(result);
    };
    loadSocialConfig();
  }, [config.brandingId]);

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

    // Validate login access before credential verification
    const validation = await validateLogin(email, config.brandingId);
    if (!validation.allowed) {
      setError(validation.message || 'Tu correo no está autorizado para iniciar sesión.');
      setLoading(false);
      return;
    }

    try {
      await signIn({ email, password });
      await refreshUser();
      // Mark that user just logged in so the dashboard can fire the after-login trigger
      try { sessionStorage.setItem('survey-just-logged-in', '1'); } catch {}
      // Navegar a onboarding, que redirigirá a dashboard si el perfil está completo
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: SocialProvider) => {
    window.location.href = getSocialLoginUrl(provider);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundColor: 'var(--color-bg)',
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.45)), url('${config.assets.backgrounds.dashboard}')`,
      }}
    >
      <section className="fade-in max-w-md w-full">
        <div className="p-8 rounded-2xl shadow-xl text-center border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          {brandingLoading && brandingIsDefault ? (
            <div className="w-64 h-16 mx-auto mb-6 flex items-center justify-center">
              <div className="w-48 h-12 rounded skeleton" />
            </div>
          ) : config.assets?.logos?.large || config.assets?.logos?.main ? (
            <img 
              src={config.assets.logos.large || config.assets.logos.main} 
              alt="Logo" 
              className="w-64 h-auto mx-auto mb-6"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-64 h-16 mx-auto mb-6 flex items-center justify-center">
              <span className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>
                {config.content?.pageTitle || 'Quiniela'}
              </span>
            </div>
          )}
          {config.content?.pageTitle && (
            <h1 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>
              {config.content.pageTitle}
            </h1>
          )}
          <p className="mb-8 text-sm" style={{ color: 'var(--color-muted)' }}>
            {config.content?.pageDescription || 'Ingresa para gestionar tus pronósticos'}
          </p>

          {/* Social login buttons - conditionally rendered based on provider config */}
          {(socialConfig.google || socialConfig.facebook) && (
            <>
              <div className="space-y-3 mb-6">
                {socialConfig.google && (
                  <button
                    onClick={() => handleSocialLogin('Google')}
                    className="w-full flex items-center justify-center space-x-3 py-3 rounded-xl font-semibold text-sm border-2 transition-all hover:shadow-md"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', backgroundColor: 'var(--color-surface2)' }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Continuar con Google</span>
                  </button>
                )}
                {socialConfig.facebook && (
                  <button
                    onClick={() => handleSocialLogin('Facebook')}
                    className="w-full flex items-center justify-center space-x-3 py-3 rounded-xl font-semibold text-sm border-2 transition-all hover:shadow-md"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', backgroundColor: 'var(--color-surface2)' }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Continuar con Facebook</span>
                  </button>
                )}
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }}></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 font-bold" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-muted)' }}>O de forma manual</span>
                </div>
              </div>
            </>
          )}

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
