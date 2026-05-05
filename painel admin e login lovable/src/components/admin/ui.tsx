import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export function PageHeader({
  title, description, eyebrow, actions,
}: { title: string; description?: string; eyebrow?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80 mb-2">{eyebrow}</p>}
        <h2 className="font-display text-[32px] font-semibold tracking-[-0.024em] leading-[1.1]">{title}</h2>
        {description && <p className="mt-2 text-[14px] text-dim-2 max-w-2xl leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function GlassCard({ className, children, ...rest }: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass rounded-2xl p-6", className)} {...rest}>{children}</div>;
}

export function StatCard({
  label, value, hint, accent = "mint", trend,
}: { label: string; value: string | number; hint?: string; accent?: "mint" | "blue"; trend?: string }) {
  return (
    <div className="glass glass-hover rounded-2xl p-5 group cursor-default">
      <div className="flex items-start justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-dim">{label}</div>
        {trend && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] text-primary">
            <ArrowUpRight className="h-2.5 w-2.5" />{trend}
          </span>
        )}
      </div>
      <div className={cn(
        "mt-4 font-display text-[34px] font-semibold tracking-[-0.03em] leading-none",
        accent === "mint" ? "text-foreground" : "text-foreground"
      )}>
        {value}
      </div>
      {hint && <div className="mt-2 text-[11px] text-dim-2">{hint}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { c: string; dot: string }> = {
    published: { c: "bg-primary/12 text-primary border-primary/25", dot: "bg-primary" },
    active: { c: "bg-primary/12 text-primary border-primary/25", dot: "bg-primary" },
    draft: { c: "bg-white/[0.04] text-dim-2 border-white/10", dot: "bg-dim-2" },
    new: { c: "bg-accent-blue/12 text-accent-blue border-accent-blue/25", dot: "bg-accent-blue" },
    contacted: { c: "bg-primary/12 text-primary border-primary/25", dot: "bg-primary" },
    qualified: { c: "bg-amber-300/10 text-amber-200 border-amber-300/25", dot: "bg-amber-300" },
    converted: { c: "bg-primary/12 text-primary border-primary/25", dot: "bg-primary" },
    pending: { c: "bg-white/[0.04] text-dim-2 border-white/10", dot: "bg-dim-2" },
    inactive: { c: "bg-white/[0.04] text-dim-2 border-white/10", dot: "bg-dim-2" },
  };
  const s = map[status] ?? map.draft;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider", s.c)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_6px_currentColor]", s.dot)} />
      {status}
    </span>
  );
}

export function EmptyState({ title, description, icon: Icon, action }: { title: string; description?: string; icon?: any; action?: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl text-center py-20 px-6 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      {Icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
        </div>
      )}
      <div className="font-display text-[18px] font-medium tracking-tight">{title}</div>
      {description && <p className="mt-2 text-[13px] text-dim-2 max-w-sm mx-auto leading-relaxed">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim-2">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-dim">{hint}</p>}
    </div>
  );
}

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-dim">{label}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}
