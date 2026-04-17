import { RouteLoading } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <RouteLoading
      eyebrow="Loading saved plans"
      title="Pulling your saved trips"
      description="This route is still resolving account state, saved plans, and live condition overlays."
      panelCount={2}
    />
  );
}
