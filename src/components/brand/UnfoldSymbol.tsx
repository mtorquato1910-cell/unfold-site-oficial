import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  size?: number;
}

/**
 * Unfold Growth brand symbol — rounded shape with diamond cutout.
 */
export function UnfoldSymbol({ className, size = 28 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="unfold-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(158 92% 70%)" />
          <stop offset="60%" stopColor="hsl(218 94% 78%)" />
          <stop offset="100%" stopColor="hsl(250 64% 55%)" />
        </linearGradient>
      </defs>
      <path
        d="M20 2 C30 2 38 10 38 20 C38 30 30 38 20 38 C10 38 2 30 2 20 C2 10 10 2 20 2 Z M20 12 L12 20 L20 28 L28 20 Z"
        fill="url(#unfold-grad)"
        fillRule="evenodd"
      />
    </svg>
  );
}

export function UnfoldLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <UnfoldSymbol size={26} />
      <span className="font-sans text-lg font-bold tracking-tight">UNFOLD</span>
    </div>
  );
}