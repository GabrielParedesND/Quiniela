'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { authFetch } from '@/lib/api-client';
import { IS_DEMO_MODE } from '@/lib/demo-mode';

type Privacy = 'public' | 'private' | 'invite-only';

interface FormErrors {
  name?: string;
  description?: string;
  maxMembers?: string;
}

export default function CreateGroupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<Privacy>('invite-only');
  const [maxMembers, setMaxMembers] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      newErrors.name = 'El nombre es requerido';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }

    if (description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
    }

    if (maxMembers) {
      const num = parseInt(maxMembers, 10);
      if (isNaN(num) || num < 2 || num > 500) {
        newErrors.maxMembers = 'Debe ser un número entre 2 y 500';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      setSubmitting(true);

      // Demo mode: simulate group creation with localStorage
      if (IS_DEMO_MODE) {
        const groupId = `demo-group-${Date.now()}`;
        const stored = typeof window !== 'undefined' ? localStorage.getItem('quiniela_demo_groups') : null;
        const groups = stored ? JSON.parse(stored) : [];
        groups.push({ groupId, name: name.trim(), memberCount: 1, privacy });
        localStorage.setItem('quiniela_demo_groups', JSON.stringify(groups));
        router.push(`/groups/${groupId}`);
        return;
      }

      const body: Record<string, any> = {
        name: name.trim(),
        privacy,
      };
      if (description.trim()) body.description = description.trim();
      if (maxMembers) body.maxMembers = parseInt(maxMembers, 10);

      const res = await authFetch('/api/groups', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear el grupo');
      }

      const data = await res.json();
      const groupId = data.data?.groupId || data.groupId;
      router.push(`/groups/${groupId}`);
    } catch (err: any) {
      setServerError(err.message || 'Error al crear el grupo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <section className="fade-in space-y-4 sm:space-y-6 max-w-lg mx-auto">
        <PageHeader title="Crear Grupo" showBackButton backTo="/groups" />

        <div className="rounded-2xl border p-4 sm:p-5" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

        {serverError && (
          <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text)' }}>
              Nombre del grupo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
              style={{ backgroundColor: 'var(--color-surface)', border: errors.name ? '2px solid var(--color-danger)' : '1px solid var(--color-border)', color: 'var(--color-text)' }}
              placeholder="Ej: Los Cracks del Mundial"
            />
            {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text)' }}>
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition resize-none"
              style={{ backgroundColor: 'var(--color-surface)', border: errors.description ? '2px solid var(--color-danger)' : '1px solid var(--color-border)', color: 'var(--color-text)' }}
              placeholder="Describe tu grupo..."
            />
            <p className="text-[10px] mt-0.5 text-right" style={{ color: 'var(--color-muted)' }}>{description.length}/500</p>
            {errors.description && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.description}</p>}
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text)' }}>
              Privacidad
            </label>
            <div className="space-y-2">
              {([
                { value: 'invite-only' as Privacy, label: 'Solo invitación', desc: 'Solo con código de invitación' },
                { value: 'private' as Privacy, label: 'Privado', desc: 'Requiere aprobación del admin' },
                { value: 'public' as Privacy, label: 'Público', desc: 'Cualquiera con el código puede unirse' },
              ]).map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition"
                  style={{
                    backgroundColor: privacy === option.value ? 'rgba(99,102,241,0.05)' : 'var(--color-surface)',
                    border: privacy === option.value ? '2px solid rgba(99,102,241,0.3)' : '1px solid var(--color-border)',
                  }}
                >
                  <input
                    type="radio"
                    name="privacy"
                    value={option.value}
                    checked={privacy === option.value}
                    onChange={(e) => setPrivacy(e.target.value as Privacy)}
                    className="accent-indigo-500"
                  />
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>{option.label}</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Max members */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text)' }}>
              Máximo de miembros (opcional)
            </label>
            <input
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
              min={2}
              max={500}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
              style={{ backgroundColor: 'var(--color-surface)', border: errors.maxMembers ? '2px solid var(--color-danger)' : '1px solid var(--color-border)', color: 'var(--color-text)' }}
              placeholder="100 (por defecto)"
            />
            {errors.maxMembers && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.maxMembers}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {submitting ? 'Creando...' : 'Crear Grupo'}
          </button>
        </form>
        </div>{/* End content container */}
      </section>
    </AppShell>
  );
}
