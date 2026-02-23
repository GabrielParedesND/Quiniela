'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth/cognito';
import { useUser } from '@/contexts/UserContext';
import { isProfileComplete } from '@/lib/db/users';
import AppShell from '@/components/AppShell';
import LoadingContent from '@/components/LoadingContent';
import PromoBanner from '@/components/PromoBanner';
import UserCard from '@/components/UserCard';
import NavigationCard from '@/components/NavigationCard';
import { brandAssets } from '@/lib/assets';
import { loadPredictions, computePoints } from '@/lib/demo';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useUser();
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

      const predictions = loadPredictions();
      setPoints(computePoints(predictions));
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
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0284c7&color=fff`;

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

        <PromoBanner 
          sponsors={[
            { 
              name: 'Copa Mundial 2026', 
              tier: 'master',
              logo: brandAssets.sponsors.master[0]
            },
            { 
              name: 'Coca-Cola', 
              tier: 'gold',
              logo: brandAssets.sponsors.gold[0]
            },
            { 
              name: 'Adidas', 
              tier: 'gold',
              logo: brandAssets.sponsors.gold[1]
            },
            { 
              name: 'Visa', 
              tier: 'silver',
              logo: brandAssets.sponsors.silver[0]
            },
            { 
              name: 'McDonald\'s', 
              tier: 'silver',
              logo: brandAssets.sponsors.silver[1]
            },
            { 
              name: 'Hyundai', 
              tier: 'silver',
              logo: brandAssets.sponsors.silver[2]
            }
          ]}
        />
      </section>
    </AppShell>
  );
}
