import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={cn(
        "glass-panel rounded-[28px] border border-white/45 shadow-[0_20px_80px_rgba(24,50,58,0.08)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return <div className={cn("space-y-3 p-6", className)}>{children}</div>;
}

export function CardBody({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return <div className={cn("px-6 pb-6", className)}>{children}</div>;
}
