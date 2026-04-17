import { RouteLoading } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <RouteLoading
      eyebrow="Loading shortlist"
      title="Recomputing the ranked shortlist"
      description="This page is still applying your trip brief to the current fit model and live conditions."
    />
  );
}
