"use client";

import { RouteErrorState } from "@/components/ui/route-error";

export default function SplitGroupError({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <RouteErrorState
      reset={reset}
      eyebrow="Split plan failed"
      title="The split-group plan did not finish loading."
      description="Try again. If the mixed-group route keeps failing, it should surface a real app error."
    />
  );
}
