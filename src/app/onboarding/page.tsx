'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserId } from '@/lib/auth/cognito';
import { saveUserProfile, isProfileComplete } from '@/lib/db/users';
import { useUser } from '@/contexts/UserContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: userLoading, refreshUser } = useUser();
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dpi: '',
    tel: '',
    edad: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.push('/');
        return;
      }

      // Si ya tiene perfil completo, redirigir a dashboard
      if (user && isProfileComplete(user)) {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    };

    if (!userLoading) {
      checkAuth();
    }
  }, [router, user, userLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const field = id.replace('reg-', '');
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (formData.dpi.length < 13 || formData.tel.length < 8) {
      setError('Por favor verifica los dígitos de DPI (13) y Teléfono (8)');
      setSaving(false);
      return;
    }

    try {
      const userId = await getUserId();
      if (!userId) throw new Error('No se pudo obtener el ID de usuario');

      await saveUserProfile({
        userId,
        createdAt: new Date().toISOString(),
        email: '',
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        dpi: formData.dpi,
        tel: formData.tel,
        edad: formData.edad,
      });

      await refreshUser();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al guardar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-muted)' }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <section className="fade-in max-w-md w-full mt-6">
        <div className="p-6 rounded-2xl shadow-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="mb-6">
            <h2 className="text-xl font-black uppercase tracking-tighter italic" style={{ color: 'var(--color-text)' }}>
              Completa tu Perfil
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
              Información del Participante
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 border rounded-xl text-sm" style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                id="reg-nombres"
                placeholder="Nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
                className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none text-sm transition-all"
                style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
              <input
                type="text"
                id="reg-apellidos"
                placeholder="Apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
                className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none text-sm transition-all"
                style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>
                DPI (13 dígitos)
              </label>
              <input
                type="text"
                id="reg-dpi"
                placeholder="0000 00000 0000"
                maxLength={13}
                value={formData.dpi}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData((prev) => ({ ...prev, dpi: value }));
                }}
                required
                className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none text-sm font-mono transition-all"
                style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>
                  Teléfono (8 dígitos)
                </label>
                <input
                  type="text"
                  id="reg-tel"
                  placeholder="0000 0000"
                  maxLength={8}
                  value={formData.tel}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData((prev) => ({ ...prev, tel: value }));
                  }}
                  required
                  className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none text-sm font-mono transition-all"
                  style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>Edad</label>
                <input
                  type="number"
                  id="reg-edad"
                  placeholder="Edad"
                  min="12"
                  max="99"
                  value={formData.edad}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none text-sm transition-all"
                  style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full font-black py-4 rounded-xl transition-all shadow-md hover:shadow-lg uppercase tracking-widest text-xs disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primaryText)' }}
              >
                {saving ? 'Guardando...' : 'Completar Registro'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
