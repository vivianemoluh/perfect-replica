import { Link } from "@tanstack/react-router";
import type { Book } from "@/lib/types";
import { useTranslation } from "react-i18next";

export function BookCard({ book, lang }: { book: Book; lang: string }) {
  const { t } = useTranslation();
  const summary = (lang === "en" ? book.summary_en : book.summary_fr) ?? book.summary_fr;
  return (
    <Link
      to="/livres/$slug"
      params={{ slug: book.slug }}
      className="group flex flex-col"
    >
      <div className="book-hover relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-primary/90 to-primary/60 shadow-lg">
        {book.cover_url ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={book.cover_url}
            alt={book.title_fr}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center text-primary-foreground">
            <p className="font-quote text-xs uppercase tracking-[0.3em] text-gold">
              {book.genre}
            </p>
            <p className="font-display mt-4 text-2xl leading-tight">{book.title_fr}</p>
            <span className="mt-4 inline-block h-px w-10 bg-gold" />
            <p className="mt-3 text-xs text-primary-foreground/70">
              {book.publication_year}
            </p>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-xl">{book.title_fr}</h3>
        {book.genre === "Manuel scolaire" && (
          <span className="mt-2 inline-block rounded-full bg-gold/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-gold">
            {t("books.officialBadge")}
          </span>
        )}
        {book.publication_year && (
          <p className="font-quote mt-1 text-sm text-muted-foreground">{book.publication_year}</p>
        )}
        {summary && (
          <p className="mt-2 line-clamp-3 text-sm text-foreground/80">{summary}</p>
        )}
        <span className="mt-3 inline-block text-sm text-primary group-hover:text-gold">
          {t("common.readMore")} →
        </span>
      </div>

    </Link>
  );
}
