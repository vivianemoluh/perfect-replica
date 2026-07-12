import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, UploadCloud } from "lucide-react";

type Photo = {
  id?: string;
  image_url: string;
  caption_fr: string | null;
  caption_en: string | null;
  category: string | null;
  display_order: number | null;
};

const CATEGORIES = [
  { value: "dedicaces", label: "Dédicaces" },
  { value: "evenements", label: "Événements" },
  { value: "rencontres", label: "Rencontres" },
  { value: "portraits", label: "Portraits" },
];

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  ssr: false,
  component: GalleryAdmin,
});

function GalleryAdmin() {
  const qc = useQueryClient();
  const { upload, isLoading: uploading, error: uploadError } = useCloudinaryUpload();

  const { data } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery").select("*").order("display_order");
      if (error) throw error;
      return data as Photo[];
    },
  });

  const [imageUrl, setImageUrl] = useState("");
  const [captionFr, setCaptionFr] = useState("");
  const [captionEn, setCaptionEn] = useState("");
  const [category, setCategory] = useState("dedicaces");
  const [saving, setSaving] = useState(false);

  async function handleFile(file?: File) {
    if (!file) return;
    const url = await upload(file, "gallery");
    if (url) setImageUrl(url);
  }

  function resetForm() {
    setImageUrl("");
    setCaptionFr("");
    setCaptionEn("");
    setCategory("dedicaces");
  }

  async function save() {
    if (!imageUrl) {
      alert("Veuillez d'abord uploader une image.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("gallery").insert({
      image_url: imageUrl,
      caption_fr: captionFr || null,
      caption_en: captionEn || null,
      category,
    });
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    resetForm();
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    qc.invalidateQueries({ queryKey: ["gallery"] });
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette photo ?")) return;
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    qc.invalidateQueries({ queryKey: ["gallery"] });
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-primary">Galerie</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ajoutez une photo : uploadez l'image, remplissez les légendes puis cliquez sur « Enregistrer ».
      </p>

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <h2 className="font-display text-lg">Ajouter une photo</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-[200px_1fr]">
          {/* Upload + preview */}
          <div>
            <Label>Image</Label>
            <div className="mt-1 flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted/30">
              {imageUrl ? (
                <img src={imageUrl} alt="Aperçu" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <UploadCloud className="h-8 w-8" />
                  <span className="mt-1 text-xs">{uploading ? "Upload en cours…" : "Aucune image"}</span>
                </div>
              )}
            </div>
            <Input
              className="mt-2"
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {uploadError && <p className="mt-1 text-xs text-destructive">{uploadError}</p>}
          </div>

          {/* Fields */}
          <div className="grid content-start gap-3">
            <div>
              <Label>Légende (FR)</Label>
              <Input value={captionFr} onChange={(e) => setCaptionFr(e.target.value)} placeholder="Ex : Dédicace au salon du livre" />
            </div>
            <div>
              <Label>Légende (EN)</Label>
              <Input value={captionEn} onChange={(e) => setCaptionEn(e.target.value)} placeholder="Ex : Book signing" />
            </div>
            <div>
              <Label>Catégorie</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="mt-2 flex gap-2">
              <Button onClick={save} disabled={saving || uploading || !imageUrl}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {data?.map((p) => (
          <div key={p.id} className="group relative overflow-hidden rounded-lg border border-border">
            <img src={p.image_url} alt={p.caption_fr ?? ""} className="aspect-square w-full object-cover" />
            <Button
              size="sm"
              variant="destructive"
              className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => remove(p.id!)}
            >
              <Trash2 className="mr-1 h-4 w-4" /> Supprimer
            </Button>
            {(p.caption_fr || p.category) && (
              <div className="bg-card px-2 py-1 text-xs">
                {p.caption_fr && <p className="font-medium">{p.caption_fr}</p>}
                {p.category && <p className="text-muted-foreground">{p.category}</p>}
              </div>
            )}
          </div>
        ))}
        {data?.length === 0 && <p className="text-sm text-muted-foreground">Aucune photo pour le moment.</p>}
      </div>
    </div>
  );
}
