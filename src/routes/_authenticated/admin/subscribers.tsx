import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type Sub = {
  id: string;
  email: string;
  first_name: string | null;
  source: string | null;
  created_at: string | null;
};

export const Route = createFileRoute("/_authenticated/admin/subscribers")({
  ssr: false,
  component: SubscribersAdmin,
});

function SubscribersAdmin() {
  const { data } = useQuery({
    queryKey: ["admin-subs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Sub[];
    },
  });

  function exportCsv() {
    if (!data) return;
    const header = "email,first_name,source,created_at\n";
    const rows = data.map((s) =>
      [s.email, s.first_name ?? "", s.source ?? "", s.created_at ?? ""].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `abonnes-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-primary">Abonnés newsletter</h1>
        <Button onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{data?.length ?? 0} abonné(s)</p>
      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="px-3 py-2">Email</th><th className="px-3 py-2">Prénom</th><th className="px-3 py-2">Source</th><th className="px-3 py-2">Inscrit le</th></tr></thead>
          <tbody>
            {data?.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-3 py-2">{s.email}</td>
                <td className="px-3 py-2">{s.first_name}</td>
                <td className="px-3 py-2">{s.source}</td>
                <td className="px-3 py-2">{s.created_at?.slice(0,10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
