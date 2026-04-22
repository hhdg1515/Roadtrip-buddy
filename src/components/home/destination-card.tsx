import Link from "next/link";
import { DestinationHeroImage } from "@/components/destinations/destination-hero-image";
import { Card } from "@/components/ui/card";
import type { Destination, Origin } from "@/lib/data/openseason";
import { getDestinationDecisionStatus } from "@/lib/decision-layer";

export function DestinationCard({
  destination,
  origin,
  href = `/destinations/${destination.slug}`,
}: Readonly<{
  destination: Destination;
  origin: Origin;
  href?: string;
}>) {
  const decision = getDestinationDecisionStatus(destination);
  const dotColor = dotColorFor(decision.level, destination.fitScore);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <Link
        href={href}
        className="group flex flex-1 flex-col transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(136,86,208,0.35)]"
      >
        <DestinationHeroImage slug={destination.slug} name={destination.name} surface="card" />

        <div className="flex flex-1 flex-col gap-2 px-5 pt-4 pb-5">
          <p className="eyebrow">{destination.region}</p>

          <h3
            className="display-title text-[26px] leading-[1.1] text-foreground"
            style={{ fontWeight: 500 }}
          >
            {destination.name}
          </h3>

          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[#9a8878]">
            <span
              aria-hidden
              className="h-[7px] w-[7px] shrink-0 rounded-full"
              style={{ backgroundColor: dotColor }}
            />
            <span>
              {destination.driveHours[origin]}h from {originLabel(origin)} ·{" "}
              {destination.bestActivity}
            </span>
          </p>
        </div>
      </Link>
    </Card>
  );
}

function dotColorFor(level: "block" | "warn" | "inform", fitScore: number): string {
  if (level === "block") return "#7a2e20";
  if (level === "warn") return "#8a5a32";
  if (fitScore >= 85) return "#335c50";
  if (fitScore >= 62) return "#b08060";
  return "#9a8878";
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
