import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import type { Book } from "@/lib/types";
import { PageHeader } from "@/components/site/PageHeader";
import { BookCard } from "@/components/site/BookCard";

export const Route = createFileRoute("/livres")({
  head: () => ({
    meta: [
      { title: "Mes livres — Viviane Moluh Peyou" },
      { name: "description", content: "Romans, poésie et théâtre de Viviane Moluh Peyou." },
      { property: "og:title", content: "Mes livres — Viviane Moluh Peyou" },
      { property: "og:url", content: "/livres" },
    ],
    links: [{ rel: "canonical", href: "/livres" }],
  }),
  component: BooksPage,
});

function BooksPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data } = useQuery({
    queryKey: ["books-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Book[];
    },
  });

  return (
    <>
      <PageHeader title={t("books.title")} intro={t("books.intro")} />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((b) => <BookCard key={b.id} book={b} lang={lang} />)}
        </div>
      </section>
    </>
  );
}
