import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus } from "lucide-react";

type Event = {
  id?: string;
  title_fr: string;
  title_en: string | null;
  description_fr: string | null;
  description_en: string | null;
  event_date: string;
  event_type: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  registration_url: string | null;
  is_published: boolean | null;
};

const empty: Event = {
  title_fr: "", title_en: "", description_fr: "", description_en: "",
  event_date: new Date().toISOString().slice(0, 10), event_type: "", location: "",
  city: "", country: "", registration_url: "", is_published: true,
};

export const Route = createFileRoute("/_authenticated/admin/events")({
  ssr: false,
  component: EventsAdmin,
});

function EventsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false });
      if (error) throw error;
      return data as Event[];
    },
  });
  const [editing, setEditing] = useState<Event | null>(null);

  async function remove(id: string) {
    if (!confirm("Supprimer cet événement ?")) return;
    await supabase.from("events").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-events"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-primary">Agenda</h1>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="mr-2 h-4 w-4" />Ajouter</Button>
      </div>

      {editing && <EventForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-events"] }); }} />}

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Titre</th><th className="px-3 py-2">Lieu</th><th className="px-3 py-2">Publié</th><th></th></tr></thead>
          <tbody>
            {data?.map((e) => (
              <tr key={e.id} className="border-t border-border">
                <td className="px-3 py-2">{e.event_date?.slice(0,10)}</td>
                <td className="px-3 py-2 font-medium">{e.title_fr}</td>
                <td className="px-3 py-2">{[e.city, e.country].filter(Boolean).join(", ")}</td>
                <td className="px-3 py-2">{e.is_published ? "✓" : "—"}</td>
                <td className="px-3 py-2 text-right">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(e)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(e.id!)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EventForm({ initial, onSaved, onClose }: { initial: Event; onSaved: () => void; onClose: () => void }) {
  const [form, setForm] = useState<Event>(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Event>(k: K, v: Event[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = form.id
      ? await supabase.from("events").update(form).eq("id", form.id)
      : await supabase.from("events").insert(form);
    setSaving(false);
    if (error) return alert(error.message);
    onSaved();
  }

  return (
    <form onSubmit={save} className="mt-6 space-y-4 rounded-lg border border-border bg-card p-5">
      <h2 className="font-display text-xl">{form.id ? "Modifier" : "Nouvel événement"}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Titre (FR) *</Label><Input required value={form.title_fr} onChange={(e) => set("title_fr", e.target.value)} /></div>
        <div><Label>Titre (EN)</Label><Input value={form.title_en ?? ""} onChange={(e) => set("title_en", e.target.value)} /></div>
        <div><Label>Date *</Label><Input type="date" required value={form.event_date?.slice(0,10)} onChange={(e) => set("event_date", e.target.value)} /></div>
        <div><Label>Type</Label><Input value={form.event_type ?? ""} placeholder="dédicace, conférence…" onChange={(e) => set("event_type", e.target.value)} /></div>
        <div><Label>Lieu</Label><Input value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} /></div>
        <div><Label>Ville</Label><Input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} /></div>
        <div><Label>Pays</Label><Input value={form.country ?? ""} onChange={(e) => set("country", e.target.value)} /></div>
        <div><Label>Lien inscription</Label><Input value={form.registration_url ?? ""} onChange={(e) => set("registration_url", e.target.value)} /></div>
      </div>
      <div><Label>Description (FR)</Label><Textarea rows={3} value={form.description_fr ?? ""} onChange={(e) => set("description_fr", e.target.value)} /></div>
      <div><Label>Description (EN)</Label><Textarea rows={3} value={form.description_en ?? ""} onChange={(e) => set("description_en", e.target.value)} /></div>
      <div className="flex items-center gap-2"><Switch checked={!!form.is_published} onCheckedChange={(v) => set("is_published", v)} /><Label>Publié</Label></div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
      </div>
    </form>
  );
}
