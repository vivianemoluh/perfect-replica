import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { Article } from "@/lib/types";

export function ChronicleCard({ article, lang }: { article: Article; lang: string }) {
  const { t } = useTranslation();
  const title = (lang === "en" ? article.title_en : article.title_fr) ?? article.title_fr;
  const excerpt = (lang === "en" ? article.excerpt_en : article.excerpt_fr) ?? article.excerpt_fr;
  const date = article.published_at ?? article.created_at;
  return (
    <Link
      to="/chroniques/$slug"
      params={{ slug: article.slug }}
      className="group flex flex-col rounded-lg border border-border/70 bg-card p-5 transition hover:border-gold hover:shadow-md"
    >
      {article.cover_image_url && (
        <div className="mb-4 aspect-video overflow-hidden rounded">
          <img
            src={article.cover_image_url}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}
      <p className="font-quote text-xs uppercase tracking-[0.2em] text-gold">
        {article.category && t(`chronicles.categories.${article.category}`)}
      </p>
      <h3 className="mt-2 text-xl">{title}</h3>
      {excerpt && <p className="mt-2 line-clamp-3 text-sm text-foreground/80">{excerpt}</p>}
      <p className="mt-4 text-xs text-muted-foreground">
        {new Date(date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </Link>
  );
}
