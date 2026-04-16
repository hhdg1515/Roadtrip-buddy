import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "surface";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[linear-gradient(135deg,#18323a,#255d6c_58%,#c56d2a)] text-white shadow-[0_18px_45px_rgba(24,50,58,0.18)] hover:brightness-105",
  secondary:
    "border border-line bg-card-strong text-foreground hover:bg-white/90",
  ghost: "text-foreground hover:bg-muted-soft",
  surface:
    "border border-white/15 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-white/18",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 rounded-full px-3 text-sm",
  md: "h-11 rounded-full px-5 text-sm sm:text-base",
  lg: "h-12 rounded-full px-6 text-base",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/35",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}
