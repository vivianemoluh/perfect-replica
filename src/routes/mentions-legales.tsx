import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Viviane Moluh Peyou" },
      { property: "og:url", content: "/mentions-legales" },
    ],
    links: [{ rel: "canonical", href: "/mentions-legales" }],
  }),
  component: () => {
    const { t } = useTranslation();
    return (
      <>
        <PageHeader title={t("legal.legalNoticeTitle")} />
        <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-foreground/85 leading-relaxed">{t("legal.legalNoticeBody")}</p>
        </article>
      </>
    );
  },
});
