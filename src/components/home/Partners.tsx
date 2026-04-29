const PARTNERS = ["RD STATION", "META BUSINESS", "GOOGLE PARTNER", "HUBSPOT", "KOMMO", "ABRADI"];

export function Partners() {
  return (
    <section className="bg-background border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-foreground/50 mb-8">
          Parceiros e certificações
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {PARTNERS.map((p) => (
            <span
              key={p}
              className="font-sans font-semibold text-sm tracking-wide text-foreground/45 hover:text-foreground/90 transition-colors"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}