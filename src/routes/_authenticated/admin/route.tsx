import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  component: AdminLayout,
});

const LINKS: Array<{ to: string; label: string }> = [
  { to: "/admin", label: "Tableau de bord" },
  { to: "/admin/books", label: "Livres" },
  { to: "/admin/articles", label: "Chroniques" },
  { to: "/admin/events", label: "Agenda" },
  { to: "/admin/gallery", label: "Galerie" },
  { to: "/admin/resources", label: "Ressources" },
  { to: "/admin/reviews", label: "Avis" },
  { to: "/admin/messages", label: "Messages" },
  { to: "/admin/subscribers", label: "Abonnés" },
];

// Direct role check against user_roles (no dependency on the has_role() RPC).
async function checkAdmin() {
  // Wait for the session to be fully hydrated to avoid race conditions.
  let session = null;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      session = data.session;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  if (!session) throw new Error("Session admin pas encore chargée");

  // Minimum 1s loading window before we trust the result of the role check.
  const [{ data, error }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", session.user.id),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]);
  if (error) throw error;

  const isAdmin = (data ?? []).some((r) => r.role === "admin");
  console.log("[admin] user_roles check", { userId: session.user.id, isAdmin, roles: data });
  return { userId: session.user.id, isAdmin };
}

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const adminCheck = useQuery({
    queryKey: ["admin-role-check"],
    retry: 1,
    retryDelay: 400,
    queryFn: checkAdmin,
  });

  // Only redirect AFTER the role check has fully completed.
  useEffect(() => {
    if (!adminCheck.data || adminCheck.data.isAdmin) return;
    void supabase.auth.signOut().finally(() => {
      navigate({ to: "/auth", search: { error: "not_admin" } as never, replace: true });
    });
  }, [adminCheck.data, navigate]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (adminCheck.isLoading || adminCheck.isFetching) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
        <h1 className="mt-5 font-display text-2xl text-primary">Vérification admin…</h1>
        <p className="mt-2 text-sm text-muted-foreground">Connexion établie, validation du rôle en cours.</p>
      </div>
    );
  }

  if (adminCheck.isError) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-2xl text-primary">Vérification admin impossible</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          La session est chargée, mais la vérification du rôle admin a échoué.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={() => adminCheck.refetch()}>Réessayer</Button>
          <Button variant="outline" onClick={signOut}>Se déconnecter</Button>
        </div>
      </div>
    );
  }

  if (!adminCheck.data?.isAdmin) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-2xl text-primary">Redirection…</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <aside className="space-y-1">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</p>
        {LINKS.map((l) => {
          const active = l.to === "/admin" ? pathname === "/admin" : pathname.startsWith(l.to);
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                active ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
        <Button onClick={signOut} variant="ghost" className="mt-4 w-full justify-start text-sm">
          <LogOut className="mr-2 h-4 w-4" /> Déconnexion
        </Button>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  );
}
