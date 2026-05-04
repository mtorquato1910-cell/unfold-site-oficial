import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  size?: number;
}

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
          <stop offset="0%" stopColor="#6DF9C6" />
          <stop offset="45%" stopColor="#4BB8D5" />
          <stop offset="100%" stopColor="#091C28" />
        </linearGradient>
      </defs>
      <path
        d="M20 2 C30 2 38 10 38 20 C38 30 30 38 20 38 C10 38 2 30 2 20 C2 10 10 2 20 2 Z M20 10 C29 10 30 11 30 20 C30 29 29 30 20 30 C11 30 10 29 10 20 C10 11 11 10 20 10 Z"
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