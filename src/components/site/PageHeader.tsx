import type { ReactNode } from "react";

export function PageHeader({ kicker, title, intro }: { kicker?: string; title: string; intro?: ReactNode }) {
  return (
    <header className="border-b border-border/60">
      <div className="paper-bg">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          {kicker && (
            <p className="font-quote text-sm uppercase tracking-[0.3em] text-gold">{kicker}</p>
          )}
          <h1 className="mt-3">{title}</h1>
          {intro && <p className="mx-auto mt-5 max-w-2xl text-foreground/80">{intro}</p>}
          <span className="gold-divider mt-6" />
        </div>
      </div>
    </header>
  );
}
