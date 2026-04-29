const LOGOS = [
  "Lumen", "Northwind", "Ironclad", "Helios", "Vector", "Cobalt",
  "Atlas Co.", "Stratus", "Quanta", "Forge", "Nebula", "Polaris",
];

export function LogosMarquee() {
  return (
    <section className="border-y border-border bg-surface/30 py-10 overflow-hidden">
      <div className="container">
        <p className="font-mono-label text-foreground/40 text-center mb-8">
          [ Empresas que confiam na Unfold ]
        </p>
      </div>
      <div className="relative">
        <div className="flex marquee whitespace-nowrap">
          {[...LOGOS, ...LOGOS].map((name, i) => (
            <div
              key={i}
              className="flex items-center gap-3 mx-10 text-foreground/40 hover:text-foreground transition-colors"
            >
              <div className="h-2 w-2 rounded-sm bg-current opacity-60" />
              <span className="font-display text-2xl font-bold tracking-tight">{name}</span>
            </div>
          ))}
        </div>
        {/* fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}