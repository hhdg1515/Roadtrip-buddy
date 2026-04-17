import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: Readonly<React.InputHTMLAttributes<HTMLInputElement>>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-line bg-background px-3 text-sm text-foreground outline-none transition focus:border-ocean/50 focus:ring-2 focus:ring-ocean/20",
        className,
      )}
      {...props}
    />
  );
}
