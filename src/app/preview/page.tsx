'use client';

import { useEffect, useRef, useState } from 'react';
import { useBranding } from '@/contexts/BrandingContext';
import { applyTheme } from '@/lib/theme/theme';
import { AppBrandingConfig } from '@/lib/branding/types';
import AppShell from '@/components/AppShell';
import UserCard from '@/components/UserCard';
import NavigationCard from '@/components/NavigationCard';
import PromoBanner from '@/components/PromoBanner';
import PageHeader from '@/components/PageHeader';
import ResultCard from '@/components/ResultCard';
import RankingTable from '@/components/RankingTable';
import MatchCard from '@/components/MatchCard';
import TabSelector from '@/components/TabSelector';
import ContentPageLayout from '@/components/ContentPageLayout';

/**
 * Preview page: renders the real quiniela UI using actual components.
 * Supports multiple page views via ?page= query param.
 * Designed to be embedded in an iframe from the CMS.
 *
 * Usage: /preview?brandingId=<projectId>&page=<pageName>
 */

const AVATAR = '/assets/PROFILE/unknown-football-shirt-svgrepo-com.svg';
const FLAG_A = '/assets/FLAGS/mx.svg';
const FLAG_B = '/assets/FLAGS/ar.svg';
const FLAG_C = '/assets/FLAGS/br.svg';
const FLAG_D = '/assets/FLAGS/de.svg';
const FLAG_E = '/assets/FLAGS/es.svg';
const FLAG_F = '/assets/FLAGS/fr.svg';

const DEMO_TEAMS = [
  { id: '1', name: 'México', short: 'MEX', flagUrl: FLAG_A },
  { id: '2', name: 'Argentina', short: 'ARG', flagUrl: FLAG_B },
  { id: '3', name: 'Brasil', short: 'BRA', flagUrl: FLAG_C },
  { id: '4', name: 'Alemania', short: 'ALE', flagUrl: FLAG_D },
  { id: '5', name: 'España', short: 'ESP', flagUrl: FLAG_E },
  { id: '6', name: 'Francia', short: 'FRA', flagUrl: FLAG_F },
];

const DEMO_MATCHES = [
  { id: '1', teamAId: '1', teamBId: '2', jornada: 1, dateLabel: 'Hoy 18:00', status: 'open', scoreA: null, scoreB: null },
  { id: '2', teamAId: '3', teamBId: '4', jornada: 1, dateLabel: 'Hoy 21:00', status: 'open', scoreA: null, scoreB: null },
  { id: '3', teamAId: '5', teamBId: '6', jornada: 1, dateLabel: 'Mañana 18:00', status: 'open', scoreA: null, scoreB: null },
  { id: '4', teamAId: '1', teamBId: '3', jornada: 2, dateLabel: 'Vie 18:00', status: 'open', scoreA: null, scoreB: null },
];

const DEMO_PLAYED_MATCHES = [
  { id: '1', teamAId: '1', teamBId: '2', scoreA: 2, scoreB: 1 },
  { id: '2', teamAId: '3', teamBId: '4', scoreA: 0, scoreB: 0 },
  { id: '3', teamAId: '5', teamBId: '6', scoreA: 1, scoreB: 3 },
];

const DEMO_RANKING = [
  { name: 'Carlos M.', pts: 245, phase: 'Zona de Campeones' },
  { name: 'Ana R.', pts: 230, phase: 'Zona de Campeones' },
  { name: 'Usuario Demo (Tú)', pts: 150, phase: 'Duelo de Gigantes' },
  { name: 'Pedro L.', pts: 218, phase: 'Zona de Campeones' },
  { name: 'María G.', pts: 205, phase: 'Duelo de Gigantes' },
];

