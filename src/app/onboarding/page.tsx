'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserId, getUserAttributes } from '@/lib/auth/cognito';
import {
  saveUserProfile,
  isProfileComplete,
  DEPARTAMENTOS_GT,
  MUNICIPIOS_GT_POR_DEPARTAMENTO,
  GENERO_OPTIONS,
  getDepartamentoCanonico,
  getMunicipioCanonico,
  validateAndNormalizeProfileFields,
} from '@/lib/db/users';
import { getRandomProfileAvatar, isProfileAvatarOption } from '@/lib/assets';
import { useUser } from '@/contexts/UserContext';
import { useBranding } from '@/contexts/BrandingContext';

const inputClass =
  'w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none text-sm transition-all';

const inputStyle = {
  backgroundColor: 'var(--color-surface2)',
  borderColor: 'var(--color-border)',
  color: 'var(--color-text)',
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: userLoading, refreshUser } = useUser();
  const { config } = useBranding();
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dpi: '',
    tel: '',
    fechaNacimiento: '',
    departamento: '',
    municipio: '',
    genero: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const municipiosDisponibles = formData.departamento
    ? MUNICIPIOS_GT_POR_DEPARTAMENTO[formData.departamento as keyof typeof MUNICIPIOS_GT_POR_DEPARTAMENTO] || []
    : [];

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.push('/');
        return;
      }

      if (user && isProfileComplete(user)) {
        router.push('/dashboard');
        return;
      }

      if (user) {
        const departamentoCanonico = user.departamento ? getDepartamentoCanonico(user.departamento) : '';
        const municipioCanonico = user.municipio
          ? getMunicipioCanonico(departamentoCanonico, user.municipio)
          : '';

        setFormData((prev) => ({
          nombres: user.nombres || prev.nombres,
          apellidos: user.apellidos || prev.apellidos,
          dpi: user.dpi || prev.dpi,
          tel: user.tel || prev.tel,
          fechaNacimiento: user.fechaNacimiento || prev.fechaNacimiento,
          departamento: departamentoCanonico || prev.departamento,
          municipio: municipioCanonico || '',
          genero: user.genero || prev.genero,
        }));
      }

      // If nombres is still empty, try to get the name from Cognito attributes
      if (!user?.nombres) {
        try {
          const attrs = await getUserAttributes();
          if (attrs?.name) {
            const nameParts = attrs.name.split(' ');
            const firstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
            const lastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');
            setFormData((prev) => ({
              ...prev,
              nombres: prev.nombres || firstName,
              apellidos: prev.apellidos || lastName,
            }));
          }
        } catch {
          // Cognito attributes not available (e.g., social login without session)
        }
      }

      setLoading(false);
    };

    if (!userLoading) {
      checkAuth();
    }
  }, [router, user, userLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'departamento') {
      setFormData((prev) => ({
        ...prev,
        departamento: value,
        municipio: '',
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const validation = validateAndNormalizeProfileFields(formData);
    if (!validation.valid || !validation.normalized) {
      setError(validation.error || 'Revisa la información ingresada');
      setSaving(false);
      return;
    }

    try {
      const userId = await getUserId();
      if (!userId) throw new Error('No se pudo obtener el ID de usuario');

      // Get email from Cognito attributes if not available in user profile
      let email = user?.email || '';
      if (!email) {
        try {
          const attrs = await getUserAttributes();
          email = attrs?.email || '';
        } catch {
          // Cognito attributes not available
        }
      }

      await saveUserProfile({
        userId,
        createdAt: user?.createdAt || new Date().toISOString(),
        email,
        avatar: user?.avatar && isProfileAvatarOption(user.avatar)
          ? user.avatar
          : getRandomProfileAvatar(),
        ...validation.normalized,
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
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundColor: 'var(--color-bg)',
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.45)), url('${config.assets.backgrounds.dashboard}')`,
        }}
      >
        <p style={{ color: 'var(--color-muted)' }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundColor: 'var(--color-bg)',
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.45)), url('${config.assets.backgrounds.dashboard}')`,
      }}
    >
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
                name="nombres"
                placeholder="Nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
                className={inputClass}
                style={inputStyle}
              />
              <input
                type="text"
                name="apellidos"
                placeholder="Apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>
                DPI (13 dígitos)
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="dpi"
                placeholder="0000 00000 0000"
                maxLength={13}
                value={formData.dpi}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData((prev) => ({ ...prev, dpi: value }));
                }}
                required
                className={`${inputClass} font-mono`}
                style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>
                  Teléfono (8 dígitos)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="tel"
                  placeholder="0000 0000"
                  maxLength={8}
                  value={formData.tel}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData((prev) => ({ ...prev, tel: value }));
                  }}
                  required
                  className={`${inputClass} font-mono`}
                  style={inputStyle}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>
                Género
              </label>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                required
                className={inputClass}
                style={inputStyle}
              >
                <option value="">Selecciona</option>
                {GENERO_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>
                  Departamento
                </label>
                <select
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="">Selecciona</option>
                  {DEPARTAMENTOS_GT.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>
                  Municipio
                </label>
                <select
                  name="municipio"
                  value={formData.municipio}
                  onChange={handleChange}
                  required
                  disabled={!formData.departamento}
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="">
                    {formData.departamento ? 'Selecciona' : 'Primero selecciona departamento'}
                  </option>
                  {municipiosDisponibles.map((municipio) => (
                    <option key={municipio} value={municipio}>
                      {municipio}
                    </option>
                  ))}
                </select>
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
