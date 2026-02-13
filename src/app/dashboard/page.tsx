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
import { matches, mockUserPredictions } from '@/lib/mock';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      // Verificar si hay sesión activa
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.push('/');
        return;
      }

      // Si hay sesión pero no hay user cargado aún, esperar
      if (!user) return;

      // Validar si el perfil está completo
      if (!isProfileComplete(user)) {
        router.push('/onboarding');
        return;
      }

      // Calcular puntos mock
      let totalPoints = 0;
      const playedMatches = matches.filter((m) => m.status === 'played');
      playedMatches.forEach((m) => {
        const pred = mockUserPredictions[m.id];
        if (!pred) return;
        const pA = parseInt(pred.a as string);
        const pB = parseInt(pred.b as string);
        if (pA === m.scoreA && pB === m.scoreB) totalPoints += 5;
        else if (
          (pA > pB && m.scoreA! > m.scoreB!) ||
          (pB > pA && m.scoreB! > m.scoreA!) ||
          (pA === pB && m.scoreA === m.scoreB)
        )
          totalPoints += 3;
      });
      setPoints(totalPoints);
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
              tier: 'master'
            },
            { 
              name: 'Coca-Cola', 
              tier: 'gold'
            },
            { 
              name: 'Adidas', 
              tier: 'gold'
            },
            { 
              name: 'Visa', 
              tier: 'silver'
            },
            { 
              name: 'McDonald\'s', 
              tier: 'silver'
            },
            { 
              name: 'Hyundai', 
              tier: 'silver'
            }
          ]}
        />
      </section>
    </AppShell>
  );
}
