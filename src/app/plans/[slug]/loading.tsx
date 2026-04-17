import { RouteLoading } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <RouteLoading
      eyebrow="Loading trip plan"
      title="Assembling the selected trip plan"
      description="This route is still resolving the ranked option, live conditions, and save state for the selected plan."
    />
  );
}
