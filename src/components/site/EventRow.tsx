import { useTranslation } from "react-i18next";
import type { EventItem } from "@/lib/types";
import { Calendar, MapPin } from "lucide-react";

export function EventRow({ event, lang }: { event: EventItem; lang: string }) {
  const { t } = useTranslation();
  const title = (lang === "en" ? event.title_en : event.title_fr) ?? event.title_fr;
  const desc = (lang === "en" ? event.description_en : event.description_fr) ?? event.description_fr;
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border/70 bg-card p-5 transition hover:border-gold sm:flex-row sm:items-start">
      <div className="flex flex-col items-center justify-center rounded-md bg-primary px-4 py-3 text-primary-foreground sm:w-24">
        <span className="text-xs uppercase tracking-widest text-gold">
          {new Date(event.event_date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", { month: "short" })}
        </span>
        <span className="font-display text-3xl">
          {new Date(event.event_date).getDate()}
        </span>
        <span className="text-xs text-primary-foreground/70">
          {new Date(event.event_date).getFullYear()}
        </span>
      </div>
      <div className="flex-1">
        {event.event_type && (
          <p className="font-quote text-xs uppercase tracking-[0.2em] text-gold">
            {t(`agenda.types.${event.event_type}`)}
          </p>
        )}
        <h3 className="mt-1 text-xl">{title}</h3>
        {desc && <p className="mt-2 text-sm text-foreground/80">{desc}</p>}
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            {new Date(event.event_date).toLocaleString(lang === "en" ? "en-US" : "fr-FR", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </span>
          {(event.location || event.city) && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} />
              {[event.location, event.city, event.country].filter(Boolean).join(", ")}
            </span>
          )}
        </div>
        {event.registration_url && (
          <a
            href={event.registration_url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm text-primary hover:text-gold"
          >
            {t("common.discover")} →
          </a>
        )}
      </div>
    </article>
  );
}
