import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import type { Book, Review } from "@/lib/types";
import { BookCard } from "@/components/site/BookCard";
import { ReviewCard } from "@/components/site/ReviewCard";

export const Route = createFileRoute("/livres/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Viviane Moluh Peyou` },
      { property: "og:url", content: `/livres/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/livres/${params.slug}` }],
  }),
  component: BookDetailPage,
});

function BookDetailPage() {
  const { slug } = Route.useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const book = useQuery({
    queryKey: ["book", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data as Book;
    },
  });

  const others = useQuery({
    queryKey: ["books-other", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("books")
        .select("*")
        .eq("is_published", true)
        .neq("slug", slug)
        .order("display_order")
        .limit(3);
      return (data ?? []) as Book[];
    },
  });

  const reviews = useQuery({
    queryKey: ["reviews", book.data?.id],
    enabled: !!book.data?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("book_id", book.data!.id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      return (data ?? []) as Review[];
    },
  });

  if (book.isLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">{t("common.loading")}</div>;
  }
  if (!book.data) return null;

  const b = book.data;
  const summary = (lang === "en" ? b.summary_en : b.summary_fr) ?? b.summary_fr;

  return (
    <>
      <section className="border-b border-border/60">
        <div className="paper-bg">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.3fr] lg:px-8 lg:py-20">
            <div className="relative mx-auto aspect-[2/3] w-full max-w-sm">
              <div className="absolute -inset-2 border border-gold/40" />
              {b.cover_url ? (
                <img src={b.cover_url} alt={b.title_fr} className="relative h-full w-full object-cover shadow-2xl" />
              ) : (
                <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary to-primary/60 px-8 text-center text-primary-foreground shadow-2xl">
                  <p className="font-quote text-xs uppercase tracking-[0.3em] text-gold">{b.genre}</p>
                  <p className="font-display mt-4 text-3xl">{b.title_fr}</p>
                </div>
              )}
            </div>
            <div>
              {b.genre && <p className="font-quote text-sm uppercase tracking-[0.3em] text-gold">{b.genre}</p>}
              <h1 className="mt-2">{b.title_fr}</h1>
              {b.publication_year && (
                <p className="mt-2 font-quote text-lg text-muted-foreground">{t("books.publishedIn")} {b.publication_year}</p>
              )}
              {summary && <p className="mt-6 text-lg text-foreground/85">{summary}</p>}
              <div className="mt-8 flex flex-wrap gap-3">
                {b.excerpt_url && (
                  <a
                    href={b.excerpt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    {t("books.excerpt")}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {b.purchase_links && b.purchase_links.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl">{t("books.buyTitle")}</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {b.purchase_links.map((p) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center rounded-md border border-primary/30 px-4 text-sm text-primary hover:bg-primary/5"
              >
                {p.label}
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl">{t("books.reviewsTitle")}</h2>
          <div className="mt-6 space-y-5">
            {reviews.data && reviews.data.length > 0 ? (
              reviews.data.map((r) => <ReviewCard key={r.id} review={r} />)
            ) : (
              <p className="font-quote text-lg text-muted-foreground">{t("books.noReviews")}</p>
            )}
          </div>
        </div>
      </section>

      {others.data && others.data.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl">{t("books.otherBooks")}</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {others.data.map((o) => <BookCard key={o.id} book={o} lang={lang} />)}
          </div>
          <div className="mt-10 text-center">
            <Link to="/livres" className="text-sm text-primary hover:text-gold">
              ← {t("books.title")}
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
