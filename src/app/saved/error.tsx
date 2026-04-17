"use client";

import { RouteErrorState } from "@/components/ui/route-error";

export default function SavedError({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <RouteErrorState
      reset={reset}
      eyebrow="Saved trips failed"
      title="Your saved trips did not finish loading."
      description="Try again. If this route keeps failing, the saved-plans screen should surface a real app error."
    />
  );
}
