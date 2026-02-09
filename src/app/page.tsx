'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth/cognito';
import { useUser } from '@/contexts/UserContext';
import ImagePlaceholder from '@/components/ImagePlaceholder';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn({ email, password });
      await refreshUser();
      router.push('/dashboard');
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
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Background placeholder */}
      <div 
        className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"
        title="Background Pattern\n1920x1080px\nAspect Ratio: 16:9"
      >
        <div className="text-center">
          <p className="text-4xl font-black" style={{ color: 'var(--color-warning)' }}>BACKGROUND PATTERN</p>
          <p className="text-2xl font-bold mt-2" style={{ color: 'var(--color-muted)' }}>1920x1080px (16:9)</p>
        </div>
      </div>
      
      <section className="fade-in max-w-md w-full relative z-10">
        <div className="p-8 rounded-2xl shadow-xl text-center border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex justify-center mb-4">
            <ImagePlaceholder width={96} height={96} label="LOGO LARGE" />
          </div>
          <h2 className="text-2xl font-bold mb-2 tracking-tighter uppercase italic" style={{ color: 'var(--color-text)' }}>
            Quiniela Mundialista
          </h2>
          <p className="mb-8 text-sm" style={{ color: 'var(--color-muted)' }}>Ingresa para gestionar tus pronósticos</p>

          <div className="space-y-3 mb-6">
            <button
              onClick={handleSocialLogin}
              className="social-btn w-full flex items-center justify-center space-x-3 py-3 rounded-xl font-semibold text-sm border hover:opacity-80 transition"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', backgroundColor: 'var(--color-surface2)' }}
            >
              <ImagePlaceholder width={24} height={24} label="G" />
              <span>Continuar con Google</span>
            </button>
            <button
              onClick={handleSocialLogin}
              className="social-btn w-full flex items-center justify-center space-x-3 py-3 rounded-xl font-semibold text-sm border hover:opacity-80 transition"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', backgroundColor: 'var(--color-surface2)' }}
            >
              <ImagePlaceholder width={24} height={24} label="F" />
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
              className="w-full p-3 border rounded-xl focus:ring-2 outline-none text-sm"
              style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border rounded-xl focus:ring-2 outline-none text-sm"
              style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-3 rounded-xl transition shadow-md uppercase tracking-widest text-xs disabled:opacity-50 hover:opacity-90"
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
