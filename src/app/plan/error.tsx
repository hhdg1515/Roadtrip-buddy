"use client";

import { RouteErrorState } from "@/components/ui/route-error";

export default function PlanError({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <RouteErrorState
      reset={reset}
      eyebrow="Shortlist failed"
      title="The planning shortlist did not finish loading."
      description="Try again. If the shortlist keeps failing, the planning route should surface a real app error."
    />
  );
}
