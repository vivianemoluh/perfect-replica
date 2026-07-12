import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import type { EventItem } from "@/lib/types";
import { PageHeader } from "@/components/site/PageHeader";
import { EventRow } from "@/components/site/EventRow";

export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda — Viviane Moluh Peyou" },
      { name: "description", content: "Conférences, dédicaces, salons et rencontres littéraires." },
      { property: "og:url", content: "/agenda" },
    ],
    links: [{ rel: "canonical", href: "/agenda" }],
  }),
  component: AgendaPage,
});

function AgendaPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const now = new Date().toISOString();

  const upcoming = useQuery({
    queryKey: ["events-up"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events").select("*")
        .eq("is_published", true)
        .gte("event_date", now)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EventItem[];
    },
  });

  const past = useQuery({
    queryKey: ["events-past"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events").select("*")
        .eq("is_published", true)
        .lt("event_date", now)
        .order("event_date", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as EventItem[];
    },
  });

  return (
    <>
      <PageHeader title={t("agenda.title")} intro={t("agenda.intro")} />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl">{t("agenda.upcoming")}</h2>
        <div className="mt-6 space-y-4">
          {upcoming.data && upcoming.data.length > 0
            ? upcoming.data.map((e) => <EventRow key={e.id} event={e} lang={lang} />)
            : <p className="font-quote text-lg text-muted-foreground">{t("agenda.emptyUpcoming")}</p>}
        </div>

        <h2 className="mt-16 text-2xl">{t("agenda.past")}</h2>
        <div className="mt-6 space-y-4 opacity-80">
          {past.data && past.data.length > 0
            ? past.data.map((e) => <EventRow key={e.id} event={e} lang={lang} />)
            : <p className="font-quote text-lg text-muted-foreground">{t("agenda.emptyPast")}</p>}
        </div>

        <div className="mt-16 text-center">
          <Link to="/contact" className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {t("agenda.inviteCta")}
          </Link>
        </div>
      </section>
    </>
  );
}
