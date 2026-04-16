import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: Readonly<React.InputHTMLAttributes<HTMLInputElement>>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-[18px] border border-line bg-white/85 px-4 text-sm text-foreground outline-none transition focus:border-ocean/35 focus:ring-2 focus:ring-ocean/18",
        className,
      )}
      {...props}
    />
  );
}
