import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  ssr: false,
  component: Dashboard,
});

function StatCard({ label, value, badge }: { label: string; value: number | string; badge?: number }) {
  return (
    <div className="relative rounded-lg border border-border bg-card p-5">
      {badge != null && badge > 0 && (
        <span className="absolute right-3 top-3 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
          {badge}
        </span>
      )}
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl text-primary">{value}</p>
    </div>
  );
}

type EqFilter = { column: string; value: unknown };

async function countRows(table: string, filter?: EqFilter) {
  let query = supabase.from(table as never).select("*", { count: "exact", head: true });
  if (filter) query = query.eq(filter.column as never, filter.value as never);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

function Dashboard() {
  const { data, isError, refetch } = useQuery({
    queryKey: ["admin-counts"],
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const [books, articles, events, gallery, messages, unread, subscribers, reviews] = await Promise.all([
        countRows("books"),
        countRows("articles", { column: "is_published", value: true }),
        countRows("events"),
        countRows("gallery"),
        countRows("contact_messages"),
        countRows("contact_messages", { column: "is_read", value: false }),
        countRows("newsletter_subscribers"),
        countRows("reviews"),
      ]);
      return { books, articles, events, gallery, messages, unread, subscribers, reviews };
    },
  });


  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-primary">Tableau de bord</h1>
          <p className="mt-1 text-sm text-muted-foreground">Statistiques en temps réel du site.</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
        >
          Actualiser
        </button>
      </div>

      {isError && (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          Impossible de charger les statistiques. Vérifiez la connexion à la base de données.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Livres" value={data?.books ?? "…"} />
        <StatCard label="Chroniques publiées" value={data?.articles ?? "…"} />
        <StatCard label="Événements" value={data?.events ?? "…"} />
        <StatCard label="Photos galerie" value={data?.gallery ?? "…"} />
        <StatCard label="Messages reçus" value={data?.messages ?? "…"} badge={data?.unread} />
        <StatCard label="Abonnés newsletter" value={data?.subscribers ?? "…"} />
        <StatCard label="Avis" value={data?.reviews ?? "…"} />
      </div>
    </div>
  );
}
