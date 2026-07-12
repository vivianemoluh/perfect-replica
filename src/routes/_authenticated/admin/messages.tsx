import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";

type Msg = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean | null;
  created_at: string | null;
};

export const Route = createFileRoute("/_authenticated/admin/messages")({
  ssr: false,
  component: MessagesAdmin,
});

function MessagesAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Msg[];
    },
  });

  async function toggleRead(id: string, v: boolean) {
    await supabase.from("contact_messages").update({ is_read: v }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
  }
  async function remove(id: string) {
    if (!confirm("Supprimer ce message ?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-primary">Messages reçus</h1>
      <div className="mt-6 space-y-3">
        {data?.map((m) => (
          <div key={m.id} className={`rounded-lg border p-4 ${m.is_read ? "border-border bg-card" : "border-primary/40 bg-card"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{m.subject}</p>
                <p className="text-xs text-muted-foreground">
                  De {m.name} &lt;<a className="underline" href={`mailto:${m.email}`}>{m.email}</a>&gt; · {m.created_at?.slice(0,16).replace("T"," ")}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleRead(m.id, !m.is_read)}>
                  <Check className="mr-1 h-4 w-4" />{m.is_read ? "Non lu" : "Lu"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
          </div>
        ))}
        {data?.length === 0 && <p className="text-sm text-muted-foreground">Aucun message.</p>}
      </div>
    </div>
  );
}
