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
    <div className="space-y-6 py-16">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display-title text-4xl font-semibold text-foreground">{title}</h1>
      <p className="max-w-2xl text-base leading-7 text-muted">{description}</p>
      <button type="button" onClick={reset} className={buttonVariants({ variant: "primary" })}>
        {actionLabel}
      </button>
    </div>
  );
}
