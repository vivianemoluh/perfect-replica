import { createFileRoute } from "@tanstack/react-router";

const BASE_URL = "";

const ROUTES = [
  { path: "/", priority: "1.0", changefreq: "weekly" as const },
  { path: "/biographie", priority: "0.8", changefreq: "monthly" as const },
  { path: "/livres", priority: "0.9", changefreq: "weekly" as const },
  { path: "/chroniques", priority: "0.8", changefreq: "weekly" as const },
  { path: "/agenda", priority: "0.7", changefreq: "weekly" as const },
  { path: "/galerie", priority: "0.6", changefreq: "monthly" as const },
  { path: "/ressources", priority: "0.7", changefreq: "monthly" as const },
  { path: "/newsletter", priority: "0.6", changefreq: "monthly" as const },
  { path: "/contact", priority: "0.6", changefreq: "yearly" as const },
  { path: "/mentions-legales", priority: "0.3", changefreq: "yearly" as const },
  { path: "/politique-de-confidentialite", priority: "0.3", changefreq: "yearly" as const },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const entries: Array<{ path: string; priority?: string; changefreq?: string }> = [...ROUTES];

        const { data: books } = await supabaseAdmin
          .from("books")
          .select("slug")
          .eq("is_published", true);
        books?.forEach((b) => entries.push({ path: `/livres/${b.slug}`, priority: "0.7", changefreq: "monthly" }));

        const { data: articles } = await supabaseAdmin
          .from("articles")
          .select("slug")
          .eq("is_published", true);
        articles?.forEach((a) => entries.push({ path: `/chroniques/${a.slug}`, priority: "0.6", changefreq: "monthly" }));

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
