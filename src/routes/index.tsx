import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Article, Book, EventItem } from "@/lib/types";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { BookCard } from "@/components/site/BookCard";
import { ChronicleCard } from "@/components/site/ChronicleCard";
import { EventRow } from "@/components/site/EventRow";
import { Reveal } from "@/components/site/Reveal";
const heroPortrait = { url: "https://res.cloudinary.com/viryenyp/image/upload/v1783724790/viviane-portrait_hhdop8.jpg" };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Viviane Moluh Peyou — Écrivaine et romancière camerounaise" },
      {
        name: "description",
        content:
          "Site officiel de Viviane Moluh Peyou. Romans Les choix de l'ombre et Poùre, le mouton noir des Njoya. Manuels officiels LATINITAS. La mise en mots des maux.",
      },
      { property: "og:title", content: "Viviane Moluh Peyou — Écrivaine et romancière" },
      { property: "og:description", content: "Romans, manuels officiels de latin, chroniques littéraires." },
      { property: "og:image", content: heroPortrait.url },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});


function HomePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const reduce = useReducedMotion();

  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const heroTextY = useTransform(scrollY, [0, 600], [0, reduce ? 0 : -50]);
  const heroPortraitY = useTransform(scrollY, [0, 600], [0, reduce ? 0 : -110]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, reduce ? 1 : 0.55]);

  const books = useQuery({
    queryKey: ["home-books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books").select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .limit(3);
      if (error) throw error;
      return (data ?? []) as Book[];
    },
  });

  const articles = useQuery({
    queryKey: ["home-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles").select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data ?? []) as Article[];
    },
  });

  const events = useQuery({
    queryKey: ["home-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events").select("*")
        .eq("is_published", true)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(3);
      if (error) throw error;
      return (data ?? []) as EventItem[];
    },
  });

  return (
    <>
      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden border-b border-border/60">
        <motion.div style={{ opacity: heroOpacity }} className="paper-bg absolute inset-0 opacity-50" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-24 lg:px-8 lg:py-32">
          <motion.div
            style={{ y: heroTextY }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-quote text-sm tracking-[0.3em] text-gold uppercase">
              {t("home.heroIntro")}
            </p>
            <h1 className="mt-4 gold-shimmer">Viviane Moluh Peyou</h1>
            <p className="font-quote mt-5 text-2xl text-foreground/85 sm:text-3xl">
              « {t("meta.tagline")} »
            </p>
            <p className="mt-6 max-w-xl text-base text-foreground/80">
              {t("home.introBody")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/livres"
                className="group/btn inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5"
              >
                {t("home.heroCta")}
                <span className="transition-transform group-hover/btn:translate-x-1">→</span>
              </Link>
              <Link
                to="/chroniques"
                className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-primary/30 bg-transparent px-6 text-sm font-medium text-primary transition-all hover:border-gold hover:bg-primary/5"
              >
                {t("home.heroCtaSecondary")}
              </Link>
            </div>
          </motion.div>

          <motion.div
            style={{ y: heroPortraitY }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="relative mx-auto aspect-[4/5] w-full max-w-md"
          >
            <motion.div
              aria-hidden
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.3, ease: "easeOut", delay: 0.4 }}
              className="absolute -inset-3 border border-gold/40"
            />
            <div className="relative h-full w-full overflow-hidden shadow-2xl">
              <img
                src={heroPortrait.url}
                alt="Portrait de Viviane Moluh Peyou, écrivaine et romancière camerounaise"
                className="h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>

          </motion.div>
        </div>
      </section>

      {/* INTRO */}
      <Reveal>
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="gold-divider" />
          <h2 className="mt-4">{t("home.introTitle")}</h2>
          <p className="font-quote mt-5 text-xl text-foreground/80">
            « {t("home.introBody")} »
          </p>
        </section>
      </Reveal>

      {/* BOOKS */}
      <section className="bg-card/40 border-y border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <h2>{t("home.featuredBooks")}</h2>
              <Link to="/livres" className="nav-underline text-sm text-primary">
                {t("common.seeAll")} →
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {books.data?.map((b, i) => (
              <Reveal key={b.id} delay={i * 0.12}>
                <BookCard book={b} lang={lang} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CHRONICLES */}
      {articles.data && articles.data.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <h2>{t("home.latestChronicles")}</h2>
              <Link to="/chroniques" className="nav-underline text-sm text-primary">
                {t("common.seeAll")} →
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {articles.data.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.1}>
                <ChronicleCard article={a} lang={lang} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* EVENTS */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal><h2>{t("home.upcomingEvents")}</h2></Reveal>
          <div className="mt-8 space-y-4">
            {events.data && events.data.length > 0 ? (
              events.data.map((e, i) => (
                <Reveal key={e.id} delay={i * 0.1}>
                  <EventRow event={e} lang={lang} />
                </Reveal>
              ))
            ) : (
              <Reveal>
                <p className="font-quote text-lg text-muted-foreground">
                  {t("home.upcomingEventsEmpty")}
                </p>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <Reveal y={32}>
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="gold-divider" />
          <h2 className="mt-4">{t("home.newsletterTitle")}</h2>
          <p className="mt-3 text-foreground/80">{t("home.newsletterBody")}</p>
          <div className="mt-8 text-left">
            <NewsletterForm source="home" />
          </div>
        </section>
      </Reveal>
    </>
  );
}
