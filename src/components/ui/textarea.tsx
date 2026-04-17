import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: Readonly<React.TextareaHTMLAttributes<HTMLTextAreaElement>>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md bg-muted-soft px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ocean/30",
        className,
      )}
      {...props}
    />
  );
}
