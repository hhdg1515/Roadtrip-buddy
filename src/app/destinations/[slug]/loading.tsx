import { RouteLoading } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <RouteLoading
      eyebrow="Loading destination"
      title="Pulling the current destination verdict"
      description="This detail route is still resolving live conditions, scoring evidence, and fallback guidance."
    />
  );
}
