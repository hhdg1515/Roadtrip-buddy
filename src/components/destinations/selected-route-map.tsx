import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { Destination, Origin } from "@/lib/data/openseason";
import { getDestinationPresentation } from "@/lib/destination-presentation";
import { labelOrigin } from "@/lib/planning";
import styles from "./selected-route-map.module.css";

const CALIFORNIA_OUTLINE: Array<[number, number]> = [
  [-124.21, 42.01], [-124.32, 41.74], [-124.35, 40.44], [-124.17, 40.0],
  [-124.03, 39.67], [-123.79, 38.87], [-123.46, 38.49], [-123.1, 37.93],
  [-122.88, 37.81], [-122.51, 37.72], [-122.43, 37.42], [-122.28, 37.14],
  [-121.88, 36.6], [-121.93, 36.31], [-121.45, 35.79], [-120.96, 35.38],
  [-120.72, 35.13], [-120.59, 34.97], [-120.46, 34.45], [-120.01, 34.44],
  [-119.72, 34.4], [-119.23, 34.08], [-118.8, 33.88], [-118.4, 33.73],
  [-117.97, 33.6], [-117.52, 33.44], [-117.25, 32.67], [-117.13, 32.53],
  [-114.72, 32.72], [-114.63, 32.82], [-114.55, 33.03], [-114.55, 34.78],
  [-114.62, 35.0], [-115.85, 35.46], [-116.38, 35.63], [-116.93, 36.16],
  [-117.16, 36.34], [-118.2, 36.58], [-118.41, 37.08], [-119.03, 37.46],
  [-119.36, 38.5], [-119.66, 38.83], [-119.99, 39.1], [-120.0, 39.72],
  [-120.0, 41.19], [-121.42, 42.01], [-122.5, 42.01], [-124.21, 42.01],
];

const ORIGIN_COORDS: Record<Origin, { longitude: number; latitude: number }> = {
  "bay-area": { longitude: -122.4194, latitude: 37.7749 },
  "los-angeles": { longitude: -118.2437, latitude: 34.0522 },
  "san-diego": { longitude: -117.1611, latitude: 32.7157 },
  sacramento: { longitude: -121.4944, latitude: 38.5816 },
};

const VIEWPORT = {
  width: 620,
  height: 400,
  padding: 44,
};

const STATE_BOUNDS = {
  minLon: -124.6,
  maxLon: -114.1,
  minLat: 32.4,
  maxLat: 42.15,
};

type Bounds = {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
};

function buildFocusBounds(
  origin: { longitude: number; latitude: number },
  destination: { longitude: number; latitude: number },
): Bounds {
  const contentWidth = VIEWPORT.width - VIEWPORT.padding * 2;
  const contentHeight = VIEWPORT.height - VIEWPORT.padding * 2;
  const aspectRatio = contentWidth / contentHeight;

  const lonDistance = Math.abs(destination.longitude - origin.longitude);
  const latDistance = Math.abs(destination.latitude - origin.latitude);

  let spanLon = Math.max(lonDistance * 2.2, 2.2);
  let spanLat = Math.max(latDistance * 2.6, 1.8);

  if (spanLon / spanLat < aspectRatio) {
    spanLon = spanLat * aspectRatio;
  } else {
    spanLat = spanLon / aspectRatio;
  }

  spanLon = Math.min(spanLon, STATE_BOUNDS.maxLon - STATE_BOUNDS.minLon);
  spanLat = Math.min(spanLat, STATE_BOUNDS.maxLat - STATE_BOUNDS.minLat);

  const centerLon = (origin.longitude + destination.longitude) / 2;
  const centerLat = (origin.latitude + destination.latitude) / 2;

  let minLon = centerLon - spanLon / 2;
  let maxLon = centerLon + spanLon / 2;
  let minLat = centerLat - spanLat / 2;
  let maxLat = centerLat + spanLat / 2;

  if (minLon < STATE_BOUNDS.minLon) {
    maxLon += STATE_BOUNDS.minLon - minLon;
    minLon = STATE_BOUNDS.minLon;
  }
  if (maxLon > STATE_BOUNDS.maxLon) {
    minLon -= maxLon - STATE_BOUNDS.maxLon;
    maxLon = STATE_BOUNDS.maxLon;
  }
  if (minLat < STATE_BOUNDS.minLat) {
    maxLat += STATE_BOUNDS.minLat - minLat;
    minLat = STATE_BOUNDS.minLat;
  }
  if (maxLat > STATE_BOUNDS.maxLat) {
    minLat -= maxLat - STATE_BOUNDS.maxLat;
    maxLat = STATE_BOUNDS.maxLat;
  }

  return {
    minLon: Math.max(minLon, STATE_BOUNDS.minLon),
    maxLon: Math.min(maxLon, STATE_BOUNDS.maxLon),
    minLat: Math.max(minLat, STATE_BOUNDS.minLat),
    maxLat: Math.min(maxLat, STATE_BOUNDS.maxLat),
  };
}

