'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId, isAuthenticated } from '@/lib/auth/cognito';
import { useUser } from '@/contexts/UserContext';
import { isProfileComplete } from '@/lib/db/users';
import { fetchQuinielaSnapshot } from '@/lib/db/quiniela';
import AppShell from '@/components/AppShell';
import LoadingContent from '@/components/LoadingContent';
import PromoBanner from '@/components/PromoBanner';
import UserCard from '@/components/UserCard';
import NavigationCard from '@/components/NavigationCard';
import { isProfileAvatarOption } from '@/lib/assets';
import { useBranding } from '@/contexts/BrandingContext';
import { useTournament } from '@/contexts/TournamentContext';
import { useSurveyTrigger } from '@/contexts/SurveyTriggerContext';
import TournamentSelector from '@/components/TournamentSelector';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { config } = useBranding();
  const { selectedTournamentId: tournamentId } = useTournament();
  const { fireTrigger } = useSurveyTrigger();
  const [points, setPoints] = useState(0);
  const [printedCodesEnabled, setPrintedCodesEnabled] = useState(false);

  // Fire survey trigger on dashboard load
  useEffect(() => {
    if (!loading && user) {
      // Check if user just logged in — fire 'after-login' trigger instead
      try {
        const justLoggedIn = sessionStorage.getItem('survey-just-logged-in');
        if (justLoggedIn) {
          sessionStorage.removeItem('survey-just-logged-in');
          fireTrigger('after-login');
          return;
        }
      } catch {}
      fireTrigger('dashboard-load');
    }
  }, [loading, user, fireTrigger]);

  useEffect(() => {
    // Check printed codes feature from branding config
    const enabled = !!(config.features && config.features.printedCodesEnabled);
    setPrintedCodesEnabled(enabled);
  }, [config]);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.push('/');
        return;
      }

      if (!user) return;

      if (!isProfileComplete(user)) {
        router.push('/onboarding');
        return;
      }

      const userId = await getUserId();
      const snapshot = await fetchQuinielaSnapshot(userId, tournamentId);
      setPoints(snapshot.points);
    };

    checkAccess();
  }, [user, loading, router, tournamentId]);

  if (loading || !user) {
    return (
      <AppShell>
        <LoadingContent />
      </AppShell>
    );
  }

  const fullName = `${user.nombres} ${user.apellidos}`;
  const avatarUrl = user.avatar && isProfileAvatarOption(user.avatar)
    ? user.avatar
    : '/assets/PROFILE/unknown-football-shirt-svgrepo-com.svg';

  return (
    <AppShell>
      <section className="fade-in space-y-4 sm:space-y-6">
        <TournamentSelector />

        <UserCard
          fullName={fullName}
          avatarUrl={avatarUrl}
          points={points}
          onViewResults={() => router.push('/results')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <NavigationCard
            icon={<img src="/assets/ICON PRON RESULTADOS 48X48.svg" alt="" className="w-7 h-7" />}
            title="Pronosticar Resultados"
            description="Ingresa tus marcadores de la jornada"
            onClick={() => router.push('/predictions')}
            color="blue"
          />

          <NavigationCard
            icon={<img src="/assets/ICON POS DE EQUIPOS 48X48.svg" alt="" className="w-7 h-7" />}
            title="Posiciones de Equipos"
            description="Mira cómo avanzan los grupos oficiales"
            onClick={() => router.push('/teams')}
            color="emerald"
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <NavigationCard
            icon={<img src="/assets/ICON PRON RESULTADOS 48X48.svg" alt="" className="w-7 h-7" />}
            title="Grupos"
            description="Compite con tus amigos en ligas privadas"
            onClick={() => router.push('/groups')}
            color="blue"
          />

          {config.features && config.features.printedCodesEnabled === true && (
            <NavigationCard
              icon="🎟️"
              title="Código de Ejemplar"
              description="Canjea tu código y multiplica tus puntos"
              onClick={() => router.push('/codigos')}
              color="orange"
            />
          )}
        </div>

        <PromoBanner />
      </section>
    </AppShell>
  );
}
