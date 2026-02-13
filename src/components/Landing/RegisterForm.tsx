'use client';

import { useState } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function RegisterForm() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [formData, setFormData] = useState({
    name: '',
    dpi: '',
    phone: '',
    email: '',
    terms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: 'submit_register' });
    }

    setFormState('loading');

    // Simulate API call
    setTimeout(() => {
      setFormState('success');
      setTimeout(() => {
        window.location.href = '/onboarding';
      }, 2000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const isValid = formData.name && formData.phone && formData.email && formData.terms;

  return (
    <section id="registro" className="py-20 bg-bg">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-text mb-4">
            ¡Regístrate Ahora!
          </h2>
          <p className="text-xl text-muted">
            Solo toma un minuto. Empieza a participar hoy mismo
          </p>
        </div>

        <div className="bg-surface p-8 rounded-xl border-2 border-border shadow-xl">
          {formState === 'success' ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6">
                <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 text-primaryText">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text mb-3">¡Registro Exitoso!</h3>
              <p className="text-muted">Redirigiendo a tu dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-text mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-bg border-2 border-border rounded-lg text-text focus:border-primary focus:outline-none transition-colors"
                  placeholder="Ingresa tu nombre completo"
                />
              </div>

              {/* DPI */}
              <div>
                <label htmlFor="dpi" className="block text-sm font-bold text-text mb-2">
                  DPI (Opcional)
                </label>
                <input
                  type="text"
                  id="dpi"
                  name="dpi"
                  value={formData.dpi}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-bg border-2 border-border rounded-lg text-text focus:border-primary focus:outline-none transition-colors"
                  placeholder="1234 56789 0101"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-text mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-bg border-2 border-border rounded-lg text-text focus:border-primary focus:outline-none transition-colors"
                  placeholder="1234-5678"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-text mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-bg border-2 border-border rounded-lg text-text focus:border-primary focus:outline-none transition-colors"
                  placeholder="tu@email.com"
                />
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  required
                  className="mt-1 w-5 h-5 accent-primary"
                />
                <label htmlFor="terms" className="text-sm text-muted">
                  Acepto los{' '}
                  <a href="/terminos" className="text-primary hover:underline">
                    términos y condiciones
                  </a>{' '}
                  y la{' '}
                  <a href="/privacidad" className="text-primary hover:underline">
                    política de privacidad
                  </a>
                  . Mis datos serán utilizados únicamente para la gestión de la quiniela y comunicaciones relacionadas.
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!isValid || formState === 'loading'}
                className="w-full bg-primary text-primaryText py-4 rounded-lg font-bold text-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {formState === 'loading' ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Registrando...
                  </>
                ) : (
                  'Completar Registro'
                )}
              </button>

              <p className="text-xs text-muted text-center">
                * Campos obligatorios. Tu información está protegida y no será compartida con terceros.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
