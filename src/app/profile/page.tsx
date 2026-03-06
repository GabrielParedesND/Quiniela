'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserId } from '@/lib/auth/cognito';
import { useUser } from '@/contexts/UserContext';
import AppShell from '@/components/AppShell';
import LoadingContent from '@/components/LoadingContent';
import PageHeader from '@/components/PageHeader';
import {
  PROFILE_AVATAR_OPTIONS,
  isProfileAvatarOption,
} from '@/lib/assets';
import {
  saveUserProfile,
  DEPARTAMENTOS_GT,
  MUNICIPIOS_GT_POR_DEPARTAMENTO,
  GENERO_OPTIONS,
  getDepartamentoCanonico,
  getMunicipioCanonico,
  validateAndNormalizeProfileFields,
} from '@/lib/db/users';

const inputClass =
  'w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none text-sm transition-all disabled:opacity-60';

const inputStyle = {
  backgroundColor: 'var(--color-surface2)',
  borderColor: 'var(--color-border)',
  color: 'var(--color-text)',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useUser();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    avatar: '/assets/PROFILE/unknown-football-shirt-svgrepo-com.svg',
    nombres: '',
    apellidos: '',
    dpi: '',
    tel: '',
    fechaNacimiento: '',
    departamento: '',
    municipio: '',
    genero: '',
  });

  const municipiosDisponibles = formData.departamento
    ? MUNICIPIOS_GT_POR_DEPARTAMENTO[formData.departamento as keyof typeof MUNICIPIOS_GT_POR_DEPARTAMENTO] || []
    : [];
  const avatarPreview = isProfileAvatarOption(formData.avatar)
    ? formData.avatar
    : '/assets/PROFILE/unknown-football-shirt-svgrepo-com.svg';

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.push('/');
        return;
      }

      if (!user) return;

      const departamentoCanonico = user.departamento ? getDepartamentoCanonico(user.departamento) : '';
      const municipioCanonico = user.municipio
        ? getMunicipioCanonico(departamentoCanonico, user.municipio)
        : '';

      setFormData({
        avatar: user.avatar && isProfileAvatarOption(user.avatar)
          ? user.avatar
          : '/assets/PROFILE/unknown-football-shirt-svgrepo-com.svg',
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        dpi: user.dpi || '',
        tel: user.tel || '',
        fechaNacimiento: user.fechaNacimiento || '',
        departamento: departamentoCanonico || user.departamento || '',
        municipio: municipioCanonico || '',
        genero: user.genero || '',
      });
    };

    checkAccess();
  }, [user, loading, router]);

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
    const avatarSeleccionado = isProfileAvatarOption(formData.avatar)
      ? formData.avatar
      : '/assets/PROFILE/unknown-football-shirt-svgrepo-com.svg';

    if (!validation.valid || !validation.normalized) {
      setError(validation.error || 'Revisa la información ingresada');
      setSaving(false);
      return;
    }

    try {
      const userId = await getUserId();
      if (!userId) throw new Error('No se pudo obtener el ID de usuario');

      await saveUserProfile({
        userId,
        createdAt: user?.createdAt || new Date().toISOString(),
        email: user?.email || '',
        ...validation.normalized,
        avatar: avatarSeleccionado,
      });

      await refreshUser();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <AppShell>
        <LoadingContent />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="fade-in space-y-4">
        <PageHeader title="Editar Perfil" showBackButton backTo="/dashboard" />

        <div className="p-6 rounded-3xl border shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
              Mantén tu información actualizada
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 border rounded-xl text-sm" style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-1 tracking-widest" style={{ color: 'var(--color-muted)' }}>
                Foto de perfil
              </label>
              <div className="rounded-2xl border p-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface2)' }}>
                <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 items-start md:items-center">
                  <div className="rounded-xl border p-3 flex flex-col items-center justify-center md:h-full" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                    <div
                      className="w-20 h-20 rounded-full border-2 overflow-hidden flex items-center justify-center"
                      style={{ borderColor: 'var(--color-primary)', backgroundColor: 'var(--color-surface2)' }}
                    >
                      <img src={avatarPreview} alt="Previsualización del avatar" className="w-full h-full object-contain p-1.5" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-3 text-center" style={{ color: 'var(--color-muted)' }}>
                      Previsualización
                    </p>
                  </div>

                  <div className="max-h-56 overflow-y-auto pr-1">
                    <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                      {PROFILE_AVATAR_OPTIONS.map((avatar) => {
                        const isSelected = formData.avatar === avatar;
                        return (
                          <button
                            key={avatar}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, avatar }))}
                            className="w-12 h-12 rounded-full border-2 transition-all hover:scale-105 flex items-center justify-center"
                            style={{
                              borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                              backgroundColor: 'var(--color-surface)',
                              boxShadow: isSelected ? '0 0 0 2px rgba(2,132,199,0.25)' : 'none',
                            }}
                            aria-label="Seleccionar foto de perfil"
                          >
                            <img src={avatar} alt="" className="w-8 h-8 object-contain" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>Nombres</label>
                <input name="nombres" value={formData.nombres} onChange={handleChange} required className={inputClass} style={inputStyle} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>Apellidos</label>
                <input name="apellidos" value={formData.apellidos} onChange={handleChange} required className={inputClass} style={inputStyle} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>DPI (13 dígitos)</label>
                <input
                  name="dpi"
                  maxLength={13}
                  value={formData.dpi}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dpi: e.target.value.replace(/[^0-9]/g, '') }))}
                  required
                  className={`${inputClass} font-mono`}
                  style={inputStyle}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>Teléfono (8 dígitos)</label>
                <input
                  name="tel"
                  maxLength={8}
                  value={formData.tel}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tel: e.target.value.replace(/[^0-9]/g, '') }))}
                  required
                  className={`${inputClass} font-mono`}
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>Fecha de Nacimiento</label>
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
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>Género</label>
                <select name="genero" value={formData.genero} onChange={handleChange} required className={inputClass} style={inputStyle}>
                  <option value="">Selecciona</option>
                  {GENERO_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>Departamento</label>
                <select name="departamento" value={formData.departamento} onChange={handleChange} required className={inputClass} style={inputStyle}>
                  <option value="">Selecciona</option>
                  {DEPARTAMENTOS_GT.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1" style={{ color: 'var(--color-muted)' }}>Municipio</label>
                <select
                  name="municipio"
                  value={formData.municipio}
                  onChange={handleChange}
                  required
                  disabled={!formData.departamento}
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="">{formData.departamento ? 'Selecciona' : 'Primero selecciona departamento'}</option>
                  {municipiosDisponibles.map((municipio) => (
                    <option key={municipio} value={municipio}>{municipio}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={saving}
                className="font-black py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg uppercase tracking-widest text-xs disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primaryText)' }}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="font-black py-3 px-6 rounded-xl transition-all border-2 uppercase tracking-widest text-xs"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                Volver al Inicio
              </button>
            </div>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
