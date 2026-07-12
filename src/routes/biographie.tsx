import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/biographie")({
  head: () => ({
    meta: [
      { title: "Biographie — Viviane Moluh Peyou" },
      { name: "description", content: "Parcours et jalons de l'écrivaine Viviane Moluh Peyou." },
      { property: "og:title", content: "Biographie — Viviane Moluh Peyou" },
      { property: "og:url", content: "/biographie" },
    ],
    links: [{ rel: "canonical", href: "/biographie" }],
  }),
  component: BioPage,
});

function BioPage() {
  const { t } = useTranslation();
  const timeline = t("bio.timeline", { returnObjects: true }) as Array<{ year: string; text: string }>;
  return (
    <>
      <PageHeader kicker={t("bio.kicker")} title={t("bio.title")} />

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="whitespace-pre-line text-lg leading-relaxed text-foreground/85">
          {t("bio.leadFr")}
        </p>

        <section className="mt-16">
          <h2 className="text-2xl">{t("bio.timelineTitle")}</h2>
          <ol className="mt-6 space-y-5 border-l-2 border-gold/40 pl-6">
            {timeline.map((it, i) => (
              <li key={`${it.year}-${i}`} className="relative">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-gold" />
                <p className="font-display text-xl text-primary">{it.year}</p>
                <p className="mt-1 text-foreground/85">{it.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-14">
          <button
            type="button"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-primary/30 px-6 text-sm font-medium text-primary hover:bg-primary/5"
            onClick={() => alert(t("common.soonAvailable"))}
          >
            {t("bio.pressKit")}
          </button>
        </div>
      </article>
    </>
  );
}
