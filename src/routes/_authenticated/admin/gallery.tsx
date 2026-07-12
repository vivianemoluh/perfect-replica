import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMedia } from "@/lib/admin-utils";
import { Trash2 } from "lucide-react";

type Photo = {
  id?: string;
  image_url: string;
  caption_fr: string | null;
  caption_en: string | null;
  category: string | null;
  display_order: number | null;
};

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  ssr: false,
  component: GalleryAdmin,
});

function GalleryAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery").select("*").order("display_order");
      if (error) throw error;
      return data as Photo[];
    },
  });

  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file, "gallery");
      await supabase.from("gallery").insert({
        image_url: url, caption_fr: caption || null, category: category || null,
      });
      setCaption("");
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    } catch (e) { alert((e as Error).message); }
    setUploading(false);
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette photo ?")) return;
    await supabase.from("gallery").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-primary">Galerie</h1>

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <h2 className="font-display text-lg">Ajouter une photo</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div><Label>Légende (FR)</Label><Input value={caption} onChange={(e) => setCaption(e.target.value)} /></div>
          <div><Label>Catégorie</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="dédicaces, portraits…" /></div>
          <div><Label>Fichier image</Label><Input type="file" accept="image/*" disabled={uploading} onChange={(e) => upload(e.target.files?.[0])} /></div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {data?.map((p) => (
          <div key={p.id} className="group relative overflow-hidden rounded-lg border border-border">
            <img src={p.image_url} alt={p.caption_fr ?? ""} className="aspect-square w-full object-cover" />
            <Button size="sm" variant="destructive" className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100" onClick={() => remove(p.id!)}>
              <Trash2 className="h-4 w-4" />
            </Button>
            {p.caption_fr && <p className="bg-card px-2 py-1 text-xs">{p.caption_fr}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
