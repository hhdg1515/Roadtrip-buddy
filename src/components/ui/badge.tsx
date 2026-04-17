import { cn } from "@/lib/utils";

type BadgeTone = "default" | "warm" | "danger" | "soft";

const toneClasses: Record<BadgeTone, string> = {
  default: "border-ocean/30 text-ocean",
  warm: "border-sun/40 text-sun",
  danger: "border-danger/35 text-danger",
  soft: "border-line text-muted",
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
        "inline-flex items-center rounded-md border bg-transparent px-2 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
