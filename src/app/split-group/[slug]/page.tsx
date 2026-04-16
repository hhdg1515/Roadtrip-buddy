import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityChip, inferActivityKind } from "@/components/ui/activity-chip";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FitScoreBadge } from "@/components/ui/fit-score-badge";
import { PlanBCard } from "@/components/ui/plan-b-card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { getUserPreferences } from "@/lib/account";
import { getDestinationBySlugFromRepository } from "@/lib/data/repository";
import type { Destination } from "@/lib/data/openseason";
import {
  getPlanningState,
  labelOrigin,
  labelPlanningDate,
  labelTripLength,
  toPlanningQueryString,
} from "@/lib/planning";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SplitGroupPlanPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const { preferences } = await getUserPreferences();
  const planningState = getPlanningState(resolvedSearchParams, preferences);
  const destination = await getDestinationBySlugFromRepository(slug);

  if (!destination) {
    notFound();
  }

  const driveHours = destination.driveHours[planningState.origin];
  const tracks = buildTracks(destination);
  const queryString = toPlanningQueryString(planningState);

  return (
    <div className="space-y-12 py-10">
      <section
        className="rounded-[34px] border border-white/20 p-6 text-white sm:p-8"
        style={{
          backgroundImage: `linear-gradient(135deg, ${destination.palette[0]}, ${destination.palette[1]} 52%, ${destination.palette[2]})`,
        }}
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="eyebrow text-white/68">Split group plan · {destination.region}</p>
            <h1 className="display-title text-5xl font-semibold leading-[0.95] sm:text-6xl">
              {destination.name}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/84">
              One trip, two tracks. Active members get a real outing, easygoing members get a
              low-effort day, and everyone rejoins for meals and views.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/15 text-white">
                {labelOrigin(planningState.origin)} · {driveHours}h drive
              </Badge>
              <Badge className="bg-white/15 text-white">
                {labelTripLength(planningState.tripLength)}
              </Badge>
              {planningState.startDate ? (
                <Badge className="bg-white/15 text-white">
                  Starts {labelPlanningDate(planningState.startDate)}
                </Badge>
              ) : null}
              <FitScoreBadge score={destination.fitScore} className="bg-white/15" />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/destinations/${destination.slug}?${queryString}`}
                className={buttonVariants({ variant: "surface" })}
              >
                Back to destination
              </Link>
              <Link
                href={`/plans/${destination.slug}?${queryString}`}
                className={buttonVariants({ variant: "surface", className: "bg-white/8" })}
              >
                Full trip plan
              </Link>
            </div>
          </div>

          <Card className="border-white/10 bg-white/10 text-white shadow-none">
            <CardHeader>
              <p className="eyebrow text-white/65">Why this trip splits well</p>
              <h2 className="text-2xl font-semibold">{destination.bestActivity}</h2>
            </CardHeader>
            <CardBody className="space-y-3 text-sm leading-6 text-white/82">
              <p>{destination.whyNow}</p>
              <div className="flex flex-wrap gap-2">
                {destination.riskBadges.slice(0, 3).map((risk) => (
                  <RiskBadge
                    key={risk}
                    label={risk}
                    className="bg-white/12 text-white"
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      <section>
        <Card>
          <CardHeader>
            <p className="eyebrow">Shared base</p>
            <h2 className="display-title text-3xl font-semibold">{tracks.sharedBase.town}</h2>
          </CardHeader>
          <CardBody className="grid gap-5 md:grid-cols-3">
            <InfoBlock label="Town + lodging" value={tracks.sharedBase.lodging} />
            <InfoBlock label="Shared breakfast" value={tracks.sharedBase.breakfast} />
            <InfoBlock label="Shared dinner" value={tracks.sharedBase.dinner} />
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <TrackCard
          title="Active track"
          eyebrow="For the hikers / skiers"
          description="Plan for one real outing, front-loaded when conditions are best."
          tone="active"
          items={tracks.active}
        />
        <TrackCard
          title="Low-effort track"
          eyebrow="For the non-hikers / food-first"
          description="Parallel day built around cafes, easy walks, and town time."
          tone="easy"
          items={tracks.lowEffort}
        />
      </section>

      <section>
        <Card>
          <CardHeader>
            <p className="eyebrow">Rejoin points</p>
            <h2 className="display-title text-3xl font-semibold">
              Where the two tracks come back together
            </h2>
            <p className="text-sm text-muted">
              The win is not separating — it is planning the rejoin so everyone still feels part
              of the trip.
            </p>
          </CardHeader>
          <CardBody className="grid gap-4 md:grid-cols-3">
            {tracks.rejoin.map((point) => (
              <div
                key={point.label}
                className="rounded-[24px] border border-white/40 bg-white/55 p-5"
              >
                <p className="eyebrow">{point.label}</p>
                <p className="mt-2 text-base font-semibold text-foreground">{point.place}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{point.note}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </section>

      <section>
        <PlanBCard plan={destination.planB} />
      </section>
    </div>
  );
}

function InfoBlock({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-[22px] border border-white/40 bg-white/55 p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-sm leading-6 text-foreground">{value}</p>
    </div>
  );
}

type TrackItem = {
  name: string;
  detail: string;
  timing: string;
  difficulty?: string;
  gear?: string;
};

function TrackCard({
  title,
  eyebrow,
  description,
  tone,
  items,
}: Readonly<{
  title: string;
  eyebrow: string;
  description: string;
  tone: "active" | "easy";
  items: TrackItem[];
}>) {
  const accent =
    tone === "active"
      ? "border-pine/30 bg-[linear-gradient(135deg,rgba(51,92,80,0.12),rgba(37,93,108,0.08))]"
      : "border-ocean/20 bg-[linear-gradient(135deg,rgba(37,93,108,0.08),rgba(223,200,160,0.18))]";

  return (
    <Card className={accent}>
      <CardHeader>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="display-title text-3xl font-semibold">{title}</h2>
        <p className="text-sm text-muted">{description}</p>
      </CardHeader>
      <CardBody className="space-y-4">
        {items.map((item) => (
          <div
            key={item.name}
            className="rounded-[22px] border border-white/40 bg-white/55 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ActivityChip label={item.name} kind={inferActivityKind(item.name)} selected />
              <span className="text-xs font-semibold tracking-[0.14em] uppercase text-muted">
                {item.timing}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-foreground">{item.detail}</p>
            {item.difficulty ? (
              <p className="mt-2 text-xs text-muted">
                <span className="font-semibold text-foreground">Difficulty:</span>{" "}
                {item.difficulty}
              </p>
            ) : null}
            {item.gear ? (
              <p className="mt-1 text-xs text-muted">
                <span className="font-semibold text-foreground">Gear:</span> {item.gear}
              </p>
            ) : null}
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

type Tracks = {
  sharedBase: { town: string; lodging: string; breakfast: string; dinner: string };
  active: TrackItem[];
  lowEffort: TrackItem[];
  rejoin: Array<{ label: string; place: string; note: string }>;
};

function buildTracks(destination: Destination): Tracks {
  const activities = destination.activities;
  const activeActivities = activities.filter((activity) =>
    /moderate|strenuous|long|ski|alpine|main/i.test(`${activity.difficulty} ${activity.name}`),
  );
  const easyActivities = activities.filter((activity) =>
    /very easy|easy/i.test(activity.difficulty),
  );

  const activePool = activeActivities.length > 0 ? activeActivities : activities.slice(0, 2);
  const easyPool = easyActivities.length > 0 ? easyActivities : activities.slice(-2);

  return {
    sharedBase: {
      town: destination.foodSupport.nearbyTown,
      lodging: `${destination.lodging.bestBase} · ${destination.lodging.bestFor}`,
      breakfast:
        destination.foodSupport.cafes[0] ??
        "Coffee + bakery before the group splits for the morning.",
      dinner:
        destination.foodSupport.dinner[0] ??
        "Reconvene at dinner in town so the day closes out together.",
    },
    active: activePool.slice(0, 3).map((activity) => ({
      name: activity.name,
      detail: activity.whyItFits,
      timing: activity.bestTime,
      difficulty: activity.difficulty,
      gear: inferGear(destination, activity.name),
    })),
    lowEffort: buildLowEffortItems(destination, easyPool),
    rejoin: buildRejoinPoints(destination),
  };
}

function buildLowEffortItems(
  destination: Destination,
  easyPool: Destination["activities"],
): TrackItem[] {
  const items: TrackItem[] = easyPool.slice(0, 2).map((activity) => ({
    name: activity.name,
    detail: activity.whyItFits,
    timing: activity.bestTime,
    difficulty: activity.difficulty,
  }));

  const hangout = destination.foodSupport.hangouts[0];
  if (hangout) {
    items.push({
      name: hangout,
      detail:
        "Low-effort town block — cafes, browsing, or a scenic viewpoint to kill time comfortably.",
      timing: "Afternoon",
    });
  }

  const stop = destination.suggestedStops.find((entry) =>
    /viewpoint|overlook|pull|scenic|village|harbor|town|beach/i.test(entry),
  );
  if (stop && items.length < 3) {
    items.push({
      name: stop,
      detail: "Drive-in scenic stop that works without any real walking commitment.",
      timing: "Morning or afternoon",
    });
  }

  return items;
}

function buildRejoinPoints(destination: Destination) {
  return [
    {
      label: "Lunch",
      place:
        destination.foodSupport.cafes[1] ??
        destination.foodSupport.cafes[0] ??
        destination.foodSupport.nearbyTown,
      note: "Midday checkpoint — pick a spot both tracks can reach without rushing.",
    },
    {
      label: "Sunset viewpoint",
      place:
        destination.suggestedStops.find((entry) =>
          /viewpoint|overlook|pull|scenic|beach|bluff|ridge|bridge/i.test(entry),
        ) ?? destination.suggestedStops[0] ?? "Scenic overlook near base",
      note: "Reconvene outdoors before dinner — the trip feels complete even on a split day.",
    },
    {
      label: "Dinner",
      place:
        destination.foodSupport.dinner[0] ??
        `${destination.foodSupport.nearbyTown} dinner strip`,
      note: "Close the day out together — this is how a split group still feels like one trip.",
    },
  ];
}

function inferGear(destination: Destination, activityName: string) {
  const text = activityName.toLowerCase();
  if (/ski|snowboard/.test(text)) return "Skis, boots, layers, goggles";
  if (/snowshoe|snow/.test(text)) return "Waterproof layers, traction";
  if (/hike|trail|peak|summit/.test(text)) {
    const hasAlpine = /alpine|high|summit|ridge/.test(text);
    return hasAlpine
      ? "Trail shoes, warm layers, wind shell, plenty of water"
      : "Trail shoes, layers, water";
  }
  if (/coast|beach|bluff/.test(text)) return "Windbreaker, layers";
  return destination.region.toLowerCase().includes("desert")
    ? "Sun protection, extra water"
    : "Layers, water, snacks";
}
