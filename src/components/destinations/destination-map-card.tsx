import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { Destination, Origin } from "@/lib/data/openseason";
import { getDestinationPresentation } from "@/lib/destination-presentation";

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

  return (
    <Card>
      <CardHeader>
        <p className="text-xs text-muted">Map</p>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="overflow-hidden rounded-md bg-muted-soft">
          <iframe
            title={`${destination.name} map`}
            src={presentation.mapEmbedUrl}
            className="h-[280px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
          <dl className="grid grid-cols-[110px_1fr] gap-x-2 gap-y-1 text-sm leading-6">
            <dt className="text-muted">Best base</dt>
            <dd>{destination.lodging.bestBase}</dd>
            {focusOrigin ? (
              <>
                <dt className="text-muted">Drive</dt>
                <dd>{destination.driveHours[focusOrigin]}h from {labelOrigin(focusOrigin)}</dd>
              </>
            ) : null}
          </dl>
          <Link
            href={presentation.mapLinkUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            Map
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
