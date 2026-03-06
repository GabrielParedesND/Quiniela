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

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { config } = useBranding();
  const [points, setPoints] = useState(0);

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
      const snapshot = await fetchQuinielaSnapshot(userId);
      setPoints(snapshot.points);
    };

    checkAccess();
  }, [user, loading, router]);

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
  const sponsorNames = {
    master: ['Copa Mundial 2026'],
    gold: ['Sponsor Gold 1', 'Sponsor Gold 2'],
    silver: ['Sponsor Silver 1', 'Sponsor Silver 2', 'Sponsor Silver 3'],
  };
  const promoSponsors = [
    ...config.sponsors.master.map((logo, index) => ({
      name: sponsorNames.master[index] || `Master ${index + 1}`,
      tier: 'master' as const,
      logo,
    })),
    ...config.sponsors.gold.map((logo, index) => ({
      name: sponsorNames.gold[index] || `Gold ${index + 1}`,
      tier: 'gold' as const,
      logo,
    })),
    ...config.sponsors.silver.map((logo, index) => ({
      name: sponsorNames.silver[index] || `Silver ${index + 1}`,
      tier: 'silver' as const,
      logo,
    })),
  ];

  return (
    <AppShell>
      <section className="fade-in space-y-6">
        <UserCard
          fullName={fullName}
          avatarUrl={avatarUrl}
          points={points}
          onViewResults={() => router.push('/results')}
        />

        <div className="grid grid-cols-1 gap-3">
          <NavigationCard
            icon="⚽"
            title="Pronosticar Resultados"
            description="Ingresa tus marcadores de la jornada"
            onClick={() => router.push('/predictions')}
            color="blue"
          />

          <NavigationCard
            icon="📈"
            title="Posiciones de Equipos"
            description="Mira cómo avanzan los grupos oficiales"
            onClick={() => router.push('/teams')}
            color="emerald"
          />
        </div>

        <PromoBanner sponsors={promoSponsors} />
      </section>
    </AppShell>
  );
}
