const METRICS = [
  { value: "+R$ 40Mi", label: "em novos negócios gerados" },
  { value: "+25K", label: "conteúdos digitais publicados" },
  { value: "+R$ 650K", label: "em mídia gerenciada" },
  { value: "+55", label: "campanhas desenvolvidas" },
];

export function Metrics() {
  return (
    <section className="container pb-24 md:pb-32">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
        {METRICS.map((m, i) => (
          <div
            key={i}
            className="bg-card p-8 md:p-10 group hover:bg-surface transition-colors relative"
          >
            <p className="font-mono-label text-foreground/40 mb-6">0{i + 1}</p>
            <p className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary tracking-tight">
              {m.value}
            </p>
            <p className="mt-3 text-sm text-foreground/60 leading-relaxed">{m.label}</p>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </section>
  );
}