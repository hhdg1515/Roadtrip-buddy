"use client";

import { RouteErrorState } from "@/components/ui/route-error";

export default function SelectedPlanError({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <RouteErrorState
      reset={reset}
      eyebrow="Plan failed"
      title="The selected trip plan did not finish loading."
      description="Try again. If this route keeps failing, the selected-plan page should surface a real app error."
    />
  );
}
