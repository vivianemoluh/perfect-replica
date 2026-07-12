import { useState } from "react";
import type { Review } from "@/lib/types";

const PREVIEW_LENGTH = 380;

export function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.review_text.length > PREVIEW_LENGTH;
  const shown = expanded || !isLong
    ? review.review_text
    : review.review_text.slice(0, PREVIEW_LENGTH).trimEnd() + "…";

  return (
    <article className="rounded-lg border border-border/70 bg-card p-6 shadow-sm">
      <div className="whitespace-pre-line font-body text-base leading-relaxed text-foreground/90">
        {shown}
      </div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-gold transition"
          aria-expanded={expanded}
        >
          {expanded ? "Réduire ▲" : "Lire la suite ▼"}
        </button>
      )}
      <p className="mt-5 border-t border-border/60 pt-4 text-sm font-medium text-primary">
        — {review.reviewer_name}
        {review.reviewer_location ? `, ${review.reviewer_location}` : ""}
      </p>
    </article>
  );
}
