import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import type { Article } from "@/lib/types";
import { PageHeader } from "@/components/site/PageHeader";
import { ChronicleCard } from "@/components/site/ChronicleCard";

export const Route = createFileRoute("/chroniques")({
  head: () => ({
    meta: [
      { title: "Chroniques — Viviane Moluh Peyou" },
      { name: "description", content: "Chroniques et réflexions de Viviane Moluh Peyou." },
      { property: "og:url", content: "/chroniques" },
    ],
    links: [{ rel: "canonical", href: "/chroniques" }],
  }),
  component: ChroniclesPage,
});

const CATEGORIES = ["all", "reflexions", "actualites", "publications"] as const;

function ChroniclesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("all");
  const [q, setQ] = useState("");

  const { data } = useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Article[];
    },
  });

  const filtered = (data ?? []).filter((a) => {
    if (cat !== "all" && a.category !== cat) return false;
    if (q) {
      const hay = `${a.title_fr} ${a.title_en ?? ""} ${a.excerpt_fr ?? ""} ${a.excerpt_en ?? ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <>
      <PageHeader title={t("chronicles.title")} intro={t("chronicles.intro")} />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`min-h-[40px] rounded-full border px-4 text-sm transition ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground/70 hover:border-primary"}`}
              >
                {t(`chronicles.categories.${c}`)}
              </button>
            ))}
          </div>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("chronicles.searchPlaceholder")}
            className="min-h-[44px] w-full rounded-md border border-border bg-card px-4 text-sm sm:w-72"
          />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => <ChronicleCard key={a.id} article={a} lang={lang} />)}
        </div>
        {filtered.length === 0 && (
          <p className="font-quote mt-10 text-center text-lg text-muted-foreground">
            {t("chronicles.empty")}
          </p>
        )}
      </section>
    </>
  );
}
