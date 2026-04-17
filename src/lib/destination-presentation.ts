import { destinationSeedMeta } from "@/lib/data/openseason-seed-meta";
import type { Destination, Origin } from "@/lib/data/openseason";

type VisualTheme = "coast" | "desert" | "forest" | "island" | "lake" | "sierra" | "volcano";

type Presentation = {
  heroSrc: string;
  heroAlt: string;
  latitude: number;
  longitude: number;
  mapEmbedUrl: string;
  mapLinkUrl: string;
  zoom: number;
};

const visualThemeAsset: Record<VisualTheme, string> = {
  coast: "/images/destinations/coast.svg",
  desert: "/images/destinations/desert.svg",
  forest: "/images/destinations/forest.svg",
  island: "/images/destinations/island.svg",
  lake: "/images/destinations/lake.svg",
  sierra: "/images/destinations/sierra.svg",
  volcano: "/images/destinations/volcano.svg",
};

const zoomByTheme: Record<VisualTheme, number> = {
  coast: 8,
  desert: 8,
  forest: 8,
  island: 9,
  lake: 9,
  sierra: 8,
  volcano: 8,
};

function inferVisualTheme(slug: string, destinationType: string): VisualTheme {
  if (slug === "channel-islands") return "island";
  if (slug === "mount-shasta") return "volcano";
  if (slug === "big-bear" || slug === "tahoe") return "lake";
  if (
    destinationType.includes("desert") ||
    slug === "anza-borrego" ||
    slug === "death-valley" ||
    slug === "joshua-tree"
  ) {
    return "desert";
  }
  if (
    destinationType.includes("coast") ||
    destinationType.includes("seashore") ||
    destinationType.includes("monument")
  ) {
    return "coast";
  }
  if (destinationType.includes("volcanic") || slug === "lassen") {
    return "volcano";
  }
  if (destinationType.includes("forest") || slug === "redwoods" || slug === "klamath") {
    return "forest";
  }

  return "sierra";
}

function buildBoundingBox(latitude: number, longitude: number, zoom: number) {
  const latSpan = zoom >= 9 ? 0.22 : 0.5;
  const lonSpan = zoom >= 9 ? 0.34 : 0.8;

  return {
    minLat: latitude - latSpan,
    maxLat: latitude + latSpan,
    minLon: longitude - lonSpan,
    maxLon: longitude + lonSpan,
  };
}

function buildOpenStreetMapUrls(latitude: number, longitude: number, zoom: number) {
  const box = buildBoundingBox(latitude, longitude, zoom);
  const embedParams = new URLSearchParams({
    bbox: `${box.minLon},${box.minLat},${box.maxLon},${box.maxLat}`,
    layer: "mapnik",
    marker: `${latitude},${longitude}`,
  });
  const mapLinkParams = new URLSearchParams({
    mlat: String(latitude),
    mlon: String(longitude),
  });

  return {
    mapEmbedUrl: `https://www.openstreetmap.org/export/embed.html?${embedParams.toString()}`,
    mapLinkUrl: `https://www.openstreetmap.org/?${mapLinkParams.toString()}#map=${zoom}/${latitude}/${longitude}`,
  };
}

export function getDestinationPresentation(slug: string, name: string): Presentation | null {
  const meta = destinationSeedMeta[slug as keyof typeof destinationSeedMeta];

  if (!meta) {
    return null;
  }

  const theme = inferVisualTheme(slug, meta.destinationType);
  const zoom = zoomByTheme[theme];
  const { mapEmbedUrl, mapLinkUrl } = buildOpenStreetMapUrls(meta.latitude, meta.longitude, zoom);

  return {
    heroSrc: visualThemeAsset[theme],
    heroAlt: `${name} scenic cover art`,
    latitude: meta.latitude,
    longitude: meta.longitude,
    mapEmbedUrl,
    mapLinkUrl,
    zoom,
  };
}

export function getDriveTimeSummary(destination: Destination) {
  return (Object.entries(destination.driveHours) as Array<[Origin, number]>)
    .sort((left, right) => left[1] - right[1])
    .map(([origin, driveHours]) => ({
      origin,
      driveHours,
    }));
}
