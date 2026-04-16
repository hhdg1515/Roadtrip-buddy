import Link from "next/link";
import { ActivityChip, inferActivityKind } from "@/components/ui/activity-chip";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FitScoreBadge } from "@/components/ui/fit-score-badge";
import { RiskBadge } from "@/components/ui/risk-badge";
import type { Destination, Origin } from "@/lib/data/openseason";
import {
  formatUpdatedAt,
  formatWeatherMetrics,
  getAlertTone,
  getPrimaryAlert,
} from "@/lib/live-conditions";

export function DestinationCard({
  destination,
  origin,
}: Readonly<{
  destination: Destination;
  origin: Origin;
}>) {
  const weatherMetrics = formatWeatherMetrics(destination.liveWeather).slice(0, 3);
  const primaryAlert = getPrimaryAlert(destination.activeAlerts);

  return (
    <Card className="h-full">
      <CardHeader className="space-y-5">
        <div
          className="rounded-[24px] border border-white/30 p-5 text-white"
          style={{
            backgroundImage: `linear-gradient(135deg, ${destination.palette[0]}, ${destination.palette[1]} 52%, ${destination.palette[2]})`,
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/78">
                {destination.region}
              </p>
              <h3 className="display-title text-3xl font-semibold">
                {destination.name}
              </h3>
              <p className="max-w-sm text-sm leading-6 text-white/82">
                {destination.summary}
              </p>
            </div>
            <div className="score-ring flex h-20 w-20 flex-col items-center justify-center rounded-full border border-white/25 text-center text-[#13313a]">
              <span className="text-2xl font-bold">{destination.fitScore}</span>
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
                fit
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <FitScoreBadge score={destination.fitScore} />
          <ActivityChip
            label={destination.bestActivity}
            kind={inferActivityKind(destination.bestActivity)}
          />
          <Badge tone="warm">
            {destination.driveHours[origin]}h from {originLabel(origin)}
          </Badge>
          {destination.riskBadges.slice(0, 2).map((risk) => (
            <RiskBadge key={risk} label={risk} />
          ))}
        </div>
      </CardHeader>

      <CardBody className="flex h-full flex-col gap-5">
        <div className="space-y-3">
          {weatherMetrics.length > 0 || primaryAlert ? (
            <div className="space-y-3 rounded-[22px] border border-white/40 bg-muted-soft/65 p-4">
              <p className="eyebrow">Live conditions</p>
              {weatherMetrics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {weatherMetrics.map((metric) => (
                    <Badge key={metric} tone="soft">
                      {metric}
                    </Badge>
                  ))}
                </div>
              ) : null}
              {primaryAlert ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={getAlertTone(primaryAlert.severity)}>{primaryAlert.severity}</Badge>
                  <p className="text-sm leading-6 text-foreground">{primaryAlert.title}</p>
                </div>
              ) : (
                <p className="text-sm leading-6 text-muted">No active tracked alerts right now.</p>
              )}
              {destination.updatedAt ? (
                <p className="text-xs text-muted">
                  Refreshed {formatUpdatedAt(destination.updatedAt)}
                </p>
              ) : null}
            </div>
          ) : null}

          <div>
            <p className="eyebrow">Why now</p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {destination.whyNow}
            </p>
          </div>
          <div>
            <p className="eyebrow">Watch out</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {destination.mainWarning}
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap gap-3">
          <Link
            href={`/destinations/${destination.slug}`}
            className={buttonVariants({ variant: "primary" })}
          >
            View detail
          </Link>
          <Link
            href={`/plans/${destination.slug}`}
            className={buttonVariants({ variant: "secondary" })}
          >
            View plan
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

function originLabel(origin: Origin) {
  switch (origin) {
    case "bay-area":
      return "Bay Area";
    case "los-angeles":
      return "Los Angeles";
    case "san-diego":
      return "San Diego";
    case "sacramento":
      return "Sacramento";
    default:
      return origin;
  }
}
