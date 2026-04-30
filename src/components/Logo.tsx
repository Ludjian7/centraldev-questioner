import logoUrl from "@/assets/centraldev-logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: number;
}

export function Logo({ className, showWordmark = true, size = 36 }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src={logoUrl}
        alt="Centraldev Studio"
        width={size}
        height={size}
        className="h-9 w-9 object-contain"
        style={{ height: size, width: size }}
        loading="eager"
        decoding="async"
      />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-sm font-semibold tracking-tight">
            Centraldev <span className="text-muted-foreground font-normal">Studio</span>
          </span>
          <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Business System Analyzer
          </span>
        </div>
      )}
    </div>
  );
}
