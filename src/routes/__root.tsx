import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import "../i18n";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CookieBanner } from "@/components/site/CookieBanner";

function NotFoundComponent() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-quote text-sm text-gold tracking-widest uppercase">404</p>
      <h1 className="mt-3">Page introuvable</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Cette page n'existe pas ou a été déplacée. / This page doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        {t("common.backHome")}
      </Link>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl">Une erreur est survenue</h1>
      <p className="mt-2 text-sm text-muted-foreground">An unexpected error occurred.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Réessayer / Retry
        </button>
        <a
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-input bg-background px-5 text-sm font-medium text-foreground hover:bg-accent"
        >
          Accueil / Home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Viviane Moluh Peyou — Écrivaine, poétesse, chercheuse" },
      {
        name: "description",
        content:
          "Site officiel de Viviane Moluh Peyou — écrivaine, poétesse et chercheuse camerounaise. La mise en mots des maux.",
      },
      { name: "author", content: "Viviane Moluh Peyou" },
      { property: "og:site_name", content: "Viviane Moluh Peyou" },
      { property: "og:title", content: "Viviane Moluh Peyou — Écrivaine, poétesse, chercheuse" },
      {
        property: "og:description",
        content: "La mise en mots des maux. Romans, poésie, théâtre.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Viviane Moluh Peyou — Écrivaine, poétesse, chercheuse" },
      { name: "description", content: "A bilingual author website showcasing Viviane Moluh Peyou's literary works and research." },
      { property: "og:description", content: "A bilingual author website showcasing Viviane Moluh Peyou's literary works and research." },
      { name: "twitter:description", content: "A bilingual author website showcasing Viviane Moluh Peyou's literary works and research." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2f99a6b0-2f0b-4ff7-8c1d-259c069c0d21/id-preview-eb9491e0--d2eef447-51e5-45ff-8744-abb170c7099d.lovable.app-1781989313166.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2f99a6b0-2f0b-4ff7-8c1d-259c069c0d21/id-preview-eb9491e0--d2eef447-51e5-45ff-8744-abb170c7099d.lovable.app-1781989313166.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@1,400;1,500;1,600&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Viviane Moluh Peyou",
          jobTitle: "Écrivaine, poétesse, chercheuse",
          nationality: "Cameroonian",
          description:
            "Écrivaine, poétesse et chercheuse camerounaise. Spécialiste des violences faites aux femmes et de l'ingénierie pédagogique.",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 animate-[fade-in_0.55s_ease-out]">
          <Outlet />
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </QueryClientProvider>
  );
}
