'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth/cognito';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';

const IFRAME_URL = 'http://nd.s3.rep.datafactory.htmlcenter.s3-website-us-east-1.amazonaws.com/html/v3/index.html?channel=deportes.futbol.mundial';

export default function MundialPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.push('/');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <AppShell>
      <section className="fade-in space-y-4">
        <PageHeader title="Información del Mundial" showBackButton />

        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <iframe
            src={IFRAME_URL}
            className="w-full border-0"
            style={{ minHeight: '80vh' }}
            title="Información del Mundial"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          />
        </div>
      </section>
    </AppShell>
  );
}
