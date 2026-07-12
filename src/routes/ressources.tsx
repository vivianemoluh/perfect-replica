import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import type { Resource } from "@/lib/types";
import { PageHeader } from "@/components/site/PageHeader";
import { FileText, Download } from "lucide-react";

export const Route = createFileRoute("/ressources")({
  head: () => ({
    meta: [
      { title: "Ressources pédagogiques — Viviane Moluh Peyou" },
      { name: "description", content: "Fiches de lecture et supports pédagogiques à télécharger gratuitement." },
      { property: "og:url", content: "/ressources" },
    ],
    links: [{ rel: "canonical", href: "/ressources" }],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const { data, error } = await supabase.from("resources").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Resource[];
    },
  });

  return (
    <>
      <PageHeader title={t("resources.title")} intro={t("resources.intro")} />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {!data || data.length === 0 ? (
          <p className="font-quote text-center text-lg text-muted-foreground">{t("resources.empty")}</p>
        ) : (
          <ul className="space-y-4">
            {data.map((r) => {
              const title = (lang === "en" ? r.title_en : r.title_fr) ?? r.title_fr;
              const desc = (lang === "en" ? r.description_en : r.description_fr) ?? r.description_fr;
              return (
                <li key={r.id} className="flex flex-col gap-4 rounded-lg border border-border/70 bg-card p-5 sm:flex-row sm:items-center">
                  <FileText className="shrink-0 text-gold" />
                  <div className="flex-1">
                    {r.resource_type && (
                      <p className="font-quote text-xs uppercase tracking-[0.3em] text-gold">
                        {t(`resources.types.${r.resource_type}`)}
                      </p>
                    )}
                    <h3 className="text-lg">{title}</h3>
                    {desc && <p className="mt-1 text-sm text-foreground/80">{desc}</p>}
                  </div>
                  <a
                    href={r.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <Download size={16} /> {t("common.download")}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
