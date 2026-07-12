import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/site/PageHeader";
import { submitContactMessage } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Viviane Moluh Peyou" },
      { name: "description", content: "Pour une interview, une conférence, un partenariat ou toute autre demande." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useTranslation();
  const send = useServerFn(submitContactMessage);
  const [form, setForm] = useState({ name: "", email: "", subject: "conference", message: "", honeypot: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await send({ data: form });
      setStatus("success");
      setForm({ name: "", email: "", subject: "conference", message: "", honeypot: "" });
    } catch {
      setStatus("error");
    }
  }

  const subjects = ["conference", "interview", "partenariat", "autre"] as const;

  return (
    <>
      <PageHeader title={t("contact.title")} intro={t("contact.intro")} />
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        {status === "success" ? (
          <div className="rounded-lg border border-gold/40 bg-card p-8 text-center">
            <h2 className="text-2xl">{t("contact.successTitle")}</h2>
            <p className="mt-3 text-foreground/85">{t("contact.successBody")}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <input type="text" name="website" tabIndex={-1} autoComplete="off"
              value={form.honeypot}
              onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
              className="hidden" aria-hidden />

            <Field label={t("common.name")}>
              <input required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </Field>
            <Field label={t("common.email")}>
              <input type="email" required maxLength={200} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
            </Field>
            <Field label={t("common.subject")}>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input">
                {subjects.map((s) => <option key={s} value={s}>{t(`contact.subjects.${s}`)}</option>)}
              </select>
            </Field>
            <Field label={t("common.message")}>
              <textarea required minLength={5} maxLength={4000} rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input resize-y" />
            </Field>

            <button type="submit" disabled={status === "loading"} className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {status === "loading" ? t("common.sending") : t("common.submit")}
            </button>
            {status === "error" && <p className="text-sm text-destructive">{t("common.error")}</p>}
            <p className="text-xs text-muted-foreground">{t("contact.responseTime")}</p>
          </form>
        )}
      </section>
      <style>{`
        .input { width: 100%; min-height: 44px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-card); padding: 0.5rem 0.75rem; font-size: 0.95rem; color: var(--color-foreground); }
        .input:focus { outline: 2px solid var(--color-gold); outline-offset: 1px; border-color: var(--color-primary); }
      `}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground/85">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
