import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import type { GalleryPhoto } from "@/lib/types";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/galerie")({
  head: () => ({
    meta: [
      { title: "Galerie — Viviane Moluh Peyou" },
      { name: "description", content: "Photos d'événements, dédicaces et rencontres littéraires." },
      { property: "og:url", content: "/galerie" },
    ],
    links: [{ rel: "canonical", href: "/galerie" }],
  }),
  component: GalleryPage,
});

const CATS = ["all", "dedicaces", "evenements", "rencontres", "portraits"] as const;

function GalleryPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [cat, setCat] = useState<(typeof CATS)[number]>("all");
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);

  const { data } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery").select("*").order("display_order");
      if (error) throw error;
      return (data ?? []) as GalleryPhoto[];
    },
  });

  const filtered = (data ?? []).filter((p) => cat === "all" || p.category === cat);

  return (
    <>
      <PageHeader title={t("gallery.title")} intro={t("gallery.intro")} />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`min-h-[40px] rounded-full border px-4 text-sm ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground/70 hover:border-primary"}`}
            >
              {t(`gallery.categories.${c}`)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="font-quote mt-16 text-center text-lg text-muted-foreground">
            {t("gallery.empty")}
          </p>
        ) : (
          <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
            {filtered.map((p) => {
              const caption = (lang === "en" ? p.caption_en : p.caption_fr) ?? "";
              return (
                <button
                  key={p.id}
                  onClick={() => setLightbox(p)}
                  className="group block w-full overflow-hidden rounded-md"
                >
                  <img src={p.image_url} alt={caption} loading="lazy" className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </button>
              );
            })}
          </div>
        )}
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
        >
          <img src={lightbox.image_url} alt="" className="max-h-[90vh] max-w-full rounded shadow-2xl" />
          <button onClick={() => setLightbox(null)} className="absolute right-4 top-4 min-h-[44px] min-w-[44px] rounded-full bg-white/10 text-white">✕</button>
        </div>
      )}
    </>
  );
}
