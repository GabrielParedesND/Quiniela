'use client';

import type { MouseEvent } from 'react';
import { useBranding } from '@/contexts/BrandingContext';

export default function Hero() {
  const { config } = useBranding();

  const handleCTA = (action: string) => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: action });
    }
  };

  const handleSmoothScroll = (e: MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    handleCTA('click_how_it_works');
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.45),transparent_48%),radial-gradient(circle_at_85%_25%,rgba(2,132,199,0.35),transparent_42%),linear-gradient(130deg,#020617_20%,#0f172a_55%,#111827_100%)]" />
      <div className="absolute left-[-140px] top-[-110px] h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="absolute right-[-140px] bottom-[-120px] h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 md:pb-24 md:pt-16">
        <div className="mb-12 flex flex-wrap items-center justify-center gap-4 md:justify-between">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
            <img
              src={config.assets.logos.main}
              alt="Logo Quiniela Mundialista"
              className="h-9 w-9 object-contain"
            />
            <span className="text-sm font-semibold tracking-wide text-white/90">Quiniela Mundialista 2026</span>
          </div>
          <div className="inline-flex items-center rounded-full border border-amber-300/30 bg-amber-400/15 px-4 py-2 text-sm font-bold text-amber-200">
            Premios semanales + gran final
          </div>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-100">
              Experiencia Oficial
            </div>

            <h1 className="mb-6 text-4xl font-black leading-tight md:text-6xl lg:text-7xl">
              Convierte tu pasión en
              <span className="block bg-gradient-to-r from-cyan-200 via-white to-amber-200 bg-clip-text text-transparent">
                premios reales
              </span>
            </h1>

            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-200 md:text-xl">
              Pronostica cada jornada, sube en el ranking en tiempo real y compite por premios.
              Una experiencia simple y emocionante para vivir el Mundial al maximo.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="/"
                onClick={() => handleCTA('click_register')}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-4 text-lg font-black text-slate-900 shadow-[0_12px_35px_rgba(249,115,22,0.35)] transition hover:scale-[1.02]"
              >
                Acceder a la plataforma
              </a>
              <a
                href="#como-funciona"
                onClick={(e) => handleSmoothScroll(e, 'como-funciona')}
                className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur transition hover:border-white/45 hover:bg-white/15"
              >
                Ver Cómo Funciona
              </a>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                ['+25k', 'Participantes activos'],
                ['+120', 'Premios en juego'],
                ['24/7', 'Ranking en vivo'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                  <div className="text-2xl font-black">{value}</div>
                  <div className="text-sm text-slate-200">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Jornada destacada</p>
                  <p className="text-xl font-black">Partido destacado del dia</p>
                </div>
                <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-200">+2 Bonus</span>
              </div>

              <div className="space-y-3">
                {[
                  ['Resultado correcto', '+5 pts'],
                  ['Marcador exacto', '+3 pts'],
                  ['Partido destacado', '+2 pts'],
                ].map(([title, points]) => (
                  <div key={title} className="flex items-center justify-between rounded-xl bg-slate-900/50 p-3">
                    <span className="font-medium text-slate-100">{title}</span>
                    <span className="rounded-lg bg-cyan-400/20 px-2 py-1 text-sm font-bold text-cyan-200">{points}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">Meta semanal</p>
                <p className="text-lg font-bold text-emerald-100">Acierta 3 días seguidos y desbloquea premio instantáneo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
