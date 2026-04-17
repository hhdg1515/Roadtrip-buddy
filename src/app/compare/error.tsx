"use client";

import { RouteErrorState } from "@/components/ui/route-error";

export default function CompareError({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <RouteErrorState
      reset={reset}
      eyebrow="Comparison failed"
      title="The shortlist comparison did not load."
      description="Try again. If this route keeps failing, the compare deck should be treated as a real app error."
    />
  );
}
