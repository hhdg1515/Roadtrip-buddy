import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getUserPreferences } from "@/lib/account";
import { getAllDestinations } from "@/lib/data/repository";
import { formatWeatherMetrics, getPrimaryAlert } from "@/lib/live-conditions";
import { getPlanningState, labelOrigin, toPlanningQueryString } from "@/lib/planning";

export default async function ExplorePage() {
  const { preferences } = await getUserPreferences();
  const planningState = getPlanningState({}, preferences);
  const queryString = toPlanningQueryString(planningState);
  const destinations = await getAllDestinations();

  return (
    <div className="space-y-12 py-10">
      <SectionHeading
        eyebrow="Explore"
        title="Browse the current California shortlist"
        description="The full map can come later. For MVP, this page keeps exploration lightweight and grounded in decision-quality summaries."
      />

      <div className="flex flex-wrap gap-2">
        {["Sierra Nevada", "Central Coast", "Eastern Sierra", "Desert", "Mixed group"].map(
          (filter) => (
            <Badge key={filter} tone="soft">
              {filter}
            </Badge>
          ),
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {destinations.map((destination) => {
          const weatherMetrics = formatWeatherMetrics(destination.liveWeather).slice(0, 2);
          const primaryAlert = getPrimaryAlert(destination.activeAlerts);

          return (
            <Card key={destination.slug}>
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">{destination.region}</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                      {destination.name}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{destination.fitScore}</p>
                    <p className="text-sm text-muted">{destination.fitLabel}</p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-muted">{destination.summary}</p>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {destination.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
                {weatherMetrics.length > 0 || primaryAlert ? (
                  <div className="space-y-3 rounded-[22px] bg-muted-soft px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {weatherMetrics.map((metric) => (
                        <Badge key={metric} tone="soft">
                          {metric}
                        </Badge>
                      ))}
                      {destination.activeAlerts?.length ? (
                        <Badge tone="danger">
                          {destination.activeAlerts.length} active alert
                          {destination.activeAlerts.length > 1 ? "s" : ""}
                        </Badge>
                      ) : null}
                    </div>
                    {primaryAlert ? (
                      <p className="text-sm leading-6 text-foreground">{primaryAlert.title}</p>
                    ) : null}
                  </div>
                ) : null}
                <p className="text-sm text-foreground">
                  {destination.driveHours[planningState.origin]}h from {labelOrigin(planningState.origin)}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/destinations/${destination.slug}`}
                    className={buttonVariants({ variant: "primary" })}
                  >
                    Detail
                  </Link>
                  <Link
                    href={`/plans/${destination.slug}?${queryString}`}
                    className={buttonVariants({ variant: "secondary" })}
                  >
                    Plan
                  </Link>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
