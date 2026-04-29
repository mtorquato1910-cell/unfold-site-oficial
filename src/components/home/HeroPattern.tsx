/**
 * Animated layered geometric pattern for the hero background.
 * Pure SVG — respects reduced motion via CSS animation only on transforms.
 */
export function HeroPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />

      {/* Layered diamonds */}
      <svg
        className="absolute -right-20 top-10 w-[680px] max-w-[80vw] opacity-70 animate-float-slow"
        viewBox="0 0 600 600"
        fill="none"
      >
        <defs>
          <linearGradient id="hero-g1" x1="0" y1="0" x2="600" y2="600">
            <stop offset="0%" stopColor="hsl(158 92% 70%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(218 94% 78%)" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="hero-g2" x1="0" y1="0" x2="600" y2="600">
            <stop offset="0%" stopColor="hsl(218 94% 78%)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(250 64% 55%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 40, 80, 120, 160].map((o, i) => (
          <rect
            key={i}
            x={150 + o / 2}
            y={150 + o / 2}
            width={300 - o}
            height={300 - o}
            transform={`rotate(45 300 300)`}
            stroke={i % 2 === 0 ? "url(#hero-g1)" : "url(#hero-g2)"}
            strokeWidth="1"
            fill="none"
            rx="14"
          />
        ))}
      </svg>

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(158 92% 70% / 0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(158 92% 70% / 0.6) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Soft glow */}
      <div className="absolute -bottom-40 left-1/4 h-[400px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute -top-32 right-1/3 h-[300px] w-[400px] rounded-full bg-secondary/10 blur-[100px]" />
    </div>
  );
}