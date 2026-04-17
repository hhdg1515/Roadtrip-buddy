"use client";

import { buttonVariants } from "@/components/ui/button";

type RouteErrorStateProps = Readonly<{
  reset: () => void;
  eyebrow?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
}>;

export function RouteErrorState({
  reset,
  eyebrow = "Something broke",
  title = "This screen did not finish loading.",
  description = "Try the request again. If the problem keeps repeating, the failing route should be treated as a real app error rather than silently falling back.",
  actionLabel = "Try again",
}: RouteErrorStateProps) {
  return (
    <div className="space-y-4 py-12">
      <p className="text-xs text-muted">{eyebrow}</p>
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="max-w-2xl text-sm leading-6 text-muted">{description}</p>
      <button type="button" onClick={reset} className={buttonVariants({ variant: "primary", size: "sm" })}>
        {actionLabel}
      </button>
    </div>
  );
}
