import Link from "next/link";
import { DestinationHeroImage } from "@/components/destinations/destination-hero-image";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FitScoreBadge } from "@/components/ui/fit-score-badge";
import { RiskBadge } from "@/components/ui/risk-badge";
import type { Destination, Origin } from "@/lib/data/openseason";
import { getDestinationDecisionStatus } from "@/lib/decision-layer";
import {
  formatUpdatedAt,
  formatWeatherMetrics,
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
  const decision = getDestinationDecisionStatus(destination);
  const topRisk = destination.riskBadges[0];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-3">
        <DestinationHeroImage
          slug={destination.slug}
          name={destination.name}
          region={destination.region}
          summary={destination.summary}
        />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="text-xs text-muted">{destination.region}</p>
            <h3 className="display-title text-2xl font-semibold leading-tight">
              {destination.name}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-3xl font-semibold tabular-nums">{destination.fitScore}</p>
            <FitScoreBadge score={destination.fitScore} showScore={false} size="sm" className="mt-1" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span>{destination.driveHours[origin]}h from {originLabel(origin)}</span>
          <span>·</span>
          <span>{destination.bestActivity}</span>
          {topRisk ? (
            <>
              <span>·</span>
              <RiskBadge label={topRisk} />
            </>
          ) : null}
        </div>
      </CardHeader>

      <CardBody className="flex flex-1 flex-col gap-4">
        {weatherMetrics.length > 0 || primaryAlert ? (
          <div className="space-y-1.5 border-t border-line pt-3 text-sm text-muted">
            {weatherMetrics.length > 0 ? (
              <p className="text-foreground">{weatherMetrics.join(" · ")}</p>
            ) : null}
            {primaryAlert ? (
              <p className="text-danger">⚠ {primaryAlert.title}</p>
            ) : null}
            {destination.updatedAt ? (
              <p className="text-xs">Updated {formatUpdatedAt(destination.updatedAt)}</p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2.5 text-sm leading-6">
          <p className="text-foreground">
            <span className="text-xs uppercase tracking-wider text-muted">Why now · </span>
            {destination.whyNow}
          </p>
          <p className="text-muted">
            <span className="text-xs uppercase tracking-wider">Watch out · </span>
            {destination.mainWarning}
          </p>
        </div>

        {decision.level !== "inform" ? (
          <p
            className={
              decision.level === "block"
                ? "text-sm text-danger"
                : "text-sm text-sun"
            }
          >
            {decision.headline}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Link
            href={`/destinations/${destination.slug}`}
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            View detail
          </Link>
          <Link
            href={`/plans/${destination.slug}`}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
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
