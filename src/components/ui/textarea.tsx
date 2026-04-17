import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: Readonly<React.TextareaHTMLAttributes<HTMLTextAreaElement>>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-ocean/50 focus:ring-2 focus:ring-ocean/20",
        className,
      )}
      {...props}
    />
  );
}
