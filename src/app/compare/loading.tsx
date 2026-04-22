import { RouteLoading } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <RouteLoading
      eyebrow="Loading shortlist"
      title="Reviewing the saved options"
      description="The shortlist cards are still resolving live conditions, fit scoring, and final tradeoffs."
    />
  );
}
