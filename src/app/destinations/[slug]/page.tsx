import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { planningPreset } from "@/lib/data/openseason";
import { getDestinationBySlugFromRepository } from "@/lib/data/repository";
import {
  formatAlertDate,
  formatUpdatedAt,
  formatWeatherMetrics,
  getAlertTone,
} from "@/lib/live-conditions";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DestinationPage({ params }: PageProps) {
  const { slug } = await params;
  const destination = await getDestinationBySlugFromRepository(slug);

  if (!destination) {
    notFound();
  }

  const scoreRows = [
    ["Seasonality", destination.breakdown.seasonality],
    ["Weather", destination.breakdown.weather],
    ["Activity match", destination.breakdown.activityMatch],
    ["Drive time", destination.breakdown.driveTime],
    ["Alerts", destination.breakdown.alerts],
    ["Group fit", destination.breakdown.groupFit],
    ["Lodging", destination.breakdown.lodging],
    ["Plan B", destination.breakdown.planB],
  ];
  const weatherMetrics = formatWeatherMetrics(destination.liveWeather);
  const activeAlerts = destination.activeAlerts ?? [];

  return (
    <div className="space-y-12 py-10">
      <section
        className="rounded-[34px] border border-white/20 p-6 text-white sm:p-8"
        style={{
          backgroundImage: `linear-gradient(135deg, ${destination.palette[0]}, ${destination.palette[1]} 52%, ${destination.palette[2]})`,
        }}
      >
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <p className="eyebrow text-white/68">{destination.region}</p>
            <h1 className="display-title text-5xl font-semibold leading-[0.95] sm:text-6xl">
              {destination.name}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/84">
              {destination.currentVerdict}
            </p>
            <div className="flex flex-wrap gap-2">
              {destination.collections.map((item) => (
                <Badge key={item} className="bg-white/15 text-white">
                  {item}
                </Badge>
              ))}
              <Badge className="bg-white/15 text-white">
                {destination.driveHours[planningPreset.origin]}h from Bay Area
              </Badge>
            </div>
          </div>

          <Card className="border-white/10 bg-white/10 text-white shadow-none">
            <CardHeader>
              <p className="eyebrow text-white/65">Current fit summary</p>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-3xl font-semibold">{destination.bestActivity}</h2>
                <div className="text-right">
                  <p className="text-4xl font-bold">{destination.fitScore}</p>
                  <p className="text-sm text-white/75">{destination.fitLabel}</p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-4 text-sm text-white/82">
              <p>{destination.whyNow}</p>
              <p>
                <span className="font-semibold">Seasonal window:</span>{" "}
                {destination.seasonalWindow}
              </p>
              {destination.updatedAt ? (
                <p>
                  <span className="font-semibold">Last refreshed:</span>{" "}
                  {formatUpdatedAt(destination.updatedAt)}
                </p>
              ) : null}
              <p>
                <span className="font-semibold">Main risk:</span> {destination.mainWarning}
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <p className="eyebrow">Explainable scoring</p>
            <h2 className="display-title text-3xl font-semibold">Why this destination lands here</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {scoreRows.map(([label, score]) => (
              <div key={label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-semibold">{score}</span>
                </div>
                <div className="h-2 rounded-full bg-muted-soft">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(90deg,#255d6c,#c56d2a)]"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="eyebrow">Best right now</p>
            <h2 className="display-title text-3xl font-semibold">Top activities in the current window</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {destination.activities.map((activity) => (
              <div
                key={activity.name}
                className="rounded-[24px] border border-white/40 bg-white/55 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold">{activity.name}</h3>
                  <Badge tone="soft">{activity.difficulty}</Badge>
                </div>
                <p className="mt-3 text-sm text-muted">
                  Best time: {activity.bestTime}
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {activity.whyItFits}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <p className="eyebrow">Live weather</p>
            <h2 className="display-title text-3xl font-semibold">Current destination snapshot</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {destination.liveWeather ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {weatherMetrics.map((metric) => (
                    <Badge key={metric} tone="soft">
                      {metric}
                    </Badge>
                  ))}
                </div>
                <div className="grid gap-3 text-sm leading-6 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold">Snapshot date:</span>{" "}
                    {destination.liveWeather.snapshotDate}
                  </p>
                  <p>
                    <span className="font-semibold">Heat risk:</span>{" "}
                    {destination.liveWeather.heatRisk ?? 0} / 100
                  </p>
                  <p>
                    <span className="font-semibold">Snow risk:</span>{" "}
                    {destination.liveWeather.snowRisk ?? 0} / 100
                  </p>
                  <p>
                    <span className="font-semibold">Wind max:</span>{" "}
                    {destination.liveWeather.windSpeed ?? 0} mph
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm leading-6 text-muted">
                Live weather has not been ingested for this destination yet. The seeded guidance
                is still available, but this page will become more reliable after the next sync.
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="eyebrow">Tracked alerts</p>
            <h2 className="display-title text-3xl font-semibold">What is active right now</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {activeAlerts.length > 0 ? (
              activeAlerts.map((alert) => (
                <div
                  key={`${alert.source}-${alert.title}-${alert.effectiveDate ?? "now"}`}
                  className="rounded-[24px] border border-white/40 bg-white/55 p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={getAlertTone(alert.severity)}>{alert.severity}</Badge>
                    <Badge tone="soft">{alert.source.toUpperCase()}</Badge>
                    <Badge>{alert.alertType}</Badge>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold">{alert.title}</h3>
                  {alert.description ? (
                    <p className="mt-2 text-sm leading-6 text-muted">{alert.description}</p>
                  ) : null}
                  <div className="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-2">
                    <p>
                      <span className="font-semibold text-foreground">Effective:</span>{" "}
                      {formatAlertDate(alert.effectiveDate) ?? "Current"}
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">Expires:</span>{" "}
                      {formatAlertDate(alert.expirationDate) ?? "Not specified"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] bg-muted-soft px-5 py-5 text-sm leading-6 text-muted">
                No active NWS or park alerts are currently being tracked for this destination.
              </div>
            )}
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <p className="eyebrow">What to avoid</p>
          </CardHeader>
          <CardBody className="space-y-3">
            {destination.avoid.map((item) => (
              <div key={item} className="rounded-[20px] bg-danger/6 px-4 py-4 text-sm leading-6">
                {item}
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="eyebrow">Suggested stops</p>
          </CardHeader>
          <CardBody className="space-y-3">
            {destination.suggestedStops.map((stop) => (
              <div key={stop} className="rounded-[20px] bg-muted-soft px-4 py-4 text-sm">
                {stop}
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="eyebrow">Food / town support</p>
            <h2 className="text-2xl font-semibold">{destination.foodSupport.nearbyTown}</h2>
          </CardHeader>
          <CardBody className="space-y-4 text-sm leading-6">
            <p>{destination.foodSupport.note}</p>
            <div>
              <p className="font-semibold">Cafes</p>
              <p>{destination.foodSupport.cafes.join(" · ")}</p>
            </div>
            <div>
              <p className="font-semibold">Dinner</p>
              <p>{destination.foodSupport.dinner.join(" · ")}</p>
            </div>
            <div>
              <p className="font-semibold">Low-effort hangouts</p>
              <p>{destination.foodSupport.hangouts.join(" · ")}</p>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <p className="eyebrow">Lodging guidance</p>
            <h2 className="display-title text-3xl font-semibold">
              Base town, not hotel promises
            </h2>
          </CardHeader>
          <CardBody className="space-y-4 text-sm leading-6">
            <p>
              <span className="font-semibold">Best base:</span> {destination.lodging.bestBase}
            </p>
            <p>
              <span className="font-semibold">Best for:</span> {destination.lodging.bestFor}
            </p>
            <p>
              <span className="font-semibold">Alternative:</span>{" "}
              {destination.lodging.alternative}
            </p>
            <p>
              <span className="font-semibold">Tradeoff:</span> {destination.lodging.tradeoff}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="eyebrow">Plan B</p>
            <h2 className="display-title text-3xl font-semibold">
              Every destination needs a fallback
            </h2>
          </CardHeader>
          <CardBody className="space-y-4 text-sm leading-6">
            <p>
              <span className="font-semibold">Trigger:</span> {destination.planB.trigger}
            </p>
            <p>
              <span className="font-semibold">Alternative:</span>{" "}
              {destination.planB.alternative}
            </p>
            <p>
              <span className="font-semibold">Why it still works:</span>{" "}
              {destination.planB.whyItWorks}
            </p>
            <p>
              <span className="font-semibold">Time difference:</span>{" "}
              {destination.planB.timeDifference}
            </p>
            <div className="pt-2">
              <Link
                href={`/plans/${destination.slug}`}
                className={buttonVariants({ variant: "primary" })}
              >
                Generate this trip plan
              </Link>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
