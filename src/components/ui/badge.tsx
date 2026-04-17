import { cn } from "@/lib/utils";

type BadgeTone = "default" | "warm" | "danger" | "soft";

const toneClasses: Record<BadgeTone, string> = {
  default: "text-ocean",
  warm: "text-sun",
  danger: "text-danger",
  soft: "text-muted",
};

export function Badge({
  children,
  tone = "default",
  className,
}: Readonly<{
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
