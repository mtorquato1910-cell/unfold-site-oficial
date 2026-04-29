const LOGOS = [
  "ALGAR", "BDMG", "SODEXO", "TRANSUNION", "SANKHYA", "NEOGRID",
  "ZENVIA", "EDENRED", "HOUSI", "LEO PHARMA", "DIMEP", "AEC",
  "VERDEMAR", "UNIMED", "EVOLUA", "MV SAÚDE", "JOIN", "CARGILL",
];

export function ClientLogos() {
  return (
    <section className="bg-background border-y border-border py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-primary mb-10">
          Empresas que confiam na Unfold
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-x-8 gap-y-10">
          {LOGOS.map((name) => (
            <div
              key={name}
              className="flex items-center justify-center text-foreground/50 hover:text-foreground transition-colors"
            >
              <span className="font-sans font-bold text-base md:text-lg tracking-tight whitespace-nowrap">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}