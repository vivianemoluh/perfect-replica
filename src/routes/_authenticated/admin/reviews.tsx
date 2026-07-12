import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";

type Review = {
  id: string;
  reviewer_name: string;
  reviewer_location: string | null;
  review_text: string;
  rating: number | null;
  is_approved: boolean | null;
  created_at: string | null;
};

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  ssr: false,
  component: ReviewsAdmin,
});

function ReviewsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });

  async function approve(id: string, v: boolean) {
    await supabase.from("reviews").update({ is_approved: v }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  }
  async function remove(id: string) {
    if (!confirm("Supprimer cet avis ?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-primary">Avis lecteurs</h1>
      <div className="mt-6 space-y-3">
        {data?.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{r.reviewer_name} {r.reviewer_location && <span className="text-muted-foreground">— {r.reviewer_location}</span>}</p>
                <p className="text-xs text-muted-foreground">{r.created_at?.slice(0,10)} · {r.rating ?? "—"}/5 · {r.is_approved ? "Approuvé" : "En attente"}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant={r.is_approved ? "outline" : "default"} onClick={() => approve(r.id, !r.is_approved)}>
                  <Check className="mr-1 h-4 w-4" />{r.is_approved ? "Retirer" : "Approuver"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <p className="mt-3 text-sm">{r.review_text}</p>
          </div>
        ))}
        {data?.length === 0 && <p className="text-sm text-muted-foreground">Aucun avis pour le moment.</p>}
      </div>
    </div>
  );
}
