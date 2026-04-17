import { RouteLoading } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <RouteLoading
      eyebrow="Loading split plan"
      title="Building the mixed-group fallback"
      description="This route is still resolving shared base options, active tracks, and rejoin points."
    />
  );
}
