'use client'

import { ArrowUpRight } from 'lucide-react'

function cx(...args: (string | false | null | undefined)[]) {
  return args.filter(Boolean).join(' ')
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string
  description?: string
  eyebrow?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] mb-2 text-mint-soft">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-[32px] font-semibold leading-[1.1] text-fg">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-[14px] max-w-2xl leading-relaxed text-dim-2">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function GlassCard({
  className,
  children,
  ...rest
}: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx('glass rounded-2xl p-6', className)} {...rest}>
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
  trend,
}: {
  label: string
  value: string | number
  hint?: string
  trend?: string
}) {
  return (
    <div className="glass glass-hover rounded-2xl p-5 cursor-default">
      <div className="flex items-start justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-dim">{label}</div>
        {trend && (
          <span
            className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[9px]"
            style={{ background: 'hsl(158 92% 70% / 0.10)', color: 'hsl(158 92% 70%)' }}
          >
            <ArrowUpRight className="h-2.5 w-2.5" />
            {trend}
          </span>
        )}
      </div>
      <div
        className="mt-4 font-display text-[34px] font-semibold leading-none text-fg"
        style={{ letterSpacing: '-0.03em' }}
      >
        {value}
      </div>
      {hint && <div className="mt-2 text-[11px] text-dim-2">{hint}</div>}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const conf: Record<string, { bg: string; color: string; border: string; dot: string }> = {
    published:  { bg: 'hsl(158 92% 70% / 0.12)', color: 'hsl(158 92% 70%)', border: 'hsl(158 92% 70% / 0.25)', dot: 'hsl(158 92% 70%)' },
    active:     { bg: 'hsl(158 92% 70% / 0.12)', color: 'hsl(158 92% 70%)', border: 'hsl(158 92% 70% / 0.25)', dot: 'hsl(158 92% 70%)' },
    contacted:  { bg: 'hsl(158 92% 70% / 0.12)', color: 'hsl(158 92% 70%)', border: 'hsl(158 92% 70% / 0.25)', dot: 'hsl(158 92% 70%)' },
    converted:  { bg: 'hsl(158 92% 70% / 0.12)', color: 'hsl(158 92% 70%)', border: 'hsl(158 92% 70% / 0.25)', dot: 'hsl(158 92% 70%)' },
    new:        { bg: 'hsl(217 93% 78% / 0.12)', color: 'hsl(217 93% 78%)', border: 'hsl(217 93% 78% / 0.25)', dot: 'hsl(217 93% 78%)' },
    qualified:  { bg: 'hsl(45 95% 65% / 0.10)',  color: 'hsl(45 95% 80%)',  border: 'hsl(45 95% 65% / 0.25)',  dot: 'hsl(45 95% 65%)' },
    draft:      { bg: 'hsl(0 0% 100% / 0.04)',   color: 'hsl(0 0% 91% / 0.62)', border: 'hsl(0 0% 100% / 0.10)', dot: 'hsl(0 0% 91% / 0.42)' },
    pending:    { bg: 'hsl(0 0% 100% / 0.04)',   color: 'hsl(0 0% 91% / 0.62)', border: 'hsl(0 0% 100% / 0.10)', dot: 'hsl(0 0% 91% / 0.42)' },
    inactive:   { bg: 'hsl(0 0% 100% / 0.04)',   color: 'hsl(0 0% 91% / 0.62)', border: 'hsl(0 0% 100% / 0.10)', dot: 'hsl(0 0% 91% / 0.42)' },
  }
  const s = conf[status] ?? conf.draft
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
      {status}
    </span>
  )
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string
  description?: string
  icon?: React.ElementType
  action?: React.ReactNode
}) {
  return (
    <div className="glass rounded-2xl text-center py-20 px-6 relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, hsl(158 92% 70% / 0.3), transparent)',
        }}
      />
      {Icon && (
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{
            background: 'hsl(158 92% 70% / 0.10)',
            border: '1px solid hsl(158 92% 70% / 0.20)',
          }}
        >
          <Icon className="h-5 w-5 text-mint" strokeWidth={1.75} />
        </div>
      )}
      <div className="font-display text-[18px] font-medium text-fg">{title}</div>
      {description && (
        <p className="mt-2 text-[13px] text-dim-2 max-w-sm mx-auto leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim-2 block">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-dim">{hint}</p>}
    </div>
  )
}

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-dim">{label}</span>
      <div
        className="flex-1 h-px"
        style={{ background: 'linear-gradient(to right, hsl(0 0% 100% / 0.1), transparent)' }}
      />
    </div>
  )
}

export function MintButton({
  children,
  onClick,
  disabled,
  type = 'button',
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'btn-mint inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px]',
        className,
      )}
    >
      {children}
    </button>
  )
}
