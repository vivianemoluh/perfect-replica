import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/site/PageHeader";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { Check } from "lucide-react";

export const Route = createFileRoute("/newsletter")({
  head: () => ({
    meta: [
      { title: "Newsletter — Viviane Moluh Peyou" },
      { name: "description", content: "Recevez les annonces de parutions, événements et textes inédits." },
      { property: "og:url", content: "/newsletter" },
    ],
    links: [{ rel: "canonical", href: "/newsletter" }],
  }),
  component: NewsletterPage,
});

function NewsletterPage() {
  const { t } = useTranslation();
  const benefits = t("newsletter.benefits", { returnObjects: true }) as string[];
  return (
    <>
      <PageHeader title={t("newsletter.title")} intro={t("newsletter.intro")} />
      <section className="mx-auto grid max-w-5xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-2xl">{t("newsletter.whatYouGet")}</h2>
          <ul className="mt-6 space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-foreground/85">
                <Check className="mt-1 shrink-0 text-gold" size={18} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-xs text-muted-foreground">{t("newsletter.unsubscribeNote")}</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
          <h3 className="text-xl">{t("nav.newsletter")}</h3>
          <p className="mt-2 text-sm text-foreground/80">{t("home.newsletterBody")}</p>
          <div className="mt-5"><NewsletterForm source="newsletter-page" /></div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl">{t("newsletter.archivesTitle")}</h2>
        <p className="font-quote mt-3 text-muted-foreground">{t("newsletter.archivesEmpty")}</p>
      </section>
    </>
  );
}
