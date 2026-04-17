"use client";

import { RouteErrorState } from "@/components/ui/route-error";

export default function DestinationError({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <RouteErrorState
      reset={reset}
      eyebrow="Destination failed"
      title="This destination detail page did not finish loading."
      description="Try again. If this keeps repeating, the destination route should be treated as a real app error."
    />
  );
}
