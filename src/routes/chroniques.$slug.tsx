import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import type { Article } from "@/lib/types";

export const Route = createFileRoute("/chroniques/$slug")({
  head: ({ params }) => ({
    meta: [{ property: "og:url", content: `/chroniques/${params.slug}` }],
    links: [{ rel: "canonical", href: `/chroniques/${params.slug}` }],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const { data, isLoading } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data as Article;
    },
  });

  if (isLoading) return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">{t("common.loading")}</div>;
  if (!data) return null;

  const title = (lang === "en" ? data.title_en : data.title_fr) ?? data.title_fr;
  const content = (lang === "en" ? data.content_en : data.content_fr) ?? data.content_fr;
  const date = data.published_at ?? data.created_at;

  const url = typeof window !== "undefined" ? window.location.href : "";

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link to="/chroniques" className="text-sm text-primary hover:text-gold">← {t("chronicles.title")}</Link>
      {data.category && (
        <p className="font-quote mt-6 text-xs uppercase tracking-[0.3em] text-gold">
          {t(`chronicles.categories.${data.category}`)}
        </p>
      )}
      <h1 className="mt-2">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {new Date(date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", { year: "numeric", month: "long", day: "numeric" })}
      </p>
      {data.cover_image_url && (
        <img src={data.cover_image_url} alt={title} className="mt-8 aspect-video w-full rounded object-cover" />
      )}
      {content && (
        <div className="prose prose-lg mt-10 max-w-none whitespace-pre-wrap text-foreground/90 font-body">
          {content}
        </div>
      )}

      <div className="mt-12 border-t border-border pt-6">
        <p className="text-sm font-medium text-foreground">{t("common.share")}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <a className="rounded-md border border-border px-3 py-2 hover:border-primary" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`}>WhatsApp</a>
          <a className="rounded-md border border-border px-3 py-2 hover:border-primary" target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}>Facebook</a>
          <a className="rounded-md border border-border px-3 py-2 hover:border-primary" target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}>Twitter / X</a>
          <a className="rounded-md border border-border px-3 py-2 hover:border-primary" target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}>LinkedIn</a>
        </div>
      </div>

      <aside className="mt-12 rounded-lg border border-border/70 bg-card/60 p-6">
        <p className="font-quote text-xs uppercase tracking-[0.3em] text-gold">{t("chronicles.authorCardTitle")}</p>
        <h3 className="mt-2">Viviane Moluh Peyou</h3>
        <p className="mt-2 text-sm text-foreground/80">{t("home.introBody")}</p>
        <Link to="/biographie" className="mt-3 inline-block text-sm text-primary hover:text-gold">
          {t("common.discover")} →
        </Link>
      </aside>
    </article>
  );
}
