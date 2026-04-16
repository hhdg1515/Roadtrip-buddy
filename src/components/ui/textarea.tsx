import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: Readonly<React.TextareaHTMLAttributes<HTMLTextAreaElement>>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-[18px] border border-line bg-white/85 px-4 py-3 text-sm text-foreground outline-none transition focus:border-ocean/35 focus:ring-2 focus:ring-ocean/18",
        className,
      )}
      {...props}
    />
  );
}
