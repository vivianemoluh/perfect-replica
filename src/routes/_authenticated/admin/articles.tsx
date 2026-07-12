import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { uploadMedia, slugify } from "@/lib/admin-utils";
import { Pencil, Trash2, Plus } from "lucide-react";

type Article = {
  id?: string;
  slug: string;
  title_fr: string;
  title_en: string | null;
  excerpt_fr: string | null;
  excerpt_en: string | null;
  content_fr: string | null;
  content_en: string | null;
  category: string | null;
  cover_image_url: string | null;
  is_published: boolean | null;
  published_at: string | null;
};

const empty: Article = {
  slug: "", title_fr: "", title_en: "", excerpt_fr: "", excerpt_en: "",
  content_fr: "", content_en: "", category: "", cover_image_url: "",
  is_published: true, published_at: new Date().toISOString().slice(0, 10),
};

export const Route = createFileRoute("/_authenticated/admin/articles")({
  ssr: false,
  component: ArticlesAdmin,
});

function ArticlesAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("articles").select("*").order("published_at", { ascending: false });
      if (error) throw error;
      return data as Article[];
    },
  });
  const [editing, setEditing] = useState<Article | null>(null);

  async function remove(id: string) {
    if (!confirm("Supprimer cette chronique ?")) return;
    await supabase.from("articles").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-articles"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-primary">Chroniques</h1>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="mr-2 h-4 w-4" />Ajouter</Button>
      </div>

      {editing && (
        <ArticleForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-articles"] }); }} />
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="px-3 py-2">Titre</th><th className="px-3 py-2">Catégorie</th><th className="px-3 py-2">Date</th><th className="px-3 py-2">Publié</th><th></th></tr></thead>
          <tbody>
            {data?.map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="px-3 py-2 font-medium">{a.title_fr}</td>
                <td className="px-3 py-2">{a.category}</td>
                <td className="px-3 py-2">{a.published_at?.slice(0,10)}</td>
                <td className="px-3 py-2">{a.is_published ? "✓" : "—"}</td>
                <td className="px-3 py-2 text-right">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(a)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(a.id!)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ArticleForm({ initial, onSaved, onClose }: { initial: Article; onSaved: () => void; onClose: () => void }) {
  const [form, setForm] = useState<Article>(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Article>(k: K, v: Article[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function handleCover(file?: File) {
    if (!file) return;
    try { set("cover_image_url", await uploadMedia(file, "articles")); }
    catch (e) { alert((e as Error).message); }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, slug: form.slug || slugify(form.title_fr) };
    const { error } = form.id
      ? await supabase.from("articles").update(payload).eq("id", form.id)
      : await supabase.from("articles").insert(payload);
    setSaving(false);
    if (error) return alert(error.message);
    onSaved();
  }

  return (
    <form onSubmit={save} className="mt-6 space-y-4 rounded-lg border border-border bg-card p-5">
      <h2 className="font-display text-xl">{form.id ? "Modifier" : "Nouvelle chronique"}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Titre (FR) *</Label><Input required value={form.title_fr} onChange={(e) => set("title_fr", e.target.value)} /></div>
        <div><Label>Titre (EN)</Label><Input value={form.title_en ?? ""} onChange={(e) => set("title_en", e.target.value)} /></div>
        <div><Label>Slug</Label><Input value={form.slug} placeholder="auto" onChange={(e) => set("slug", e.target.value)} /></div>
        <div><Label>Catégorie</Label><Input value={form.category ?? ""} onChange={(e) => set("category", e.target.value)} /></div>
        <div><Label>Date de publication</Label><Input type="date" value={form.published_at?.slice(0,10) ?? ""} onChange={(e) => set("published_at", e.target.value)} /></div>
      </div>
      <div><Label>Extrait (FR)</Label><Textarea rows={2} value={form.excerpt_fr ?? ""} onChange={(e) => set("excerpt_fr", e.target.value)} /></div>
      <div><Label>Extrait (EN)</Label><Textarea rows={2} value={form.excerpt_en ?? ""} onChange={(e) => set("excerpt_en", e.target.value)} /></div>
      <div><Label>Contenu (FR) — Markdown supporté</Label><Textarea rows={10} value={form.content_fr ?? ""} onChange={(e) => set("content_fr", e.target.value)} /></div>
      <div><Label>Contenu (EN)</Label><Textarea rows={10} value={form.content_en ?? ""} onChange={(e) => set("content_en", e.target.value)} /></div>
      <div>
        <Label>Image de couverture</Label>
        <div className="flex items-center gap-3">
          {form.cover_image_url && <img src={form.cover_image_url} alt="" className="h-16 w-24 rounded object-cover" />}
          <Input type="file" accept="image/*" onChange={(e) => handleCover(e.target.files?.[0])} />
        </div>
      </div>
      <div className="flex items-center gap-2"><Switch checked={!!form.is_published} onCheckedChange={(v) => set("is_published", v)} /><Label>Publié</Label></div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
      </div>
    </form>
  );
}
