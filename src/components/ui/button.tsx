import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "surface";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-white hover:bg-foreground/90 hover:text-white",
  secondary:
    "bg-muted-soft text-foreground hover:bg-muted-soft/60",
  ghost: "text-foreground hover:bg-muted-soft",
  surface:
    "bg-white/10 text-white hover:bg-white/18",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 rounded-md px-3 text-sm",
  md: "h-10 rounded-md px-4 text-sm",
  lg: "h-11 rounded-md px-5 text-base",
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
    "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/35",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}
