import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/politique-de-confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — Viviane Moluh Peyou" },
      { property: "og:url", content: "/politique-de-confidentialite" },
    ],
    links: [{ rel: "canonical", href: "/politique-de-confidentialite" }],
  }),
  component: () => {
    const { t } = useTranslation();
    return (
      <>
        <PageHeader title={t("legal.privacyTitle")} />
        <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-foreground/85 leading-relaxed">{t("legal.privacyBody")}</p>
        </article>
      </>
    );
  },
});
