import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/bibliographie")({
  head: () => ({
    meta: [
      { title: "Bibliographie — Viviane Moluh Peyou" },
      {
        name: "description",
        content:
          "Bibliographie complète de Viviane Moluh Peyou : romans, manuels LATINITAS et ouvrages à paraître.",
      },
      { property: "og:title", content: "Bibliographie — Viviane Moluh Peyou" },
      { property: "og:description", content: "Romans, manuels officiels de latin et ouvrages à paraître." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/bibliographie" },
    ],
    links: [{ rel: "canonical", href: "/bibliographie" }],
  }),
  component: BibliographiePage,
});

function BibliographiePage() {
  const { t } = useTranslation();
  const items = t("biblio.items", { returnObjects: true }) as string[];

  return (
    <>
      <PageHeader title={t("biblio.title")} intro={t("biblio.intro")} />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ul className="space-y-4">
          {(Array.isArray(items) ? items : []).map((item) => (
            <li
              key={item}
              className="rounded-lg border border-border/70 bg-card p-5 text-base text-foreground/85"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
