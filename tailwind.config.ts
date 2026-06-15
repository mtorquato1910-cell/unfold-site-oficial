import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--surface-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        // S1.2: Space Grotesk = display tech (substituto Relicus, via next/font var)
        display: ["var(--font-display)", "Space Grotesk", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono-label)", "IBM Plex Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out both",
        "scale-in": "scale-in 0.4s ease-out both",
      },
      // ── Typography (@tailwindcss/typography) ──────────────────────────────
      // Tema do conteúdo de artigos (blog, cases, preview do painel).
      // O HTML vem do editor rico; aqui damos legibilidade: espaçamento entre
      // parágrafos, hierarquia clara de títulos e tabelas com bordas completas.
      // A página usa `prose prose-invert prose-lg` (fundo dark da marca).
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            // Cores da marca no modo dark (prose-invert). Precisam ficar na base
            // `.prose` para que `.prose-invert` as remapeie corretamente.
            "--tw-prose-invert-body": "hsl(0 0% 91% / 0.82)",
            "--tw-prose-invert-headings": "hsl(0 0% 100%)",
            "--tw-prose-invert-links": "hsl(158 92% 70%)",
            "--tw-prose-invert-bold": "hsl(0 0% 100%)",
            "--tw-prose-invert-counters": "hsl(200 15% 65%)",
            "--tw-prose-invert-bullets": "hsl(158 92% 70% / 0.6)",
            "--tw-prose-invert-hr": "hsl(197 45% 20%)",
            "--tw-prose-invert-quotes": "hsl(0 0% 91%)",
            "--tw-prose-invert-quote-borders": "hsl(158 92% 70%)",
            "--tw-prose-invert-captions": "hsl(200 15% 60%)",
            "--tw-prose-invert-code": "hsl(158 92% 70%)",
            "--tw-prose-invert-pre-code": "hsl(0 0% 91%)",
            "--tw-prose-invert-pre-bg": "hsl(195 75% 11%)",
            "--tw-prose-invert-th-borders": "hsl(197 45% 34%)",
            "--tw-prose-invert-td-borders": "hsl(197 45% 24%)",
            // Offset para as âncoras do índice não ficarem sob o header fixo.
            "h1, h2, h3, h4": {
              scrollMarginTop: "7rem",
              fontFamily: "var(--font-display), Space Grotesk, system-ui, sans-serif",
              letterSpacing: "-0.02em",
              fontWeight: "700",
            },
            h2: { marginTop: "2.5em", marginBottom: "0.9em", lineHeight: "1.2" },
            h3: { marginTop: "2em", marginBottom: "0.7em", lineHeight: "1.25" },
            h4: { marginTop: "1.6em", marginBottom: "0.6em" },
            p: { marginTop: "1.25em", marginBottom: "1.25em", lineHeight: "1.8" },
            "ul, ol": { marginTop: "1.25em", marginBottom: "1.25em" },
            li: { marginTop: "0.5em", marginBottom: "0.5em" },
            a: { fontWeight: "500", textDecoration: "underline", textUnderlineOffset: "3px" },
            blockquote: {
              fontStyle: "normal",
              borderLeftWidth: "3px",
              paddingLeft: "1.25em",
            },
            img: { borderRadius: "0.75rem" },
            figure: { marginTop: "2em", marginBottom: "2em" },
            figcaption: { textAlign: "center", fontSize: "0.875em", marginTop: "0.75em" },
            // ── Tabelas com bordas completas (corrige "tabelas sem bordas") ──
            table: {
              width: "100%",
              marginTop: "2em",
              marginBottom: "2em",
              borderCollapse: "collapse",
              fontSize: "0.95em",
              overflow: "hidden",
              borderRadius: "0.5rem",
              borderWidth: "1px",
              borderColor: "var(--tw-prose-td-borders)",
            },
            "thead th": {
              borderWidth: "1px",
              borderColor: "var(--tw-prose-th-borders)",
              backgroundColor: "var(--tw-prose-pre-bg)",
              padding: "0.7em 0.9em",
              fontWeight: "700",
              verticalAlign: "middle",
            },
            "tbody td, tfoot td": {
              borderWidth: "1px",
              borderColor: "var(--tw-prose-td-borders)",
              padding: "0.7em 0.9em",
              verticalAlign: "top",
            },
            "thead th:first-child": { paddingLeft: "0.9em" },
            "thead th:last-child": { paddingRight: "0.9em" },
            "tbody td:first-child": { paddingLeft: "0.9em" },
            "tbody td:last-child": { paddingRight: "0.9em" },
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), typography],
} satisfies Config;
