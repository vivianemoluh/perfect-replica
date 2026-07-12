import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { setLanguage, type Lang } from "@/i18n";
import { Menu, X } from "lucide-react";

const NAV_LINKS: Array<{ to: string; key: string }> = [
  { to: "/", key: "nav.home" },
  { to: "/biographie", key: "nav.biography" },
  { to: "/livres", key: "nav.books" },
  { to: "/chroniques", key: "nav.chronicles" },
  { to: "/agenda", key: "nav.agenda" },
  { to: "/galerie", key: "nav.gallery" },
  { to: "/ressources", key: "nav.resources" },
  { to: "/newsletter", key: "nav.newsletter" },
  { to: "/contact", key: "nav.contact" },
];

export function Header() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = i18n.language as Lang;

  const switchLang = (l: Lang) => setLanguage(l);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex flex-col leading-none" onClick={() => setOpen(false)}>
          <span className="font-display text-xl font-semibold text-primary sm:text-2xl">
            Viviane Moluh Peyou
          </span>
          <span className="font-quote text-xs text-muted-foreground sm:text-sm">
            {t("meta.tagline")}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="nav-underline text-sm tracking-wide text-foreground/80 transition-colors hover:text-primary data-[status=active]:text-primary"
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center text-sm font-medium text-foreground/70">
            <button
              type="button"
              onClick={() => switchLang("fr")}
              aria-pressed={current === "fr"}
              className={`min-h-[44px] min-w-[44px] px-2 transition-colors ${current === "fr" ? "text-primary font-semibold" : "hover:text-primary"}`}
            >
              FR
            </button>
            <span className="text-border">|</span>
            <button
              type="button"
              onClick={() => switchLang("en")}
              aria-pressed={current === "en"}
              className={`min-h-[44px] min-w-[44px] px-2 transition-colors ${current === "en" ? "text-primary font-semibold" : "hover:text-primary"}`}
            >
              EN
            </button>
          </div>
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-primary lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? t("nav.close") : t("nav.menu")}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border/60 bg-background lg:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  activeOptions={{ exact: l.to === "/" }}
                  onClick={() => setOpen(false)}
                  className="block min-h-[44px] border-b border-border/40 py-3 text-base text-foreground/85 data-[status=active]:font-semibold data-[status=active]:text-primary"
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
