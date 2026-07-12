import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  ssr: false,
  component: Dashboard,
});

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl text-primary">{value}</p>
    </div>
  );
}

async function fetchCount(table: string) {
  const { count } = await supabase.from(table as never).select("*", { count: "exact", head: true });
  return count ?? 0;
}

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => ({
      books: await fetchCount("books"),
      articles: await fetchCount("articles"),
      events: await fetchCount("events"),
      gallery: await fetchCount("gallery"),
      messages: await fetchCount("contact_messages"),
      subscribers: await fetchCount("newsletter_subscribers"),
      reviews: await fetchCount("reviews"),
    }),
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-primary">Tableau de bord</h1>
      <p className="mt-1 text-sm text-muted-foreground">Vue d'ensemble du site.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Livres" value={data?.books ?? "…"} />
        <StatCard label="Chroniques" value={data?.articles ?? "…"} />
        <StatCard label="Événements" value={data?.events ?? "…"} />
        <StatCard label="Photos galerie" value={data?.gallery ?? "…"} />
        <StatCard label="Messages" value={data?.messages ?? "…"} />
        <StatCard label="Abonnés newsletter" value={data?.subscribers ?? "…"} />
        <StatCard label="Avis" value={data?.reviews ?? "…"} />
      </div>
    </div>
  );
}