export default function PreviewPage() {
  const { config: liveConfig, setConfig: setBrandingConfig } = useBranding();
  const [config, setConfig] = useState<AppBrandingConfig>(liveConfig);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeJornada, setActiveJornada] = useState(1);
  const [hasDraftFromCMS, setHasDraftFromCMS] = useState(false);
  const hasDraftRef = useRef(false);
  const [predictions, setPredictions] = useState<Record<string, { a: string; b: string }>>({
    '1': { a: '2', b: '1' },
    '2': { a: '0', b: '0' },
    '3': { a: '1', b: '3' },
  });

  // Listen for postMessage from CMS
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'PREVIEW_BRANDING_UPDATE' && event.data.config) {
        const newConfig = event.data.config as AppBrandingConfig;
        setConfig(newConfig);
        setHasDraftFromCMS(true);
        hasDraftRef.current = true;
        if (newConfig.theme) applyTheme(newConfig.theme);
      }
      // Accept raw CMS draft data and build a partial config update
      if (event.data?.type === 'PREVIEW_DRAFT_UPDATE' && event.data.draft) {
        setHasDraftFromCMS(true);
        hasDraftRef.current = true;
        const d = event.data.draft as Record<string, unknown>;
        setConfig(prev => {
          const next = { ...prev };
          // Colors
          if (typeof d.primaryColor === 'string' && d.primaryColor) {
            next.theme = {
              ...next.theme,
              colors: {
                ...next.theme.colors,
                accents: { ...next.theme.colors.accents, primary: d.primaryColor, secondary: (d.secondaryColor as string) || next.theme.colors.accents.secondary },
                components: {
                  ...next.theme.colors.components,
                  buttons: { ...next.theme.colors.components.buttons, background: d.primaryColor },
                  navbar: { ...next.theme.colors.components.navbar, accent: (d.secondaryColor as string) || next.theme.colors.components.navbar.accent },
                },
              },
            };
          }
          // Assets
          if (d.logoUrl !== undefined) next.assets = { ...next.assets, logos: { ...next.assets.logos, main: d.logoUrl as string, large: d.logoUrl as string, small: d.logoUrl as string } };
          if (d.headerImageUrl !== undefined) next.assets = { ...next.assets, header: d.headerImageUrl as string };
          if (d.backgroundImageUrl !== undefined) next.assets = { ...next.assets, backgrounds: { ...next.assets.backgrounds, main: d.backgroundImageUrl as string, dashboard: d.backgroundImageUrl as string } };
          if (d.userCardImageUrl !== undefined) next.assets = { ...next.assets, backgrounds: { ...next.assets.backgrounds, userCard: d.userCardImageUrl as string } };
          if (d.rankingCardImageUrl !== undefined) next.assets = { ...next.assets, backgrounds: { ...next.assets.backgrounds, rankingCard: d.rankingCardImageUrl as string } };
          // Sponsors
          if (Array.isArray(d.sponsorMasterImageUrls)) next.sponsors = { ...next.sponsors, master: d.sponsorMasterImageUrls as string[] };
          if (Array.isArray(d.sponsorGoldImageUrls)) next.sponsors = { ...next.sponsors, gold: d.sponsorGoldImageUrls as string[] };
          if (Array.isArray(d.sponsorSilverImageUrls)) next.sponsors = { ...next.sponsors, silver: d.sponsorSilverImageUrls as string[] };
          if (Array.isArray(d.sponsorLogos)) next.sponsors = { ...next.sponsors, logos: d.sponsorLogos as string[] };
          // SEO / Content / Support / Legal
          if (typeof d.seoTitle === 'string') next.seo = { ...next.seo, title: d.seoTitle };
          if (typeof d.seoDescription === 'string') next.seo = { ...next.seo, description: d.seoDescription };
          if (typeof d.pageTitle === 'string') next.content = { ...next.content, pageTitle: d.pageTitle };
          if (typeof d.pageDescription === 'string') next.content = { ...next.content, pageDescription: d.pageDescription };
          if (typeof d.supportEmail === 'string') next.support = { ...next.support, email: d.supportEmail };
          if (typeof d.supportWhatsapp === 'string') next.support = { ...next.support, whatsapp: d.supportWhatsapp };
          if (typeof d.supportMessage === 'string') next.support = { ...next.support, message: d.supportMessage };
          if (typeof d.termsAndConditions === 'string') next.legal = { ...next.legal, terms: d.termsAndConditions };
          if (typeof d.privacyPolicy === 'string') next.legal = { ...next.legal, privacy: d.privacyPolicy };
          if (typeof d.howToPlay === 'string') next.legal = { ...next.legal, howToPlay: d.howToPlay };
          if (typeof d.prizesInfo === 'string') next.legal = { ...next.legal, prizes: d.prizesInfo };
          if (typeof d.rulesInfo === 'string') next.legal = { ...next.legal, rules: d.rulesInfo };
          if (typeof d.supportInfo === 'string') next.legal = { ...next.legal, supportInfo: d.supportInfo };
          if (next.theme) applyTheme(next.theme);
          return next;
        });
      }
      if (event.data?.type === 'PREVIEW_RELOAD') {
        window.location.reload();
      }
      if (event.data?.type === 'PREVIEW_NAVIGATE' && typeof event.data.page === 'string') {
        setCurrentPage(event.data.page);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Read page param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCurrentPage(params.get('page') || 'dashboard');
    
    const brandingId = params.get('brandingId');
    if (!brandingId) return;

    fetch(`/api/app-config?tournamentId=${encodeURIComponent(brandingId)}&preview=1`)
      .then(res => res.json())
      .then((data: AppBrandingConfig) => {
        // Only apply fetched config if no draft from CMS has arrived yet
        if (!hasDraftRef.current && data?.theme) {
          setConfig(data);
          applyTheme(data.theme);
        }
      })
      .catch(() => {});
  }, []);

  // Sync local config to BrandingContext so ContentPageLayout picks up draft changes
  useEffect(() => {
    setBrandingConfig?.(config);
  }, [config, setBrandingConfig]);

  const handlePredictionChange = (matchId: string, team: 'a' | 'b', value: string) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [team]: value },
    }));
  };

  const renderDashboard = () => (
    <section className="fade-in space-y-6">
      <UserCard fullName="Usuario Demo" avatarUrl={AVATAR} points={150} onViewResults={() => setCurrentPage('results')} />
      <div className="grid grid-cols-1 gap-3">
        <NavigationCard icon={<img src="/assets/ICON PRON RESULTADOS 48X48.svg" alt="" className="w-8 h-8" />} title="Pronosticar Resultados" description="Ingresa tus marcadores de la jornada" onClick={() => setCurrentPage('predictions')} color="blue" />
        <NavigationCard icon={<img src="/assets/ICON POS DE EQUIPOS 48X48.svg" alt="" className="w-8 h-8" />} title="Posiciones de Equipos" description="Mira cómo avanzan los grupos oficiales" onClick={() => setCurrentPage('teams')} color="emerald" />
      </div>
      <PromoBanner />
    </section>
  );

  const renderResults = () => {
    const pointsByJornada = [8, 5, 3];
    const sortedRanking = [...DEMO_RANKING].sort((a, b) => b.pts - a.pts);
    const position = sortedRanking.findIndex(u => u.name.includes('(Tú)')) + 1;

    return (
      <section className="fade-in space-y-6 pb-10">
        <PageHeader title="Mi Rendimiento" showBackButton backTo="/preview" />

        {/* Points by jornada chart - exact copy from results page */}
        <div className="p-6 rounded-3xl border shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--color-muted)' }}>Puntos por Jornada</h3>
          <div className="overflow-x-auto -mx-2 px-2">
            <div className="flex items-end h-36 gap-2 pb-1" style={{ minWidth: pointsByJornada.length > 6 ? `${pointsByJornada.length * 44}px` : undefined }}>
              {pointsByJornada.map((p, i) => {
                const maxPoints = Math.max(...pointsByJornada, 1);
                const height = Math.max((p / maxPoints) * 100, 8);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1" style={{ minWidth: '36px' }}>
                    <span className="text-[10px] font-black" style={{ color: 'var(--color-primary)' }}>{p}</span>
                    <div className="w-full rounded-lg relative" style={{ backgroundColor: 'var(--color-border)', height: '96px' }}>
                      <div className="bar-grow rounded-lg w-full absolute bottom-0 transition-all duration-1000" style={{ height: `${height}%`, backgroundColor: 'var(--color-primary)' }} />
                    </div>
                    <span className="text-[8px] font-bold uppercase text-center leading-tight truncate w-full" style={{ color: 'var(--color-muted)' }}>J{i + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Result cards - exact copy from results page */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] px-2" style={{ color: 'var(--color-muted)' }}>Detalle de Resultados</h3>
          <div className="rounded-3xl border shadow-sm overflow-hidden p-2 space-y-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            {DEMO_PLAYED_MATCHES.map(m => {
              const teamA = DEMO_TEAMS.find(t => t.id === m.teamAId)!;
              const teamB = DEMO_TEAMS.find(t => t.id === m.teamBId)!;
              const pred = predictions[m.id] || { a: '-', b: '-' };
              const pA = parseInt(pred.a); const pB = parseInt(pred.b);
              let pts = 0; let desc = 'Sin puntos';
              if (pA === m.scoreA && pB === m.scoreB) { pts = 5; desc = 'Marcador exacto (+5)'; }
              else if ((pA > pB && m.scoreA > m.scoreB) || (pB > pA && m.scoreB > m.scoreA) || (pA === pB && m.scoreA === m.scoreB)) { pts = 3; desc = 'Resultado acertado (+3)'; }
              else { desc = 'No acertado (0)'; }
              return <ResultCard key={m.id} teamA={teamA} teamB={teamB} officialScoreA={m.scoreA} officialScoreB={m.scoreB} predictionA={String(pred.a)} predictionB={String(pred.b)} points={pts} description={desc} />;
            })}
          </div>
        </div>

        {/* Ranking card - exact copy from results page */}
        <div className="space-y-3">
          <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mb-2" style={{ backgroundColor: 'var(--color-primary)' }}>
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: config.assets.backgrounds.rankingCard ? `url('${config.assets.backgrounds.rankingCard}')` : `url('${config.assets.cardBackgrounds.blue}')`,
              backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'left top',
            }} />
            <div className="relative z-10 flex justify-end">
              <div className="text-right">
                <span className="px-3 py-1 text-[10px] font-black rounded-full uppercase italic text-white" style={{ backgroundColor: 'var(--color-danger)' }}>Duelo de Gigantes</span>
                <h4 className="text-3xl font-black mt-2 tracking-tighter">Posición #{position}</h4>
              </div>
            </div>
          </div>
          <RankingTable users={sortedRanking} />
        </div>
      </section>
    );
  };

  const renderPredictions = () => {
    const jornadaMatches = DEMO_MATCHES.filter(m => m.jornada === activeJornada);
    const tabs = [{ value: 1, label: 'Jornada 1' }, { value: 2, label: 'Jornada 2' }];

    return (
      <section className="fade-in space-y-4">
        <PageHeader title="Ingresar Marcadores" showBackButton backTo="/preview" />
        <TabSelector tabs={tabs} activeTab={activeJornada} onTabChange={setActiveJornada} />
        <div className="space-y-4 mt-4">
          {jornadaMatches.map(m => {
            const teamA = DEMO_TEAMS.find(t => t.id === m.teamAId)!;
            const teamB = DEMO_TEAMS.find(t => t.id === m.teamBId)!;
            const pred = predictions[m.id] || { a: '', b: '' };
            return <MatchCard key={m.id} teamA={teamA} teamB={teamB} jornada={m.jornada} dateLabel={m.dateLabel} isLocked={false} predictionA={pred.a} predictionB={pred.b} onPredictionChange={(team, value) => handlePredictionChange(m.id, team, value)} />;
          })}
        </div>
        <div className="mt-6 flex justify-center">
          <button className="font-black py-4 px-10 rounded-full shadow-lg transition border-2 uppercase tracking-widest text-xs" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primaryText)', borderColor: 'var(--color-border)' }}>
            GUARDAR PRONÓSTICOS
          </button>
        </div>
      </section>
    );
  };

  const renderTeams = () => (
    <section className="fade-in space-y-6">
      <PageHeader title="Posiciones de Equipos" showBackButton backTo="/preview" />
      <div className="rounded-2xl border shadow-sm p-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <h2 className="text-lg font-black uppercase tracking-tight mb-4" style={{ color: 'var(--color-text)' }}>Grupo A</h2>
        <div className="space-y-2">
          {['México', 'Argentina', 'Polonia', 'Arabia Saudita'].map((team, i) => (
            <div key={team} className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black w-6 text-center" style={{ color: 'var(--color-muted)' }}>{i + 1}</span>
                <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{team}</span>
              </div>
              <div className="flex gap-4 text-xs" style={{ color: 'var(--color-muted)' }}>
                <span>PJ: 3</span>
                <span>PTS: {9 - i * 2}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderProfile = () => (
    <section className="fade-in space-y-6">
      <PageHeader title="Mi Perfil" showBackButton backTo="/preview" />
      <UserCard fullName="Usuario Demo" avatarUrl={AVATAR} points={150} />
      <div className="rounded-2xl border shadow-sm p-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="space-y-3">
          {[{ label: 'Nombre', value: 'Usuario Demo' }, { label: 'Email', value: 'demo@ejemplo.com' }, { label: 'Teléfono', value: '+52 1234567890' }].map(f => (
            <div key={f.label}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-muted)' }}>{f.label}</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{f.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderContacto = () => (
    <section className="fade-in space-y-6">
      <PageHeader title="Contacto" showBackButton backTo="/preview" />
      <div className="rounded-2xl border shadow-sm p-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="space-y-4">
          {config.support?.email && (
            <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
              <span className="text-xl">📧</span>
              <div>
                <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-muted)' }}>Email</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{config.support.email}</p>
              </div>
            </div>
          )}
          {config.support?.whatsapp && (
            <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
              <span className="text-xl">💬</span>
              <div>
                <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-muted)' }}>WhatsApp</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{config.support.whatsapp}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderPageContent = () => {
    switch (currentPage) {
      case 'results': return renderResults();
      case 'predictions': return renderPredictions();
      case 'teams': return renderTeams();
      case 'profile': return renderProfile();
      case 'contacto': return renderContacto();
      case 'terminos': return <ContentPageLayout title="Términos y Condiciones"><div className="prose prose-sm max-w-full" style={{ color: 'var(--color-text)', overflowWrap: 'break-word', wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: config.legal?.terms || '<div class="flex flex-col items-center justify-center py-8 text-center"><span class="text-3xl mb-2">📄</span><p class="text-xs font-black uppercase tracking-wider">Proximamente...</p><p class="text-[10px] mt-1" style="color:var(--color-muted)">Este contenido estara disponible pronto.</p></div>' }} /></ContentPageLayout>;
      case 'privacidad': return <ContentPageLayout title="Política de Privacidad"><div className="prose prose-sm max-w-full" style={{ color: 'var(--color-text)', overflowWrap: 'break-word', wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: config.legal?.privacy || '<div class="flex flex-col items-center justify-center py-8 text-center"><span class="text-3xl mb-2">📄</span><p class="text-xs font-black uppercase tracking-wider">Proximamente...</p><p class="text-[10px] mt-1" style="color:var(--color-muted)">Este contenido estara disponible pronto.</p></div>' }} /></ContentPageLayout>;
      case 'como-jugar': return <ContentPageLayout title="Cómo Jugar"><div className="prose prose-sm max-w-full" style={{ color: 'var(--color-text)', overflowWrap: 'break-word', wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: config.legal?.howToPlay || '<div class="flex flex-col items-center justify-center py-8 text-center"><span class="text-3xl mb-2">📄</span><p class="text-xs font-black uppercase tracking-wider">Proximamente...</p><p class="text-[10px] mt-1" style="color:var(--color-muted)">Este contenido estara disponible pronto.</p></div>' }} /></ContentPageLayout>;
      case 'premios': return <ContentPageLayout title="Premios"><div className="prose prose-sm max-w-full" style={{ color: 'var(--color-text)', overflowWrap: 'break-word', wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: config.legal?.prizes || '<div class="flex flex-col items-center justify-center py-8 text-center"><span class="text-3xl mb-2">📄</span><p class="text-xs font-black uppercase tracking-wider">Proximamente...</p><p class="text-[10px] mt-1" style="color:var(--color-muted)">Este contenido estara disponible pronto.</p></div>' }} /></ContentPageLayout>;
      case 'reglas': return <ContentPageLayout title="Reglas"><div className="prose prose-sm max-w-full" style={{ color: 'var(--color-text)', overflowWrap: 'break-word', wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: config.legal?.rules || '<div class="flex flex-col items-center justify-center py-8 text-center"><span class="text-3xl mb-2">📄</span><p class="text-xs font-black uppercase tracking-wider">Proximamente...</p><p class="text-[10px] mt-1" style="color:var(--color-muted)">Este contenido estara disponible pronto.</p></div>' }} /></ContentPageLayout>;
      case 'soporte': return <ContentPageLayout title="Soporte"><div className="prose prose-sm max-w-full" style={{ color: 'var(--color-text)', overflowWrap: 'break-word', wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: config.support?.message || config.legal?.supportInfo || '<div class="flex flex-col items-center justify-center py-8 text-center"><span class="text-3xl mb-2">📞</span><p class="text-xs font-black uppercase tracking-wider">Proximamente...</p><p class="text-[10px] mt-1" style="color:var(--color-muted)">La informacion de soporte estara disponible pronto.</p></div>' }} /></ContentPageLayout>;
      default: return renderDashboard();
    }
  };

  // For legal pages, use ContentPageLayout which has its own layout
  if (['terminos', 'privacidad', 'como-jugar', 'premios', 'reglas', 'soporte'].includes(currentPage)) {
    return (
      <>
        <style>{`a, button, input, select, textarea { pointer-events: none !important; }`}</style>
        {renderPageContent()}
        <div className="fixed top-2 right-2 z-[100] bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">Preview</div>
      </>
    );
  }

  // For other pages, use AppShell
  return (
    <>
      <style>{`a, button, input, select, textarea { pointer-events: none !important; }`}</style>
      <AppShell>{renderPageContent()}</AppShell>
      <div className="fixed top-2 right-2 z-[100] bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">Preview</div>
    </>
  );
}
