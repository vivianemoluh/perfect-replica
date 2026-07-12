import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { subscribeToNewsletter } from "@/lib/newsletter.functions";

export function NewsletterForm({ source = "site", compact = false }: { source?: string; compact?: boolean }) {
  const { t } = useTranslation();
  const subscribe = useServerFn(subscribeToNewsletter);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await subscribe({ data: { firstName, email, source } });
      setStatus(res.alreadySubscribed ? "already" : "success");
      setFirstName("");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  const onPrimary = compact;
  const inputCls = onPrimary
    ? "w-full min-h-[44px] rounded-md border border-primary-foreground/20 bg-primary-foreground/10 px-3 text-sm text-primary-foreground placeholder:text-primary-foreground/60 focus:border-gold focus:bg-primary-foreground/15"
    : "w-full min-h-[44px] rounded-md border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary";
  const buttonCls = onPrimary
    ? "min-h-[44px] rounded-md bg-gold px-5 text-sm font-medium text-gold-foreground transition-colors hover:bg-gold/90 disabled:opacity-60"
    : "min-h-[44px] rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60";

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className={compact ? "flex flex-col gap-2 sm:flex-row" : "grid gap-2 sm:grid-cols-[1fr_1fr_auto]"}>
        {!compact && (
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder={t("common.firstName")}
            className={inputCls}
            maxLength={80}
          />
        )}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("common.email")}
          className={inputCls}
          maxLength={200}
        />
        <button type="submit" disabled={status === "loading"} className={buttonCls}>
          {status === "loading" ? t("common.sending") : t("common.submit")}
        </button>
      </div>
      {status === "success" && (
        <p className={onPrimary ? "text-xs text-gold" : "text-xs text-primary"}>{t("newsletter.signupSuccess")}</p>
      )}
      {status === "already" && (
        <p className={onPrimary ? "text-xs text-primary-foreground/80" : "text-xs text-muted-foreground"}>{t("newsletter.signupAlready")}</p>
      )}
      {status === "error" && <p className="text-xs text-destructive">{t("common.error")}</p>}
    </form>
  );
}
