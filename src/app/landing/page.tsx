import { Metadata } from 'next';
import Hero from '@/components/Landing/Hero';
import HowItWorks from '@/components/Landing/HowItWorks';
import Scoring from '@/components/Landing/Scoring';
import Leaderboard from '@/components/Landing/Leaderboard';
import Activations from '@/components/Landing/Activations';
import AdSpaceLanding from '@/components/Landing/AdSpaceLanding';
import AdSidebars from '@/components/Landing/AdSidebars';
import Testimonials from '@/components/Landing/Testimonials';
import Footer from '@/components/Landing/Footer';

export const metadata: Metadata = {
  title: 'Quiniela Mundialista 2026 | Pronósticos y Ranking',
  description: 'Participa en la Quiniela Mundialista 2026. Pronostica resultados, acumula puntos y compite en el ranking.',
  openGraph: {
    title: 'Quiniela Mundialista 2026 | Pronósticos y Ranking',
    description: 'Participa, pronostica y compite con la Quiniela Mundialista 2026',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface">
      <AdSidebars />
      <Hero />
      <HowItWorks />
      <Scoring />
      <Leaderboard />
      <Activations />
      {/* <AdSpaceLanding /> */}
      <Testimonials />
      <Footer />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: '¿Cómo participo en la Quiniela Mundialista?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Ingresa a la plataforma, inicia sesión y pronostica los resultados antes de cada partido.',
                },
              },
              {
                '@type': 'Question',
                name: '¿Cuántos puntos gano por acierto?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Ganas 5 puntos por resultado correcto, +3 por marcador exacto y +2 en partidos destacados.',
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
