import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: Readonly<React.InputHTMLAttributes<HTMLInputElement>>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md bg-muted-soft px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ocean/30",
        className,
      )}
      {...props}
    />
  );
}
