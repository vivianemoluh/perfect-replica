import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const KEY = "vmp.cookies.ok";

export function CookieBanner() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(KEY)) setShow(true);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-lg border border-border/70 bg-card p-4 shadow-2xl sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground/85">{t("cookies.message")}</p>
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(KEY, "1");
            setShow(false);
          }}
          className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("cookies.accept")}
        </button>
      </div>
    </div>
  );
}
