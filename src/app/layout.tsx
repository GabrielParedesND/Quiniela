import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import BrandingMetaUpdater from "@/components/BrandingMetaUpdater";
import BackgroundImage from "@/components/BackgroundImage";
import ActiveProjectGate from "@/components/ActiveProjectGate";
import { UserProvider } from "@/contexts/UserContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { TournamentProvider } from "@/contexts/TournamentContext";
import { SurveyTriggerProvider } from "@/contexts/SurveyTriggerContext";
import GTMUserData from "@/components/GTMUserData";
import DebugImageLabels from "@/components/DebugImageLabels";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Quiniela Mundialista - USA 2026",
  description: "Plataforma de Quinielas Copa Mundial 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brandingBootScript = `(function () {
    try {
      var raw = localStorage.getItem('app-branding-config');
      if (!raw) return;
      var config = JSON.parse(raw);
      if (!config || !config.theme || !config.theme.colors) return;
      var colors = config.theme.colors;
      var root = document.documentElement;
      root.style.setProperty('--color-bg', colors.general.background);
      root.style.setProperty('--color-surface', colors.components.cards.background);
      root.style.setProperty('--color-surface2', colors.components.cards.backgroundAlt);
      root.style.setProperty('--color-text', colors.general.text);
      root.style.setProperty('--color-muted', colors.general.textSecondary);
      root.style.setProperty('--color-border', colors.components.cards.border);
      root.style.setProperty('--color-primary', colors.components.buttons.background);
      root.style.setProperty('--color-primaryText', colors.components.buttons.text);
      root.style.setProperty('--color-primaryHover', colors.components.buttons.hover);
      root.style.setProperty('--color-accent', colors.components.navbar.accent);
      root.style.setProperty('--color-success', colors.states.success);
      root.style.setProperty('--color-warning', colors.states.warning);
      root.style.setProperty('--color-danger', colors.states.error);
      root.style.setProperty('--color-info', colors.states.info);
      root.style.setProperty('--color-tertiary', colors.accents.tertiary);
      if (config.meta && config.meta.appTitle) document.title = config.meta.appTitle;
    } catch (e) {}
  })();`;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <Script id="gtm-head" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-WTN5K5VV');`}
        </Script>
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WTN5K5VV"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Script id="branding-boot" strategy="beforeInteractive">
          {brandingBootScript}
        </Script>
        <Script id="microsoft-clarity" strategy="beforeInteractive">
          {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "wr1mk3wv2j");`}
        </Script>
        <BrandingProvider>
          <BrandingMetaUpdater />
          <BackgroundImage />
          <ThemeProvider>
            <UserProvider>
              <GTMUserData />
              <SurveyTriggerProvider>
                <TournamentProvider>
                  <ActiveProjectGate>
                    <DebugImageLabels />
                    {children}
                  </ActiveProjectGate>
                </TournamentProvider>
              </SurveyTriggerProvider>
            </UserProvider>
          </ThemeProvider>
        </BrandingProvider>
      </body>
    </html>
  );
}
