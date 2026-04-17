import { RouteLoading } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <RouteLoading
      eyebrow="Loading profile"
      title="Pulling your account state"
      description="This route is still resolving auth state, profile defaults, and saved preference values."
      panelCount={2}
    />
  );
}