function buildProjection(bounds: Bounds) {
  const scale = Math.min(
    (VIEWPORT.width - VIEWPORT.padding * 2) / (bounds.maxLon - bounds.minLon),
    (VIEWPORT.height - VIEWPORT.padding * 2) / (bounds.maxLat - bounds.minLat),
  );

  const offsetX =
    VIEWPORT.padding +
    ((VIEWPORT.width - VIEWPORT.padding * 2) - (bounds.maxLon - bounds.minLon) * scale) / 2;

  const offsetY =
    VIEWPORT.padding +
    ((VIEWPORT.height - VIEWPORT.padding * 2) - (bounds.maxLat - bounds.minLat) * scale) / 2;

  return (longitude: number, latitude: number) => ({
    x: offsetX + (longitude - bounds.minLon) * scale,
    y: offsetY + (bounds.maxLat - latitude) * scale,
  });
}

type PointLabel = {
  anchor: "start" | "end";
  labelX: number;
  labelY: number;
  subLabelY: number;
};

function getPointLabelPosition(x: number, y: number, side: "left" | "right"): PointLabel {
  return {
    anchor: side === "left" ? "end" : "start",
    labelX: x + (side === "left" ? -12 : 12),
    labelY: y - 10,
    subLabelY: y + 4,
  };
}

export function SelectedRouteMap({
  destination,
  origin,
}: Readonly<{
  destination: Destination;
  origin: Origin;
}>) {
  const presentation = getDestinationPresentation(destination.slug, destination.name);

  if (!presentation) {
    return null;
  }

  const originCoords = ORIGIN_COORDS[origin];
  const bounds = buildFocusBounds(originCoords, {
    longitude: presentation.longitude,
    latitude: presentation.latitude,
  });
  const project = buildProjection(bounds);
  const outlinePath = CALIFORNIA_OUTLINE.map(([longitude, latitude], index) => {
    const point = project(longitude, latitude);
    return `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }).join(" ");
  const originPoint = project(originCoords.longitude, originCoords.latitude);
  const destinationPoint = project(presentation.longitude, presentation.latitude);
  const curveHeight = Math.max(
    10,
    Math.min(
      42,
      Math.abs(destinationPoint.x - originPoint.x) * 0.045 +
        Math.abs(destinationPoint.y - originPoint.y) * 0.03,
    ),
  );
  const controlPoint = {
    x: (originPoint.x + destinationPoint.x) / 2,
    y: Math.min(originPoint.y, destinationPoint.y) - curveHeight,
  };
  const routePath = [
    `M ${originPoint.x.toFixed(2)} ${originPoint.y.toFixed(2)}`,
    `Q ${controlPoint.x.toFixed(2)} ${controlPoint.y.toFixed(2)}`,
    `${destinationPoint.x.toFixed(2)} ${destinationPoint.y.toFixed(2)}`,
  ].join(" ");
  const originLabel = getPointLabelPosition(
    originPoint.x,
    originPoint.y,
    originPoint.x > destinationPoint.x ? "right" : "left",
  );
  const destinationLabel = getPointLabelPosition(
    destinationPoint.x,
    destinationPoint.y,
    destinationPoint.x > originPoint.x ? "right" : "left",
  );

  return (
    <Card className={styles.card}>
      <CardHeader className={styles.header}>
        <p className={styles.eyebrow}>Selected route</p>
        <h2 className={styles.title}>
          {labelOrigin(origin)} → {destination.name}
        </h2>
      </CardHeader>
      <CardBody>
        <div className={styles.mapFrame}>
          <svg
            viewBox={`0 0 ${VIEWPORT.width} ${VIEWPORT.height}`}
            className={styles.map}
            role="img"
            aria-label={`${labelOrigin(origin)} to ${destination.name} route preview`}
          >
            <path d={`${outlinePath} Z`} className={styles.outlineFill} />
            <path d={`${outlinePath} Z`} className={styles.outlineStroke} />
            <path d={routePath} className={styles.routeGuide} />
            <path d={routePath} className={styles.routeLine} />

            <circle cx={originPoint.x} cy={originPoint.y} r="8" className={styles.originRing} />
            <circle cx={originPoint.x} cy={originPoint.y} r="3.6" className={styles.originDot} />

            <circle
              cx={destinationPoint.x}
              cy={destinationPoint.y}
              r="16"
              className={styles.destinationPulse}
            />
            <circle
              cx={destinationPoint.x}
              cy={destinationPoint.y}
              r="8.5"
              className={styles.destinationRing}
            />
            <circle
              cx={destinationPoint.x}
              cy={destinationPoint.y}
              r="3.9"
              className={styles.destinationDot}
            />

            <text
              x={originLabel.labelX}
              y={originLabel.labelY}
              className={styles.pointLabel}
              textAnchor={originLabel.anchor}
            >
              {labelOrigin(origin)}
            </text>
            <text
              x={originLabel.labelX}
              y={originLabel.subLabelY}
              className={styles.pointSubLabel}
              textAnchor={originLabel.anchor}
            >
              origin
            </text>

            <text
              x={destinationLabel.labelX}
              y={destinationLabel.labelY}
              className={styles.pointLabel}
              textAnchor={destinationLabel.anchor}
            >
              {destination.name}
            </text>
            <text
              x={destinationLabel.labelX}
              y={destinationLabel.subLabelY}
              className={styles.pointSubLabel}
              textAnchor={destinationLabel.anchor}
            >
              destination
            </text>
          </svg>
        </div>
      </CardBody>
    </Card>
  );
}
