'use client';

import { useBranding } from '@/contexts/BrandingContext';

export default function Footer() {
  const { config } = useBranding();
  const masterSponsor = config.sponsors.master[0];
  const brandLogo = config.assets.logos.main;

  return (
    <footer className="bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-10 rounded-2xl border border-cyan-300/25 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200 mb-2">Último llamado</p>
              <h3 className="text-3xl font-black">Hoy puede ser tu primer gran acierto</h3>
            </div>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-3 text-base font-black text-slate-900 transition hover:scale-[1.02]"
            >
              Entrar a la Quiniela
            </a>
          </div>
        </div>

        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Branding */}
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-4">
              {brandLogo ? (
                <img
                  src={brandLogo}
                  alt="Logo Quiniela Mundialista"
                  className="h-10 w-auto object-contain"
                />
              ) : null}
              <span className="text-xl font-bold text-white">Quiniela Mundialista 2026</span>
            </div>
            {masterSponsor ? (
              <div className="mb-4">
                <img src={masterSponsor} alt="Patrocinador principal" className="h-8 w-auto object-contain" />
              </div>
            ) : null}
            <p className="text-slate-300 text-sm mb-4 max-w-xl">
              La Quiniela Mundialista oficial que premia tu pasión por el fútbol.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/20 transition-colors" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/20 transition-colors" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/20 transition-colors" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Información</h4>
            <ul className="space-y-2">
              <li><a href="/como-jugar" className="text-slate-300 hover:text-white transition-colors text-sm">¿Cómo funciona?</a></li>
              <li><a href="/premios" className="text-slate-300 hover:text-white transition-colors text-sm">Premios</a></li>
              <li><a href="/reglas" className="text-slate-300 hover:text-white transition-colors text-sm">Reglas</a></li>
              <li><a href="/soporte" className="text-slate-300 hover:text-white transition-colors text-sm">Soporte</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="/terminos" className="text-slate-300 hover:text-white transition-colors text-sm">Términos y condiciones</a></li>
              <li><a href="/privacidad" className="text-slate-300 hover:text-white transition-colors text-sm">Política de privacidad</a></li>
              <li><a href="/reglas" className="text-slate-300 hover:text-white transition-colors text-sm">Reglas</a></li>
              <li><a href="/contacto" className="text-slate-300 hover:text-white transition-colors text-sm">Contacto</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/15 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-300 text-center md:text-left">
              © {new Date().getFullYear()} {config.content?.pageTitle || 'Quiniela Mundialista'}. Todos los derechos reservados.
            </p>
            <p className="text-xs text-slate-400 text-center md:text-right">
              Promoción válida según calendario oficial del Mundial 2026. Consulta bases completas.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
