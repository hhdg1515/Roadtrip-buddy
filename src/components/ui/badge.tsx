import { cn } from "@/lib/utils";

type BadgeTone = "default" | "warm" | "danger" | "soft";

const toneClasses: Record<BadgeTone, string> = {
  default: "bg-ocean/10 text-ocean",
  warm: "bg-sun/12 text-sun",
  danger: "bg-danger/10 text-danger",
  soft: "bg-muted-soft text-muted",
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
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.14em] uppercase",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
