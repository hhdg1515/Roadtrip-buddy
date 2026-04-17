"use client";

import { RouteErrorState } from "@/components/ui/route-error";

export default function GlobalError({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return <RouteErrorState reset={reset} />;
}
