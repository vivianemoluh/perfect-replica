import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { NewsletterForm } from "./NewsletterForm";
import { Facebook, Mail } from "lucide-react";

const CONTACT_EMAIL = "moluhviviane@yahoo.fr";
const FACEBOOK_URL = "https://www.facebook.com/"; // TODO: remplacer par l'URL exacte du profil "Viviane MOLUH PEYOU Auteure"

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-border/60 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <h3 className="font-display text-2xl text-primary-foreground">Viviane Moluh Peyou</h3>
          <p className="font-quote mt-2 text-primary-foreground/80">{t("footer.tagline")}</p>
        </div>

        <div>
          <h4 className="font-display text-base text-gold">{t("footer.navigation")}</h4>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/biographie" className="hover:text-gold">{t("nav.biography")}</Link></li>
            <li><Link to="/livres" className="hover:text-gold">{t("nav.books")}</Link></li>
            <li><Link to="/chroniques" className="hover:text-gold">{t("nav.chronicles")}</Link></li>
            <li><Link to="/agenda" className="hover:text-gold">{t("nav.agenda")}</Link></li>
            <li><Link to="/contact" className="hover:text-gold">{t("nav.contact")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base text-gold">{t("footer.legal")}</h4>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/mentions-legales" className="hover:text-gold">{t("legal.legalNoticeTitle")}</Link></li>
            <li><Link to="/politique-de-confidentialite" className="hover:text-gold">{t("legal.privacyTitle")}</Link></li>
          </ul>
          <h4 className="font-display mt-6 text-base text-gold">{t("footer.follow")}</h4>
          <div className="mt-3 flex items-center gap-4 text-primary-foreground/80">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              aria-label={`E-mail : ${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 hover:text-gold"
            >
              <Mail size={20} />
              <span className="text-sm">{CONTACT_EMAIL}</span>
            </a>
          </div>
          <div className="mt-2 flex items-center gap-4 text-primary-foreground/80">
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook : Viviane MOLUH PEYOU Auteure"
              className="inline-flex items-center gap-2 hover:text-gold"
            >
              <Facebook size={20} />
              <span className="text-sm">Viviane MOLUH PEYOU Auteure</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-base text-gold">{t("nav.newsletter")}</h4>
          <p className="mt-2 text-sm text-primary-foreground/80">{t("home.newsletterBody")}</p>
          <div className="mt-3"><NewsletterForm source="footer" compact /></div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-primary-foreground/70 sm:flex-row sm:px-6 lg:px-8">
          <p>© {year} Viviane Moluh Peyou. {t("footer.rights")}.</p>
          <p>
            {t("footer.credit")}{" "}
            <a
              href="https://portfolio-adrien-pma.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              Adrien
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
