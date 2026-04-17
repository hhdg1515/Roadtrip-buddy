import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { Destination, Origin } from "@/lib/data/openseason";
import { getDestinationPresentation, getDriveTimeSummary } from "@/lib/destination-presentation";

function labelOrigin(origin: Origin) {
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

export function DestinationMapCard({
  destination,
  focusOrigin,
}: Readonly<{
  destination: Destination;
  focusOrigin?: Origin;
}>) {
  const presentation = getDestinationPresentation(destination.slug, destination.name);

  if (!presentation) {
    return null;
  }

  const driveTimes = getDriveTimeSummary(destination);

  return (
    <Card>
      <CardHeader>
        <p className="eyebrow">Map snapshot</p>
        <h2 className="display-title text-3xl font-semibold">Location and access</h2>
      </CardHeader>
      <CardBody className="space-y-5">
        <div className="overflow-hidden rounded-[24px] border border-white/35 bg-muted-soft">
          <iframe
            title={`${destination.name} map`}
            src={presentation.mapEmbedUrl}
            className="h-[320px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="space-y-3 text-sm leading-6">
            <p>
              <span className="font-semibold">Best base:</span> {destination.lodging.bestBase}
            </p>
            <p>
              <span className="font-semibold">Coordinates:</span> {presentation.latitude.toFixed(3)}
              , {presentation.longitude.toFixed(3)}
            </p>
            {focusOrigin ? (
              <p>
                <span className="font-semibold">Current drive anchor:</span>{" "}
                {destination.driveHours[focusOrigin]}h from {labelOrigin(focusOrigin)}
              </p>
            ) : null}
          </div>
          <Link
            href={presentation.mapLinkUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "secondary" })}
          >
            Open full map
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {driveTimes.map((item) => (
            <div key={item.origin} className="rounded-[20px] bg-muted-soft px-4 py-4 text-sm">
              <span className="font-semibold">{labelOrigin(item.origin)}:</span> {item.driveHours}h
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
