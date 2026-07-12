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

type Book = {
  id?: string;
  slug: string;
  title_fr: string;
  title_en: string | null;
  summary_fr: string | null;
  summary_en: string | null;
  genre: string | null;
  publication_year: number | null;
  cover_url: string | null;
  excerpt_url: string | null;
  purchase_links: Record<string, string> | null;
  display_order: number | null;
  is_published: boolean | null;
};

const empty: Book = {
  slug: "", title_fr: "", title_en: "", summary_fr: "", summary_en: "",
  genre: "", publication_year: new Date().getFullYear(), cover_url: "", excerpt_url: "",
  purchase_links: {}, display_order: 0, is_published: true,
};

export const Route = createFileRoute("/_authenticated/admin/books")({
  ssr: false,
  component: BooksAdmin,
});

function BooksAdmin() {
  const qc = useQueryClient();
  const { data: books } = useQuery({
    queryKey: ["admin-books"],
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select("*").order("display_order");
      if (error) throw error;
      return data as Book[];
    },
  });
  const [editing, setEditing] = useState<Book | null>(null);

  async function remove(id: string) {
    if (!confirm("Supprimer ce livre ?")) return;
    await supabase.from("books").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-books"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-primary">Livres</h1>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="mr-2 h-4 w-4" />Ajouter</Button>
      </div>

      {editing && (
        <BookForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-books"] }); }}
        />
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2">Couverture</th>
              <th className="px-3 py-2">Titre</th>
              <th className="px-3 py-2">Année</th>
              <th className="px-3 py-2">Publié</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {books?.map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="px-3 py-2">
                  {b.cover_url && <img src={b.cover_url} alt="" className="h-12 w-9 rounded object-cover" />}
                </td>
                <td className="px-3 py-2 font-medium">{b.title_fr}</td>
                <td className="px-3 py-2">{b.publication_year}</td>
                <td className="px-3 py-2">{b.is_published ? "✓" : "—"}</td>
                <td className="px-3 py-2 text-right">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(b)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(b.id!)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookForm({ initial, onSaved, onClose }: { initial: Book; onSaved: () => void; onClose: () => void }) {
  const [form, setForm] = useState<Book>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof Book>(k: K, v: Book[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function handleCover(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file, "covers");
      set("cover_url", url);
    } catch (e) { alert((e as Error).message); }
    setUploading(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, slug: form.slug || slugify(form.title_fr) };
    const { error } = form.id
      ? await supabase.from("books").update(payload).eq("id", form.id)
      : await supabase.from("books").insert(payload);
    setSaving(false);
    if (error) return alert(error.message);
    onSaved();
  }

  return (
    <form onSubmit={save} className="mt-6 space-y-4 rounded-lg border border-border bg-card p-5">
      <h2 className="font-display text-xl">{form.id ? "Modifier" : "Nouveau livre"}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Titre (FR) *</Label><Input required value={form.title_fr} onChange={(e) => set("title_fr", e.target.value)} /></div>
        <div><Label>Titre (EN)</Label><Input value={form.title_en ?? ""} onChange={(e) => set("title_en", e.target.value)} /></div>
        <div><Label>Slug (URL)</Label><Input value={form.slug} placeholder="auto" onChange={(e) => set("slug", e.target.value)} /></div>
        <div><Label>Genre</Label><Input value={form.genre ?? ""} onChange={(e) => set("genre", e.target.value)} /></div>
        <div><Label>Année</Label><Input type="number" value={form.publication_year ?? ""} onChange={(e) => set("publication_year", e.target.value ? Number(e.target.value) : null)} /></div>
        <div><Label>Ordre d'affichage</Label><Input type="number" value={form.display_order ?? 0} onChange={(e) => set("display_order", Number(e.target.value))} /></div>
      </div>
      <div><Label>Résumé (FR)</Label><Textarea rows={4} value={form.summary_fr ?? ""} onChange={(e) => set("summary_fr", e.target.value)} /></div>
      <div><Label>Résumé (EN)</Label><Textarea rows={4} value={form.summary_en ?? ""} onChange={(e) => set("summary_en", e.target.value)} /></div>
      <div>
        <Label>Couverture</Label>
        <div className="flex items-center gap-3">
          {form.cover_url && <img src={form.cover_url} alt="" className="h-20 w-14 rounded object-cover" />}
          <Input type="file" accept="image/*" onChange={(e) => handleCover(e.target.files?.[0])} disabled={uploading} />
        </div>
      </div>
      <div><Label>Lien extrait (PDF URL)</Label><Input value={form.excerpt_url ?? ""} onChange={(e) => set("excerpt_url", e.target.value)} /></div>
      <div><Label>Liens d'achat (JSON, ex: {`{"amazon":"https://..."}`})</Label>
        <Textarea rows={3} value={JSON.stringify(form.purchase_links ?? {}, null, 2)} onChange={(e) => { try { set("purchase_links", JSON.parse(e.target.value)); } catch { /* ignore */ } }} />
      </div>
      <div className="flex items-center gap-2"><Switch checked={!!form.is_published} onCheckedChange={(v) => set("is_published", v)} /><Label>Publié</Label></div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving || uploading}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
      </div>
    </form>
  );
}
