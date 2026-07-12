import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { uploadMedia } from "@/lib/admin-utils";
import { Pencil, Trash2, Plus } from "lucide-react";

type Resource = {
  id?: string;
  title_fr: string;
  title_en: string | null;
  description_fr: string | null;
  description_en: string | null;
  resource_type: string | null;
  file_url: string;
  is_free: boolean | null;
};

const empty: Resource = {
  title_fr: "", title_en: "", description_fr: "", description_en: "",
  resource_type: "pdf", file_url: "", is_free: true,
};

export const Route = createFileRoute("/_authenticated/admin/resources")({
  ssr: false,
  component: ResourcesAdmin,
});

function ResourcesAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-resources"],
    queryFn: async () => {
      const { data, error } = await supabase.from("resources").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Resource[];
    },
  });
  const [editing, setEditing] = useState<Resource | null>(null);

  async function remove(id: string) {
    if (!confirm("Supprimer cette ressource ?")) return;
    await supabase.from("resources").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-resources"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-primary">Ressources</h1>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="mr-2 h-4 w-4" />Ajouter</Button>
      </div>

      {editing && <ResourceForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-resources"] }); }} />}

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="px-3 py-2">Titre</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Gratuit</th><th></th></tr></thead>
          <tbody>
            {data?.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-3 py-2 font-medium">{r.title_fr}</td>
                <td className="px-3 py-2">{r.resource_type}</td>
                <td className="px-3 py-2">{r.is_free ? "✓" : "—"}</td>
                <td className="px-3 py-2 text-right">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id!)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResourceForm({ initial, onSaved, onClose }: { initial: Resource; onSaved: () => void; onClose: () => void }) {
  const [form, setForm] = useState<Resource>(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Resource>(k: K, v: Resource[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function handleFile(file?: File) {
    if (!file) return;
    try { set("file_url", await uploadMedia(file, "resources")); }
    catch (e) { alert((e as Error).message); }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.file_url) return alert("Veuillez uploader un fichier.");
    setSaving(true);
    const { error } = form.id
      ? await supabase.from("resources").update(form).eq("id", form.id)
      : await supabase.from("resources").insert(form);
    setSaving(false);
    if (error) return alert(error.message);
    onSaved();
  }

  return (
    <form onSubmit={save} className="mt-6 space-y-4 rounded-lg border border-border bg-card p-5">
      <h2 className="font-display text-xl">{form.id ? "Modifier" : "Nouvelle ressource"}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Titre (FR) *</Label><Input required value={form.title_fr} onChange={(e) => set("title_fr", e.target.value)} /></div>
        <div><Label>Titre (EN)</Label><Input value={form.title_en ?? ""} onChange={(e) => set("title_en", e.target.value)} /></div>
        <div><Label>Type</Label><Input value={form.resource_type ?? ""} onChange={(e) => set("resource_type", e.target.value)} /></div>
      </div>
      <div><Label>Description (FR)</Label><Textarea rows={3} value={form.description_fr ?? ""} onChange={(e) => set("description_fr", e.target.value)} /></div>
      <div><Label>Description (EN)</Label><Textarea rows={3} value={form.description_en ?? ""} onChange={(e) => set("description_en", e.target.value)} /></div>
      <div>
        <Label>Fichier</Label>
        <Input type="file" onChange={(e) => handleFile(e.target.files?.[0])} />
        {form.file_url && <p className="mt-1 text-xs text-muted-foreground break-all">{form.file_url}</p>}
      </div>
      <div className="flex items-center gap-2"><Switch checked={!!form.is_free} onCheckedChange={(v) => set("is_free", v)} /><Label>Gratuit</Label></div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
      </div>
    </form>
  );
}
