'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCodeForTokens, parseIdToken, storeOAuthSession } from '@/lib/auth/oauth';
import { validateLogin } from '@/lib/auth/login-guard';
import { useUser } from '@/contexts/UserContext';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useUser();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double execution (React StrictMode in dev)
    if (processedRef.current) return;
    processedRef.current = true;

    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam) {
        setError(errorDescription || errorParam || 'Error de autenticación');
        return;
      }

      if (!code) {
        setError('No se recibió código de autorización');
        return;
      }

      try {
        // Exchange the authorization code for tokens
        const tokens = await exchangeCodeForTokens(code);

        // Parse ID token to extract email for access validation
        const payload = parseIdToken(tokens.id_token);

        if (!payload.email) {
          setError('No se pudo verificar el correo electrónico');
          return;
        }

        // Validate login access before storing session
        // Get projectId from cached branding config (set by BrandingContext)
        let projectId = '';
        try {
          const cached = localStorage.getItem('app-branding-config');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.brandingId && !parsed.brandingId.includes('#default')) {
              projectId = parsed.brandingId;
            }
          }
        } catch {}
        const validation = await validateLogin(payload.email, projectId);
        if (!validation.allowed) {
          setError(validation.message || 'Tu correo no está autorizado para iniciar sesión.');
          return;
        }

        // Store tokens in localStorage (compatible with amazon-cognito-identity-js)
        storeOAuthSession(
          tokens.id_token,
          tokens.access_token,
          tokens.refresh_token
        );

        // Refresh user context to pick up the new session
        await refreshUser();

        // Redirect to onboarding (which will redirect to dashboard if profile is complete)
        router.push('/onboarding');
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Error al procesar la autenticación');
      }
    };

    handleCallback();
  }, [searchParams, router, refreshUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-md w-full p-8 rounded-2xl shadow-xl text-center border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <span className="text-4xl mb-4 block">⚠️</span>
          <h1 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Error de autenticación
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
            {error}
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg uppercase tracking-widest text-xs"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primaryText)' }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
          Autenticando...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}
