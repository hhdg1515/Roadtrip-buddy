"use client";

import { RouteErrorState } from "@/components/ui/route-error";

export default function ProfileError({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <RouteErrorState
      reset={reset}
      eyebrow="Profile failed"
      title="The profile screen did not finish loading."
      description="Try again. If this route keeps failing, the account screen should surface a real app error."
    />
  );
}
