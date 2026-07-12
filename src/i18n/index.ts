import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources, type Lang } from "./translations";

const STORAGE_KEY = "vmp.lang";

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "fr";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "fr" || stored === "en") return stored;
  const nav = window.navigator.language?.toLowerCase() ?? "fr";
  return nav.startsWith("en") ? "en" : "fr";
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: getInitialLang(),
    fallbackLng: "fr",
    interpolation: { escapeValue: false },
    returnObjects: true,
  });
}

export function setLanguage(lang: Lang) {
  void i18n.changeLanguage(lang);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }
}

export { i18n };
export type { Lang };
