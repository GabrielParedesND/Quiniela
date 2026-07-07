'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signUp, confirmSignUp, resendConfirmationCode, signIn } from '@/lib/auth/cognito';
import { getSocialLoginUrl, type SocialProvider } from '@/lib/auth/oauth';
import { getSocialProviderConfig, type SocialProviderConfig } from '@/lib/auth/social-provider-manager';
import { validateRegistration } from '@/lib/auth/registration-guard';
import { useBranding } from '@/contexts/BrandingContext';

export default function RegisterPage() {
  const router = useRouter();
  const { config: brandingConfig } = useBranding();
  const [step, setStep] = useState<'register' | 'confirm'>('register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socialConfig, setSocialConfig] = useState<SocialProviderConfig>({ google: false, facebook: false });

  useEffect(() => {
    const loadSocialConfig = async () => {
      if (!brandingConfig.brandingId || brandingConfig.brandingId.includes('#default')) return;
      const result = await getSocialProviderConfig(brandingConfig.brandingId);
      setSocialConfig(result);
    };
    loadSocialConfig();
  }, [brandingConfig.brandingId]);

  const handleSocialLogin = (provider: SocialProvider) => {
    window.location.href = getSocialLoginUrl(provider);
  };

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

    // Validate registration access before calling Cognito
    const validation = await validateRegistration(formData.email, brandingConfig.brandingId);
    if (!validation.allowed) {
      setError(validation.message || 'Tu correo no está autorizado para registrarse.');
      setLoading(false);
      return;
    }

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
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

    if (!formData.verificationCode || formData.verificationCode.length !== 6) {
      setError('Por favor ingresa un código de 6 dígitos');
      setLoading(false);
      return;
    }

    try {
      await confirmSignUp(formData.email, formData.verificationCode);
      await signIn({
        email: formData.email,
        password: formData.password,
      });

      router.push('/onboarding');
    } catch (err: any) {
      console.error('Confirmation error:', err);
      setError(err.message || 'Código de verificación inválido');
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

          {/* Social login buttons - conditionally rendered based on provider config */}
          {(socialConfig.google || socialConfig.facebook) && (
            <>
              <div className="space-y-3 mb-6">
                {socialConfig.google && (
                  <button
                    type="button"
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
                    type="button"
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

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>
                Nombre Completo
              </label>
              <input
                type="text"
                id="reg-name"
                placeholder="Tu nombre completo"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none text-sm transition-all"
                style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>

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
