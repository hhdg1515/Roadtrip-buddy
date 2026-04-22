import {
  calculateTripFitScore,
  labelTripFitScore,
  type ScoreBreakdown,
  type ScoringContext,
} from "@/lib/scoring/trip-fit";
import { destinationSeedMeta } from "@/lib/data/openseason-seed-meta";

export type Origin = "bay-area" | "los-angeles" | "san-diego" | "sacramento";
export type TripLength = "weekend" | "3-days" | "5-days" | "7-days";
export type DrivingTolerance = "tight" | "balanced" | "stretch";
export type GroupProfile = "mixed" | "active" | "easygoing" | "food-first";
export type TripFormat = "same-day" | "one-night" | "weekend-stay";
export type TripIntensity = "slow" | "balanced" | "full-days";
export type LodgingStyle = "town-base" | "cabin-lodge" | "camping";
export type InterestMode = "open" | "specific";
export type InterestKey =
  | "scenic-views"
  | "moderate-hiking"
  | "easy-walks"
  | "good-food"
  | "photography"
  | "snow-play";

export type RankingContext = {
  drivingTolerance?: DrivingTolerance;
  groupProfile?: GroupProfile;
  interests?: InterestKey[];
  tripFormat?: TripFormat;
  tripIntensity?: TripIntensity;
  lodgingStyle?: LodgingStyle;
  startDate?: string | null;
};

export type LiveWeatherSnapshot = {
  snapshotDate: string;
  highTemp: number | null;
  lowTemp: number | null;
  precipitationProbability: number | null;
  windSpeed: number | null;
  snowRisk: number | null;
  heatRisk: number | null;
};

export type DestinationAlert = {
  source: string;
  alertType: string;
  severity: string;
  title: string;
  description?: string | null;
  effectiveDate?: string | null;
  expirationDate?: string | null;
};

export type Destination = {
  slug: string;
  name: string;
  region: string;
  summary: string;
  updatedAt?: string | null;
  liveWeather?: LiveWeatherSnapshot | null;
  activeAlerts?: DestinationAlert[];
  currentVerdict: string;
  whyNow: string;
  mainWarning: string;
  bestActivity: string;
  seasonalWindow: string;
  palette: [string, string, string];
  driveHours: Record<Origin, number>;
  idealTripLengths: TripLength[];
  collections: string[];
  tags: string[];
  riskBadges: string[];
  breakdown: ScoreBreakdown;
  fitScore: number;
  fitLabel: string;
  activities: Array<{
    name: string;
    difficulty: string;
    bestTime: string;
    whyItFits: string;
  }>;
  avoid: string[];
  suggestedStops: string[];
  foodSupport: {
    nearbyTown: string;
    cafes: string[];
    dinner: string[];
    hangouts: string[];
    note: string;
  };
  lodging: {
    bestBase: string;
    bestFor: string;
    alternative: string;
    tradeoff: string;
  };
  planB: {
    trigger: string;
    alternative: string;
    whyItWorks: string;
    timeDifference: string;
  };
  itinerary: Array<{
    day: string;
    morning: string;
    midday: string;
    afternoon: string;
    evening: string;
    note: string;
  }>;
};

export type RankedDestination = Destination & {
  rankingScore: number;
};

type DestinationSeed = Omit<Destination, "fitScore" | "fitLabel">;

export const currentWindowLabel = "Mid-April 2026";

export const originOptions: Array<{ id: Origin; label: string }> = [
  { id: "bay-area", label: "Bay Area" },
  { id: "los-angeles", label: "Los Angeles" },
  { id: "san-diego", label: "San Diego" },
  { id: "sacramento", label: "Sacramento" },
];

export const tripLengthOptions: Array<{ id: TripLength; label: string }> = [
  { id: "weekend", label: "Weekend" },
  { id: "3-days", label: "3 days" },
  { id: "5-days", label: "5 days" },
  { id: "7-days", label: "7 days" },
];

export const drivingToleranceOptions: Array<{ id: DrivingTolerance; label: string }> = [
  { id: "tight", label: "Keep drives tight" },
  { id: "balanced", label: "Balanced road trip" },
  { id: "stretch", label: "Okay with long drives" },
];

export const groupProfileOptions: Array<{ id: GroupProfile; label: string }> = [
  { id: "mixed", label: "Mixed energy group" },
  { id: "active", label: "Activity-first group" },
  { id: "easygoing", label: "Easygoing / scenic" },
  { id: "food-first", label: "Food + town first" },
];

export const tripFormatOptions: Array<{ id: TripFormat; label: string }> = [
  { id: "same-day", label: "Same-day return" },
  { id: "one-night", label: "One-night escape" },
  { id: "weekend-stay", label: "Stay the whole weekend" },
];

export const tripIntensityOptions: Array<{ id: TripIntensity; label: string }> = [
  { id: "slow", label: "Keep days light" },
  { id: "balanced", label: "Balanced days" },
  { id: "full-days", label: "Pack full days" },
];

export const lodgingStyleOptions: Array<{ id: LodgingStyle; label: string }> = [
  { id: "town-base", label: "Town base with food" },
  { id: "cabin-lodge", label: "Cabin / lodge feel" },
  { id: "camping", label: "Camping-forward" },
];

export const interestOptions: Array<{ id: InterestKey; label: string }> = [
  { id: "scenic-views", label: "Scenic views" },
  { id: "moderate-hiking", label: "Moderate hiking" },
  { id: "easy-walks", label: "Easy walks" },
  { id: "good-food", label: "Good food / cafe" },
  { id: "photography", label: "Photography" },
  { id: "snow-play", label: "Snow interest" },
];

export type SeasonalCollection = {
  id: string;
  name: string;
  months: string;
  hook: string;
  description: string;
  slugs: string[];
  coverSlug: string;
  brief: {
    tripFormat?: TripFormat;
    interests?: InterestKey[];
  };
};

export const seasonalCollections: SeasonalCollection[] = [
  {
    id: "spring-sierra",
    name: "Spring Sierra",
    months: "Apr – Jun",
    hook: "Granite walls and waterfalls, before the high passes melt out.",
    description: "Lower-elevation Sierra icons are working now, but elevation discipline still matters.",
    slugs: ["yosemite", "sequoia-kings", "tahoe", "big-bear"],
    coverSlug: "yosemite",
    brief: {
      tripFormat: "weekend-stay",
      interests: ["scenic-views", "moderate-hiking", "photography"],
    },
  },
  {
    id: "coast",
    name: "Coast",
    months: "Year-round",
    hook: "Low-friction cliffs and food towns for mixed groups.",
    description: "The coast is still the cleanest low-friction answer for mixed groups and short trips.",
    slugs: ["big-sur-carmel", "point-reyes", "sonoma-coast", "point-loma-cabrillo"],
    coverSlug: "big-sur-carmel",
    brief: {
      tripFormat: "weekend-stay",
      interests: ["scenic-views", "easy-walks", "good-food"],
    },
  },
  {
    id: "desert",
    name: "Desert",
    months: "Feb – Apr",
    hook: "Last comfortable window before the heat arrives.",
    description: "The last comfortable desert window is open before the real heat arrives.",
    slugs: ["joshua-tree", "death-valley", "anza-borrego"],
    coverSlug: "joshua-tree",
    brief: {
      tripFormat: "weekend-stay",
      interests: ["scenic-views", "photography", "easy-walks"],
    },
  },
  {
    id: "north-state",
    name: "North State",
    months: "May – Oct",
    hook: "Far-north forest and volcano country, once snow clears.",
    description: "Far-north forest and volcano trips are emerging, but shoulder-season access still shapes them.",
    slugs: ["mount-shasta", "lassen", "redwoods", "klamath"],
    coverSlug: "mount-shasta",
    brief: {
      tripFormat: "weekend-stay",
      interests: ["scenic-views", "moderate-hiking"],
    },
  },
];

export const cautionList = [
  "High Sierra trails still carry snow above lower trailheads.",
  "Highway 1 routing needs closure checks before committing to Big Sur loops.",
  "Desert windows are closing fast as afternoon heat starts climbing.",
  "Mammoth remains strong for snow, but hiking access is still patchy outside town.",
  "Island, mountain, and far-north trips are all more condition-sensitive than city forecasts suggest.",
];

function buildDriveHours(
  bayArea: number,
  losAngeles: number,
  sanDiego: number,
  sacramento: number,
): Record<Origin, number> {
  return {
    "bay-area": bayArea,
    "los-angeles": losAngeles,
    "san-diego": sanDiego,
    sacramento,
  };
}

function buildBreakdown(
  seasonality: number,
  weather: number,
  activityMatch: number,
  driveTime: number,
  alerts: number,
  groupFit: number,
  lodging: number,
  planB: number,
): ScoreBreakdown {
  return {
    seasonality,
    weather,
    activityMatch,
    driveTime,
    alerts,
    groupFit,
    lodging,
    planB,
  };
}

function buildActivity(
  name: string,
  difficulty: string,
  bestTime: string,
  whyItFits: string,
) {
  return {
    name,
    difficulty,
    bestTime,
    whyItFits,
  };
}

function buildItineraryDay(
  day: string,
  morning: string,
  midday: string,
  afternoon: string,
  evening: string,
  note: string,
) {
  return {
    day,
    morning,
    midday,
    afternoon,
    evening,
    note,
  };
}

function buildFoodSupport(
  nearbyTown: string,
  cafes: string[],
  dinner: string[],
  hangouts: string[],
  note: string,
) {
  return {
    nearbyTown,
    cafes,
    dinner,
    hangouts,
    note,
  };
}

function buildLodging(
  bestBase: string,
  bestFor: string,
  alternative: string,
  tradeoff: string,
) {
  return {
    bestBase,
    bestFor,
    alternative,
    tradeoff,
  };
}

function buildPlanB(
  trigger: string,
  alternative: string,
  whyItWorks: string,
  timeDifference: string,
) {
  return {
    trigger,
    alternative,
    whyItWorks,
    timeDifference,
  };
}

const destinationSeeds: DestinationSeed[] = [
  {
    slug: "big-sur-carmel",
    name: "Big Sur + Carmel",
    region: "Central Coast",
    summary:
      "Best balanced 3-day pick for scenery, easy walks, cafes, and one non-hiker in the car.",
    currentVerdict:
      "Strong pick this week if the group wants dramatic views and a low-friction backup plan.",
    whyNow:
      "Coastal weather is stable, spring greens are back, and the Carmel base gives you food and low-effort options without weakening the trip.",
    mainWarning:
      "Route confidence matters. Highway 1 changes should be checked before locking a long scenic loop.",
    bestActivity: "Scenic coast + easy hikes",
    seasonalWindow: "Year-round with route-risk awareness",
    palette: ["#173038", "#1f5b68", "#d87c34"],
    driveHours: {
      "bay-area": 2.7,
      "los-angeles": 5.6,
      "san-diego": 8.1,
      sacramento: 4.2,
    },
    idealTripLengths: ["weekend", "3-days", "5-days"],
    collections: ["Coast", "Non-hiker friendly", "Food + town"],
    tags: ["Scenic drive", "Coast", "Cafe/town", "Romantic", "Mixed group"],
    riskBadges: ["Road closure risk", "Crowding risk"],
    breakdown: {
      seasonality: 88,
      weather: 84,
      activityMatch: 86,
      driveTime: 90,
      alerts: 67,
      groupFit: 94,
      lodging: 91,
      planB: 90,
    },
    activities: [
      {
        name: "Bixby Bridge to Garrapata pull-offs",
        difficulty: "Very easy",
        bestTime: "Morning",
        whyItFits: "High reward stops with almost no physical demand.",
      },
      {
        name: "Point Lobos short coastal walks",
        difficulty: "Easy",
        bestTime: "Late morning",
        whyItFits: "Wildlife and coastline without committing to a full hike.",
      },
      {
        name: "Pfeiffer Big Sur + redwood stop",
        difficulty: "Easy to moderate",
        bestTime: "Afternoon",
        whyItFits: "A satisfying inland contrast if the group wants one active block.",
      },
    ],
    avoid: [
      "Long day plans that assume the full Highway 1 corridor is frictionless.",
      "Overloading the trip with remote trailheads when the group wants food and towns.",
      "Assuming last-minute dinner availability in Carmel on peak nights.",
    ],
    suggestedStops: [
      "Carmel-by-the-Sea",
      "Point Lobos",
      "Bixby Bridge pull-off",
      "Nepenthe area viewpoint",
      "Pfeiffer Big Sur State Park",
    ],
    foodSupport: {
      nearbyTown: "Carmel + Monterey",
      cafes: ["Carmel coffee stop", "Monterey brunch window"],
      dinner: ["Carmel dinner strip", "Monterey wharf seafood fallback"],
      hangouts: ["Wine bars", "Oceanfront bench stops", "Cannery Row fallback"],
      note: "This is the strongest base in the shortlist for keeping non-hikers engaged.",
    },
    lodging: {
      bestBase: "Carmel-by-the-Sea",
      bestFor: "Scenic access, restaurants, and low-effort group flexibility",
      alternative: "Monterey",
      tradeoff: "More practical inventory and price range, less intimate and slightly less cinematic.",
    },
    planB: {
      trigger: "If Highway 1 routing tightens or a long coastal segment feels risky",
      alternative: "Base in Carmel and shift to Point Lobos, Monterey, 17-Mile Drive, and short Big Sur segments only.",
      whyItWorks: "You preserve the coast mood while reducing route fragility.",
      timeDifference: "About 60-90 minutes less driving across the trip.",
    },
    itinerary: [
      {
        day: "Day 1",
        morning: "Leave Bay Area early and enter the coast through Monterey.",
        midday: "Lunch in Carmel, then keep the afternoon intentionally light.",
        afternoon: "Point Lobos or Garrapata short walks and overlooks.",
        evening: "Dinner in Carmel with a low-effort sunset stop.",
        note: "This first day keeps the group fresh instead of burning everything on the drive.",
      },
      {
        day: "Day 2",
        morning: "Drive the most scenic stretch south with flexible pull-offs.",
        midday: "Long scenic lunch stop around Big Sur proper.",
        afternoon: "One active block at Pfeiffer Big Sur or redwood stop for hikers, town time for the low-effort track.",
        evening: "Return to base for dinner and a second easy coastline stop.",
        note: "The plan uses the car as part of the experience rather than a burden.",
      },
      {
        day: "Day 3",
        morning: "Slow breakfast and one final coastal stop.",
        midday: "Optional Monterey aquarium or cafe loop for non-hikers.",
        afternoon: "Return north with a planned food stop instead of a rushed exit.",
        evening: "Home with energy left.",
        note: "Day 3 stays useful even if weather softens.",
      },
    ],
  },
  {
    slug: "yosemite",
    name: "Yosemite Valley",
    region: "Sierra Nevada",
    summary:
      "Spring waterfall energy is excellent, but the trip needs discipline around elevation and crowd assumptions.",
    currentVerdict:
      "Excellent for waterfalls and valley hikes right now. Not the cleanest mixed-group answer if you need low-friction dining and backup options.",
    whyNow:
      "Waterfalls are peaking, valley floor access is reliable, and cool temperatures still support long scenic days.",
    mainWarning:
      "High-country expectations are the main failure mode. This is a valley-first trip until more terrain opens cleanly.",
    bestActivity: "Waterfalls + valley hiking",
    seasonalWindow: "Spring waterfalls, summer high country, fall resets, winter valley",
    palette: ["#213844", "#4f6f77", "#b9c8ba"],
    driveHours: {
      "bay-area": 4.1,
      "los-angeles": 6.2,
      "san-diego": 8.5,
      sacramento: 3.8,
    },
    idealTripLengths: ["3-days", "5-days", "7-days"],
    collections: ["Waterfalls", "Scenic icons", "Spring window"],
    tags: ["Hiking", "Photography", "Waterfalls", "Family-friendly"],
    riskBadges: ["Crowding risk", "Snow risk", "Reservation friction"],
    breakdown: {
      seasonality: 93,
      weather: 80,
      activityMatch: 88,
      driveTime: 76,
      alerts: 69,
      groupFit: 74,
      lodging: 69,
      planB: 87,
    },
    activities: [
      {
        name: "Lower Yosemite Fall + valley loop",
        difficulty: "Easy",
        bestTime: "Morning",
        whyItFits: "High impact and easy to pair with non-hikers.",
      },
      {
        name: "Mist Trail lower section or Vernal Fall bridge",
        difficulty: "Moderate",
        bestTime: "Late morning",
        whyItFits: "Strong spring payoff without demanding full-day elevation gain.",
      },
      {
        name: "Tunnel View + valley photography run",
        difficulty: "Very easy",
        bestTime: "Golden hour",
        whyItFits: "Lets the group share the iconic part of the trip together.",
      },
    ],
    avoid: [
      "Assuming Tioga or high-country style access should define the trip.",
      "Overcommitting to major hikes if someone in the group is low energy.",
      "Late arrival windows that lose you parking and rhythm.",
    ],
    suggestedStops: [
      "Tunnel View",
      "Lower Yosemite Fall",
      "Cook's Meadow",
      "Bridalveil Fall area",
      "Mariposa Grove option",
    ],
    foodSupport: {
      nearbyTown: "Yosemite Valley + Mariposa",
      cafes: ["Valley quick-service stops", "Mariposa coffee fallback"],
      dinner: ["Valley lodge dinner", "Mariposa return-night option"],
      hangouts: ["El Portal base stop", "Mariposa old town stroll"],
      note: "This works, but it is clearly weaker than Carmel for food-town coverage.",
    },
    lodging: {
      bestBase: "Yosemite Valley or El Portal",
      bestFor: "Early starts and keeping driving low inside the park",
      alternative: "Mariposa",
      tradeoff: "Better town feeling and easier dinner options, but adds extra drive time.",
    },
    planB: {
      trigger: "If higher-elevation trails feel snowy, crowded, or overcommitted",
      alternative: "Keep the trip valley-focused with waterfalls, viewpoints, Mariposa Grove, and slower scenic blocks.",
      whyItWorks: "The valley itself still carries the value proposition in spring.",
      timeDifference: "About 2-3 hours less hiking and transition time.",
    },
    itinerary: [
      {
        day: "Day 1",
        morning: "Drive in early enough to enter before the day feels compressed.",
        midday: "Valley check-in, Lower Yosemite Fall, and meadow orientation.",
        afternoon: "Tunnel View and flexible scenic loop.",
        evening: "Simple dinner near base with an early reset.",
        note: "Use the first day to understand conditions instead of chasing too much.",
      },
      {
        day: "Day 2",
        morning: "Primary moderate hike while energy is highest.",
        midday: "Recover with easy valley time and food stop.",
        afternoon: "Photography or grove option for the lower-effort track.",
        evening: "Shared scenic viewpoint before dinner.",
        note: "This is the main payoff day, but the trip still works if you shorten the hike.",
      },
      {
        day: "Day 3",
        morning: "One last easy waterfall or grove block.",
        midday: "Late brunch or packed lunch before exit.",
        afternoon: "Drive home without forcing another hard stop.",
        evening: "Return with a complete spring Yosemite trip, not a rushed checklist.",
        note: "Keep departure timing realistic; the park punishes overpacked final days.",
      },
    ],
  },
  {
    slug: "tahoe",
    name: "Tahoe Basin",
    region: "Sierra / Alpine Basin",
    summary:
      "Useful shoulder-season option if you want snow adjacency and lake scenery, but the signal is mixed compared with the top two picks.",
    currentVerdict:
      "Good with caution. Tahoe works right now when flexibility is the point, not when certainty is the point.",
    whyNow:
      "There is still snow utility for late-season mountain weekends, and lower-elevation lake stops can support non-skiers.",
    mainWarning:
      "Shoulder season means you are balancing leftover snow, changing weather, and uneven activity quality.",
    bestActivity: "Snow shoulder + scenic lake stops",
    seasonalWindow: "Winter snow, summer lake, fall reset",
    palette: ["#1d3140", "#2f5f79", "#8ec6d1"],
    driveHours: {
      "bay-area": 3.6,
      "los-angeles": 7.9,
      "san-diego": 9.4,
      sacramento: 2.1,
    },
    idealTripLengths: ["weekend", "3-days", "5-days"],
    collections: ["Snow Shoulder", "Scenic icons"],
    tags: ["Snow", "Scenic drive", "Lake", "Mixed group"],
    riskBadges: ["Mixed weather", "Snow risk"],
    breakdown: {
      seasonality: 71,
      weather: 69,
      activityMatch: 77,
      driveTime: 82,
      alerts: 73,
      groupFit: 82,
      lodging: 84,
      planB: 81,
    },
    activities: [
      {
        name: "Late-season snow day",
        difficulty: "Moderate",
        bestTime: "Morning",
        whyItFits: "Still viable if the group actively wants a snow-forward weekend.",
      },
      {
        name: "Emerald Bay and shoreline scenic loop",
        difficulty: "Very easy",
        bestTime: "Afternoon",
        whyItFits: "Gives non-skiers a meaningful day without forcing them onto snow.",
      },
      {
        name: "Town-based recovery day",
        difficulty: "Very easy",
        bestTime: "Flexible",
        whyItFits: "Important because conditions can soften quickly.",
      },
    ],
    avoid: [
      "Planning the trip as a pure hiking weekend.",
      "Assuming every lake and mountain activity is simultaneously in season.",
      "Overcommitting before checking weather windows.",
    ],
    suggestedStops: [
      "South Lake scenic shoreline",
      "Emerald Bay",
      "Truckee food stop",
      "Heavenly village fallback",
    ],
    foodSupport: {
      nearbyTown: "South Lake Tahoe + Truckee",
      cafes: ["Truckee coffee loop", "South Lake breakfast stop"],
      dinner: ["South Lake dinner cluster", "Truckee fallback night"],
      hangouts: ["Lakefront benches", "Village walk", "Spa or lodge lounge"],
      note: "Tahoe can still carry a split-energy group, but the reason to go needs to be clear.",
    },
    lodging: {
      bestBase: "South Lake Tahoe",
      bestFor: "Activity flexibility and easy fallback coverage",
      alternative: "Truckee",
      tradeoff: "Truckee has better town character for some groups, but not the same south-lake spread.",
    },
    planB: {
      trigger: "If mountain weather undercuts the active plan",
      alternative: "Shift the day to shoreline views, town time, and one short nature block.",
      whyItWorks: "Tahoe still has enough non-slope structure to salvage the weekend.",
      timeDifference: "About 2 hours less gear and transition overhead.",
    },
    itinerary: [
      {
        day: "Day 1",
        morning: "Drive in with one intentional food stop, not a fragmented route.",
        midday: "Check conditions and decide whether the trip is snow-first or scenic-first.",
        afternoon: "Short lakefront block and easy town setup.",
        evening: "Early dinner near base.",
        note: "Use day one to pick the version of Tahoe the weekend really supports.",
      },
      {
        day: "Day 2",
        morning: "Primary snow or alpine activity block.",
        midday: "Recovery lunch and reset.",
        afternoon: "Emerald Bay, shoreline drive, or lodge downtime for the low-effort track.",
        evening: "Shared dinner and sunset stop.",
        note: "Tahoe performs best when the split plan is explicit.",
      },
      {
        day: "Day 3",
        morning: "One final short stop near the lake.",
        midday: "Truckee or town lunch.",
        afternoon: "Return before traffic and fatigue stack up.",
        evening: "Home.",
        note: "This keeps Tahoe from turning into a logistics-heavy closeout.",
      },
    ],
  },
  {
    slug: "mammoth",
    name: "Mammoth Lakes",
    region: "Eastern Sierra",
    summary:
      "Good for a snow-focused group willing to drive longer. Weak if the real goal is an easy mixed-energy spring trip.",
    currentVerdict:
      "A niche pick right now. Strong for late snow and hot springs framing, weaker for a broad group-friendly April decision.",
    whyNow:
      "Mammoth still has snow product and a recognizable mountain-town base, but hiking breadth is limited this early.",
    mainWarning:
      "The drive is the tax. If your group is not committed to snow or mountain culture, the math gets worse fast.",
    bestActivity: "Late-season snow + hot springs framing",
    seasonalWindow: "Winter snow, summer alpine, fall foliage",
    palette: ["#25323d", "#597180", "#e6bc8f"],
    driveHours: {
      "bay-area": 6.8,
      "los-angeles": 5.4,
      "san-diego": 7.1,
      sacramento: 5.6,
    },
    idealTripLengths: ["3-days", "5-days", "7-days"],
    collections: ["Snow Shoulder", "Eastern Sierra"],
    tags: ["Snow", "Photography", "Scenic drive"],
    riskBadges: ["Long drive", "Snow risk"],
    breakdown: {
      seasonality: 74,
      weather: 70,
      activityMatch: 73,
      driveTime: 56,
      alerts: 75,
      groupFit: 70,
      lodging: 84,
      planB: 78,
    },
    activities: [
      {
        name: "Late-season ski block",
        difficulty: "Moderate",
        bestTime: "Morning",
        whyItFits: "Still the core reason to choose Mammoth now.",
      },
      {
        name: "Town + hot springs framing",
        difficulty: "Very easy",
        bestTime: "Afternoon",
        whyItFits: "Gives the trip a secondary identity beyond the mountain.",
      },
      {
        name: "Scenic Eastern Sierra photography run",
        difficulty: "Easy",
        bestTime: "Golden hour",
        whyItFits: "Adds value when trail access is still patchy.",
      },
    ],
    avoid: [
      "Pretending Mammoth is already in summer mode.",
      "Using this as the easiest group compromise option.",
      "Burning day one and day three without being honest about drive fatigue.",
    ],
    suggestedStops: [
      "Mammoth Lakes base",
      "Village area",
      "Owens Valley drive segments",
      "Hot springs window where conditions allow",
    ],
    foodSupport: {
      nearbyTown: "Mammoth Lakes",
      cafes: ["Village coffee stop", "Town breakfast loop"],
      dinner: ["Village dinner cluster", "Lodge fallback"],
      hangouts: ["Village walk", "Spa time", "Scenic overlook"],
      note: "Better than a park trip for base-town support, but still not as effortless as Carmel.",
    },
    lodging: {
      bestBase: "Mammoth Lakes",
      bestFor: "Keeping the mountain and town loop tight",
      alternative: "Bishop",
      tradeoff: "Cheaper and broader food support, but it weakens slope proximity.",
    },
    planB: {
      trigger: "If the main snow activity is reduced or weather slips",
      alternative: "Move into a hot-springs, scenic drive, and town-focused itinerary.",
      whyItWorks: "Eastern Sierra still looks like a trip even when the main sport softens.",
      timeDifference: "About 1-2 hours less mountain transition time.",
    },
    itinerary: [
      {
        day: "Day 1",
        morning: "Drive with one clean stop pattern rather than scattered breaks.",
        midday: "Enter town, settle the base, and keep the first activity light.",
        afternoon: "Village loop or scenic drive opener.",
        evening: "Early dinner and reset for the main day.",
        note: "Respect the drive or the rest of the trip loses quality.",
      },
      {
        day: "Day 2",
        morning: "Main snow block while conditions are strongest.",
        midday: "Lunch back near base.",
        afternoon: "Hot springs, scenic route, or low-effort town track.",
        evening: "Shared dinner in Mammoth.",
        note: "This is a snow-first plan with backup structure.",
      },
      {
        day: "Day 3",
        morning: "Short mountain or town closeout.",
        midday: "Start the return before fatigue stacks.",
        afternoon: "Drive home.",
        evening: "Arrive with less drag.",
        note: "Do not squeeze too much into the final day.",
      },
    ],
  },
  {
    slug: "death-valley",
    name: "Death Valley",
    region: "Southern Desert",
    summary:
      "Still viable in mid-April, but already drifting out of the safest casual-user window and too far for the Bay Area scenario.",
    currentVerdict:
      "Conditionally good. Better for a targeted desert trip than for the default mixed-group long weekend from the Bay Area.",
    whyNow:
      "The desert still offers scenic payoff before summer shuts the door, and broad-road scenic stops help non-hikers.",
    mainWarning:
      "Heat exposure risk is climbing. This window closes fast and should not be treated like winter comfort.",
    bestActivity: "Desert photography + scenic drive",
    seasonalWindow: "November through March, fading in April",
    palette: ["#5d3d25", "#a46533", "#efcf90"],
    driveHours: {
      "bay-area": 8.4,
      "los-angeles": 4.7,
      "san-diego": 5.5,
      sacramento: 8.2,
    },
    idealTripLengths: ["3-days", "5-days", "7-days"],
    collections: ["Desert", "Photography"],
    tags: ["Desert", "Scenic drive", "Photography"],
    riskBadges: ["Heat risk", "Remote services"],
    breakdown: {
      seasonality: 62,
      weather: 58,
      activityMatch: 66,
      driveTime: 42,
      alerts: 71,
      groupFit: 73,
      lodging: 64,
      planB: 70,
    },
    activities: [
      {
        name: "Golden hour scenic viewpoints",
        difficulty: "Very easy",
        bestTime: "Sunrise and sunset",
        whyItFits: "High payoff with low physical load.",
      },
      {
        name: "Short desert walks",
        difficulty: "Easy",
        bestTime: "Early morning",
        whyItFits: "Only works if you are strict about timing.",
      },
      {
        name: "Stargazing framing",
        difficulty: "Very easy",
        bestTime: "Night",
        whyItFits: "A strong backup value block if daytime heat rises.",
      },
    ],
    avoid: [
      "Midday exposed hikes.",
      "Assuming April behaves like the core winter window.",
      "Using this as the easiest recommendation for a Bay Area weekend.",
    ],
    suggestedStops: [
      "Badwater Basin viewpoint",
      "Zabriskie Point",
      "Mesquite Flat Dunes",
      "Furnace Creek base",
    ],
    foodSupport: {
      nearbyTown: "Furnace Creek",
      cafes: ["In-park quick-service windows"],
      dinner: ["Lodge dining only"],
      hangouts: ["Resort pool or stargazing"],
      note: "Functional, not rich. The trip value is the landscape, not town support.",
    },
    lodging: {
      bestBase: "Furnace Creek",
      bestFor: "Keeping dawn and dusk logistics simple",
      alternative: "Beatty",
      tradeoff: "Cheaper and more practical in some cases, but less immersive and adds drive time.",
    },
    planB: {
      trigger: "If afternoon temperatures spike higher than expected",
      alternative: "Shift to sunrise, scenic drive blocks, lodge downtime, and post-sunset views only.",
      whyItWorks: "The park still pays off visually when you protect exposure windows.",
      timeDifference: "Roughly 2-3 fewer daytime activity hours.",
    },
    itinerary: [
      {
        day: "Day 1",
        morning: "Long drive or flight-like travel day depending on origin.",
        midday: "Enter the park with low activity expectations.",
        afternoon: "One scenic stop only if temperatures cooperate.",
        evening: "Dinner, sunset viewpoint, and early reset.",
        note: "Arrival energy management is part of safety here.",
      },
      {
        day: "Day 2",
        morning: "Primary scenic loop before heat builds.",
        midday: "Retreat, hydrate, and stay conservative.",
        afternoon: "Short scenic stops only if exposure is acceptable.",
        evening: "Stargazing closeout.",
        note: "The plan works only when the clock controls the trip.",
      },
      {
        day: "Day 3",
        morning: "One last dawn block.",
        midday: "Begin exit before the hottest period matters.",
        afternoon: "Return leg.",
        evening: "Home or overnight transfer.",
        note: "This is a precision trip, not a casual all-day wander.",
      },
    ],
  },
  {
    slug: "point-reyes",
    name: "Point Reyes",
    region: "North Coast",
    summary:
      "Best Bay Area north-coast answer when the group wants bluffs, oysters, short hikes, and less commitment than Big Sur.",
    currentVerdict:
      "Excellent for a low-friction spring reset, especially for Bay Area and Sacramento starts.",
    whyNow:
      "Spring grass is green, shoreline wildlife is active, and West Marin gives you real food-town backup without breaking the outdoor rhythm.",
    mainWarning:
      "Wind and fog can flatten exposed ridge plans faster than people expect, so the coast needs flexibility even on short trips.",
    bestActivity: "Coastal viewpoints + moderate hikes",
    seasonalWindow: "Year-round, strongest in spring and fall",
    palette: ["#29414a", "#5d8277", "#d7bf8f"],
    driveHours: buildDriveHours(1.5, 6.8, 9, 2.4),
    idealTripLengths: ["weekend", "3-days"],
    collections: ["Coast", "Bay Area quick hit", "Food + town"],
    tags: ["Coast", "Oysters", "Moderate hiking", "Weekend", "Mixed group"],
    riskBadges: ["Wind risk", "Fog risk", "Parking friction"],
    breakdown: buildBreakdown(88, 82, 82, 94, 74, 88, 84, 90),
    activities: [
      buildActivity(
        "Chimney Rock and bluff overlooks",
        "Easy to moderate",
        "Morning",
        "High scenery payoff before wind builds and without demanding a full-day hike.",
      ),
      buildActivity(
        "Limantour or Drakes Beach walk",
        "Easy",
        "Late morning",
        "Lets mixed groups stay outdoors together with low friction.",
      ),
      buildActivity(
        "Point Reyes Station and Tomales stop",
        "Very easy",
        "Afternoon",
        "Keeps the trip resilient if someone wants food and downtime more than mileage.",
      ),
    ],
    avoid: [
      "Assuming exposed trails will feel good all day if winds rise.",
      "Packing only one food-stop plan into West Marin.",
      "Treating the lighthouse side as a casual add-on without timing and parking checks.",
    ],
    suggestedStops: [
      "Point Reyes Station",
      "Bear Valley area",
      "Chimney Rock",
      "Limantour Beach",
      "Tomales Bay oyster stop",
    ],
    foodSupport: buildFoodSupport(
      "Point Reyes Station + Olema",
      ["Bovine-style coffee stop", "Olema bakery window"],
      ["Oyster lunch on Tomales Bay", "Point Reyes Station dinner"],
      ["Inverness shoreline stop", "Bookshop + cafe downtime"],
      "This is one of the easiest outdoor weekends in the state to balance hiking, food, and low-effort pacing.",
    ),
    lodging: buildLodging(
      "Point Reyes Station",
      "Short drives to trailheads plus the strongest town backup",
      "Olema or Inverness",
      "Quieter mood and good positioning, but fewer flexible food options at night.",
    ),
    planB: buildPlanB(
      "If wind, fog, or parking makes exposed routes feel less appealing",
      "Keep the trip to Limantour, Tomales Bay, Point Reyes Station, and shorter inland grove or estuary stops.",
      "You preserve the coastal mood while lowering weather exposure and driving churn.",
      "Usually 45-75 minutes less driving across the trip.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Leave early enough to arrive before the coast gets crowded.",
        "Settle around Point Reyes Station and keep lunch simple.",
        "Choose one exposed viewpoint block only, then stop while the trip still feels easy.",
        "Dinner in town or Tomales Bay area with a short sunset stop.",
        "The point is a clean weekend rhythm, not an every-stop checklist.",
      ),
      buildItineraryDay(
        "Day 2",
        "Make the main coast walk the first serious move of the day.",
        "Refuel in town instead of forcing a long remote trail lunch.",
        "Pick either another beach or a scenic driving loop, not both.",
        "Slow dinner and West Marin hang time.",
        "This destination gets better when you protect the relaxed tempo.",
      ),
      buildItineraryDay(
        "Day 3",
        "Coffee, one short shoreline stop, and a deliberate early exit.",
        "Optional oyster or bakery stop before leaving the peninsula.",
        "Head home before the drive starts feeling like a tax.",
        "Arrive back with energy left for the week.",
        "Short trips win here when the return is not rushed.",
      ),
    ],
  },
  {
    slug: "sonoma-coast",
    name: "Sonoma Coast + Jenner",
    region: "North Coast",
    summary:
      "Easiest north coast weekend for bluff walks, tide pools, and winery-town backups without needing a huge drive commitment.",
    currentVerdict:
      "Good current pick when the group wants coast drama with simpler logistics than Big Sur.",
    whyNow:
      "Spring is green, roadside access is easy, and Bodega Bay or Jenner lets you keep the trip scenic even if the weather softens.",
    mainWarning:
      "Wind, cold water, and exposed pull-offs matter more here than the mileage suggests.",
    bestActivity: "Bluff walks + food-town coastal loop",
    seasonalWindow: "Year-round, strongest in spring and early fall",
    palette: ["#2f4346", "#6a8b88", "#c6a36f"],
    driveHours: buildDriveHours(2, 7.1, 9.3, 2.6),
    idealTripLengths: ["weekend", "3-days"],
    collections: ["Coast", "Weekend", "Easygoing"],
    tags: ["Coast", "Easy walks", "Food town", "Scenic drive", "Mixed group"],
    riskBadges: ["Wind risk", "Fog risk", "Weekend crowding"],
    breakdown: buildBreakdown(84, 80, 78, 90, 74, 86, 84, 88),
    activities: [
      buildActivity(
        "Goat Rock and Jenner bluff walks",
        "Easy",
        "Morning",
        "A high-reward stop pattern that works even with one lower-energy traveler.",
      ),
      buildActivity(
        "Bodega Head coastal loop",
        "Easy to moderate",
        "Late morning",
        "Classic scenery with manageable mileage and simple access.",
      ),
      buildActivity(
        "Freestone or Occidental food reset",
        "Very easy",
        "Afternoon",
        "The inland fallback keeps the trip enjoyable if the coast gets windy.",
      ),
    ],
    avoid: [
      "Treating exposed viewpoints like all-day hangout zones if the wind is already strong.",
      "Overcommitting to cold-water beach time without a backup inland stop.",
      "Skipping reservations or backup dinner thinking the coast will stay empty.",
    ],
    suggestedStops: [
      "Bodega Bay",
      "Bodega Head",
      "Jenner river mouth",
      "Goat Rock",
      "Freestone / Occidental inland backup",
    ],
    foodSupport: buildFoodSupport(
      "Bodega Bay + Jenner",
      ["Bodega Bay coffee", "Freestone bakery stop"],
      ["Seafood in Bodega Bay", "Occidental dinner fallback"],
      ["Jenner lookout stops", "Freestone / Occidental town block"],
      "The north coast is strongest when you let the food-town layer carry part of the trip.",
    ),
    lodging: buildLodging(
      "Bodega Bay",
      "Simple access to the shoreline with the best overall logistics",
      "Jenner or Occidental",
      "Jenner is moodier and quieter; Occidental is easier for food but pulls you inland.",
    ),
    planB: buildPlanB(
      "If the exposed coast feels too windy or cold",
      "Shift to shorter bluff walks, Jenner overlooks, and an inland Freestone or Occidental block.",
      "The trip keeps its scenic value while reducing wind exposure and fatigue.",
      "About 30-60 minutes less exposed driving and standing around.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Drive north with one food stop instead of fragmenting the route.",
        "Check in near Bodega Bay and keep lunch close to base.",
        "Use the first afternoon for one easy bluff or harbor stop only.",
        "Seafood dinner or inland fallback if the coast feels raw.",
        "This place works because the logistics stay forgiving.",
      ),
      buildItineraryDay(
        "Day 2",
        "Start on the most exposed viewpoint block before wind picks up.",
        "Lunch back near town rather than forcing a distant loop.",
        "Choose Jenner, Goat Rock, or an inland bakery-town reset.",
        "Keep sunset flexible based on fog and wind.",
        "The best version of this trip is scenic but not overpacked.",
      ),
      buildItineraryDay(
        "Day 3",
        "One final shoreline or cafe block.",
        "Leave the coast while the pace still feels easy.",
        "Drive home with a planned snack stop, not a scramble.",
        "Get back with the trip still feeling restorative.",
        "Weekends on this stretch are won by pacing, not mileage.",
      ),
    ],
  },
  {
    slug: "sequoia-kings",
    name: "Sequoia + Kings Canyon",
    region: "Southern Sierra",
    summary:
      "Strong giant-tree spring trip with less icon crowd pressure than Yosemite, but you have to stay realistic about high-country access.",
    currentVerdict:
      "Good current pick if the group wants big scenery and forest walks without relying on deep snow terrain.",
    whyNow:
      "Giant Forest, foothill color, and lower-elevation forest stops are rewarding right now while the highest routes stay in shoulder season.",
    mainWarning:
      "Road openings and snow still decide how ambitious the Kings Canyon side can be.",
    bestActivity: "Giant sequoias + forest hikes",
    seasonalWindow: "Spring foothills, summer high country, fall shoulder reset",
    palette: ["#21352e", "#56745b", "#c49348"],
    driveHours: buildDriveHours(4.8, 4.5, 6.8, 5.2),
    idealTripLengths: ["3-days", "5-days", "7-days"],
    collections: ["Big trees", "Shoulder season Sierra", "Family-friendly icons"],
    tags: ["National park", "Sequoias", "Easy walks", "Moderate hiking", "Photography"],
    riskBadges: ["Snow risk", "Road condition risk", "Reservation friction"],
    breakdown: buildBreakdown(80, 76, 83, 70, 70, 79, 70, 82),
    activities: [
      buildActivity(
        "Congress Trail or Giant Forest loop",
        "Easy",
        "Morning",
        "High-impact scenery with low technical demand and clear mixed-group value.",
      ),
      buildActivity(
        "Moro Rock and nearby overlooks",
        "Easy to moderate",
        "Late morning",
        "A short, iconic effort block that still feels like a real payoff.",
      ),
      buildActivity(
        "Grant Grove or foothill river reset",
        "Easy",
        "Afternoon",
        "Keeps the trip flexible if the group does not want another long hike.",
      ),
    ],
    avoid: [
      "Planning the whole trip around roads or high-country terrain that may still be in shoulder-season mode.",
      "Assuming the Sequoia and Kings Canyon sides will both support a fully ambitious itinerary.",
      "Treating long park transfer drives like casual add-ons.",
    ],
    suggestedStops: [
      "Giant Forest",
      "Congress Trail",
      "Moro Rock",
      "Grant Grove",
      "Foothill river corridor",
    ],
    foodSupport: buildFoodSupport(
      "Three Rivers + Grant Grove side services",
      ["Three Rivers coffee stop", "Lodgepole / Wuksachi quick-service windows"],
      ["Three Rivers dinner", "Grant Grove lodge fallback"],
      ["Three Rivers riverfront downtime", "Lodge patio reset"],
      "Food support is workable, but this is still a park-first trip rather than a cafe-town trip.",
    ),
    lodging: buildLodging(
      "Three Rivers",
      "Best spring access to Sequoia-side icons and the strongest off-park services",
      "Grant Grove or in-park lodge stay",
      "Closer to grove access on the Kings side, but less flexible if you need a town backup.",
    ),
    planB: buildPlanB(
      "If snow, road status, or fatigue makes the Kings Canyon side feel too ambitious",
      "Keep the trip centered on Giant Forest, Moro Rock, foothill stops, and slower Sequoia-side pacing.",
      "The giant-tree core still carries the value proposition without forcing fragile road moves.",
      "Usually 1-2 hours less driving across the trip.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Arrive through Three Rivers and keep expectations valley-low rather than trying to do everything immediately.",
        "Lunch near the park gateway and settle into the elevation shift.",
        "Use the first afternoon for one grove or overlook block.",
        "Dinner near base and an early stop.",
        "This trip rewards steady pacing more than a huge first day.",
      ),
      buildItineraryDay(
        "Day 2",
        "Make the giant-tree zone the main morning block.",
        "Refuel before choosing whether a second icon stop still feels worthwhile.",
        "Use the afternoon for either Moro Rock or a quieter forest walk.",
        "Return to base before park driving fatigue stacks up.",
        "The best version is memorable but still disciplined.",
      ),
      buildItineraryDay(
        "Day 3",
        "One final easy grove or foothill stop.",
        "Begin the exit before the road day turns heavy.",
        "Drive home with one practical food stop.",
        "Arrive with the trip feeling complete instead of squeezed.",
        "Strong mountain trips still need a clean ending.",
      ),
    ],
  },
  {
    slug: "big-bear",
    name: "Big Bear Lake",
    region: "Southern Mountains",
    summary:
      "Best Southern California four-season mountain answer for easy lake access, cabins, and a true weekend feel.",
    currentVerdict:
      "Good current pick for LA or San Diego groups that want alpine air without a huge drive burden.",
    whyNow:
      "Shoulder-season crowds are lighter, the lake-town format still works if hiking gets trimmed, and late snow can still make the setting feel alpine.",
    mainWarning:
      "Cold mornings and occasional late snow can make higher trail plans less clean than the town forecast suggests.",
    bestActivity: "Lake loop + easy mountain days",
    seasonalWindow: "Four seasons, strongest in summer-fall and snow weekends",
    palette: ["#20384d", "#5d7f95", "#c89e55"],
    driveHours: buildDriveHours(7.1, 2.2, 2.7, 8),
    idealTripLengths: ["weekend", "3-days", "5-days"],
    collections: ["Southern California mountains", "Cabin weekend", "Mixed group"],
    tags: ["Lake", "Cabins", "Easy walks", "Snow shoulder", "Family-friendly"],
    riskBadges: ["Snow risk", "Weekend traffic", "Crowding risk"],
    breakdown: buildBreakdown(79, 78, 79, 85, 72, 85, 82, 84),
    activities: [
      buildActivity(
        "Alpine Pedal Path or shoreline loop",
        "Easy",
        "Morning",
        "A low-stress start that still feels like a real mountain trip.",
      ),
      buildActivity(
        "Castle Rock or one short pine hike",
        "Easy to moderate",
        "Late morning",
        "Gives active travelers one satisfying effort block without dominating the day.",
      ),
      buildActivity(
        "Village or lakefront reset",
        "Very easy",
        "Afternoon",
        "Lets the easygoing track stay engaged instead of waiting around.",
      ),
    ],
    avoid: [
      "Treating every higher-elevation trail as summer-clean just because the lake town is easy.",
      "Arriving late on a peak weekend and expecting parking to stay effortless.",
      "Packing the trip too tightly when the town itself is part of the value.",
    ],
    suggestedStops: [
      "Big Bear Village",
      "Boulder Bay",
      "Alpine Pedal Path",
      "Castle Rock zone",
      "Stanfield Marsh or lake edge viewpoints",
    ],
    foodSupport: buildFoodSupport(
      "Big Bear Lake + Big Bear Village",
      ["Village coffee stop", "Bakery and breakfast options"],
      ["Village dinner strip", "Lakeside casual fallback"],
      ["Lakefront strolls", "Cabin deck downtime", "Village browsing"],
      "This is one of the best Southern California mountain options for mixed-energy groups because town support is real.",
    ),
    lodging: buildLodging(
      "Big Bear Lake village side",
      "Walkable dinner options and the easiest lake access",
      "Fawnskin or Moonridge",
      "Quieter and more cabin-forward, but less convenient for food-first groups.",
    ),
    planB: buildPlanB(
      "If higher trails are icy, snowy, or too windy",
      "Keep the trip to lakefront loops, village time, scenic drives, and one short lower-elevation hike.",
      "The town-and-lake format still feels complete even with less trail mileage.",
      "Roughly 1-2 fewer hiking hours and less road stress.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Arrive early enough to avoid turning the mountain road into the whole day.",
        "Lunch near the village and settle into the slower pace.",
        "Use the first afternoon for the lakefront or one easy loop.",
        "Dinner in town and a relaxed evening by the cabin or shoreline.",
        "This trip wins by feeling easy quickly.",
      ),
      buildItineraryDay(
        "Day 2",
        "Make the main active block the first thing in the day.",
        "Come back to town for lunch instead of forcing a remote trail schedule.",
        "Use the afternoon for the village, lake views, or a short second stop.",
        "Low-key dinner and downtime.",
        "The town should absorb some of the trip load, not compete with it.",
      ),
      buildItineraryDay(
        "Day 3",
        "One final shoreline or breakfast stop.",
        "Leave before traffic turns the exit into a slog.",
        "Drive home with one clean break instead of lots of short stops.",
        "Keep the return easy enough that the weekend still feels restorative.",
        "Mountain weekends are judged by the exit as much as the peak moment.",
      ),
    ],
  },
  {
    slug: "angeles-crest",
    name: "Angeles Crest + Mt. Baldy",
    region: "Southern Mountains",
    summary:
      "Best LA-area mountain reset when the group wants pines, cooler air, and a real elevation change without booking a long trip.",
    currentVerdict:
      "Useful current option for a short escape, but it is more condition-sensitive than Big Bear.",
    whyNow:
      "Spring can feel excellent on lower and mid-elevation stops, and the route works well for a single scenic day plus one short hike.",
    mainWarning:
      "Snow pockets, wind, and road notices can make higher stops much less reliable than the city weather implies.",
    bestActivity: "Scenic mountain drive + pine hikes",
    seasonalWindow: "Late spring through fall, with winter and early spring caution",
    palette: ["#22333b", "#5e7768", "#b47a43"],
    driveHours: buildDriveHours(6.4, 1.2, 3.3, 7.1),
    idealTripLengths: ["weekend", "3-days"],
    collections: ["LA quick escape", "Mountains", "Scenic drive"],
    tags: ["National forest", "Scenic drive", "Moderate hiking", "Pines", "Day-trip friendly"],
    riskBadges: ["Road closure risk", "Snow risk", "Wind risk"],
    breakdown: buildBreakdown(74, 72, 79, 92, 66, 73, 66, 82),
    activities: [
      buildActivity(
        "Mt. Wilson or lower crest overlook stops",
        "Very easy",
        "Morning",
        "A clean scenic win that does not depend on a huge trail commitment.",
      ),
      buildActivity(
        "One short pine-forest hike or lower Baldy-area trail",
        "Moderate",
        "Late morning",
        "Gives active travelers a real outdoor block while keeping bailout options nearby.",
      ),
      buildActivity(
        "Wrightwood or foothill cafe reset",
        "Very easy",
        "Afternoon",
        "Useful if the group wants the mountain mood but not another exposed stop.",
      ),
    ],
    avoid: [
      "Using city weather as your condition model for high-elevation routes.",
      "Assuming every crest road and trail segment is equally open or pleasant.",
      "Packing the day too tightly when the strength here is short-notice flexibility.",
    ],
    suggestedStops: [
      "Mt. Wilson side viewpoints",
      "Angeles Crest pull-offs",
      "Mt. Baldy lower trail zone",
      "Wrightwood",
      "Lower forest picnic or creek stop",
    ],
    foodSupport: buildFoodSupport(
      "La Canada + Wrightwood",
      ["Foothill coffee stop", "Wrightwood cafe stop"],
      ["Wrightwood dinner", "Pasadena return-night fallback"],
      ["Scenic pull-offs", "Foothill town hangout"],
      "This is not a deep food-town trip, but it does have enough backup structure for short outings.",
    ),
    lodging: buildLodging(
      "Wrightwood",
      "The strongest mountain-town feeling and easiest overnight version",
      "Pasadena or La Canada day-trip base",
      "Much simpler logistics, but you lose the overnight mountain reset feeling.",
    ),
    planB: buildPlanB(
      "If higher roads, snow, or wind make the crest feel fragile",
      "Keep the trip to lower-elevation overlooks, one short hike, and a Wrightwood or Pasadena town block.",
      "You still get the mountain contrast without overcommitting to unstable terrain.",
      "Usually 1 hour less mountain driving.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Climb out of LA early enough that the first scenic block still feels calm.",
        "Pause for lunch near the foothills or Wrightwood rather than pushing every overlook.",
        "Choose one main scenic corridor and stop while the day still feels clean.",
        "Dinner near base with a short evening reset.",
        "The best version is focused, not sprawling.",
      ),
      buildItineraryDay(
        "Day 2",
        "Main hike or overlook block while temperatures and wind are most reasonable.",
        "Refuel near town before deciding whether a second mountain segment still adds value.",
        "Use the afternoon for a shorter scenic block only.",
        "Keep the evening simple.",
        "A light touch usually beats an overbuilt alpine schedule here.",
      ),
      buildItineraryDay(
        "Day 3",
        "Coffee and one final easy pull-off.",
        "Descend before traffic and fatigue stack up.",
        "Return to the city with a clean closeout meal or home reset.",
        "Let the trip feel like a decompression day by the end.",
        "Short mountain weekends need disciplined exits.",
      ),
    ],
  },
  {
    slug: "shaver-huntington",
    name: "Shaver Lake + Huntington Lake",
    region: "Central Sierra",
    summary:
      "Quiet Sierra lake answer for people who want cabins, pine forests, and easier logistics than Yosemite.",
    currentVerdict:
      "Mixed-to-good current pick in spring; better if the group values atmosphere over ambitious trail mileage.",
    whyNow:
      "The reservoir-and-forest format still works before every high trail is clean, and Shaver gives you a practical cabin base.",
    mainWarning:
      "Snow line and access conditions can still make the Huntington side feel early-season.",
    bestActivity: "Lake country + easy forest hiking",
    seasonalWindow: "Late spring through fall, shoulder-season snow checks",
    palette: ["#234358", "#5f8691", "#bd9256"],
    driveHours: buildDriveHours(4.2, 5, 7.4, 4.1),
    idealTripLengths: ["weekend", "3-days", "5-days"],
    collections: ["Quiet Sierra", "Cabin trip", "Lake day"],
    tags: ["National forest", "Lake", "Cabins", "Easy walks", "Photography"],
    riskBadges: ["Snow risk", "Sparse services", "Shoulder-season access"],
    breakdown: buildBreakdown(72, 72, 74, 78, 68, 80, 74, 86),
    activities: [
      buildActivity(
        "Shaver shoreline or pine loop",
        "Easy",
        "Morning",
        "A strong low-effort mountain start that works even if conditions are mixed higher up.",
      ),
      buildActivity(
        "Dinkey Creek or one short forest trail",
        "Easy to moderate",
        "Late morning",
        "Good active block without relying on the highest snow-sensitive terrain.",
      ),
      buildActivity(
        "Huntington overlook drive",
        "Very easy",
        "Afternoon",
        "Useful if the group wants scenery more than another hike.",
      ),
    ],
    avoid: [
      "Planning the whole trip around the highest, least reliable access points.",
      "Expecting dense dining or nightlife options once you are settled in.",
      "Treating remote lake roads like they will all feel summer-ready.",
    ],
    suggestedStops: [
      "Shaver Lake village",
      "Shaver shoreline access",
      "Dinkey Creek lower area",
      "Huntington Lake viewpoints",
      "One quiet forest road scenic stop",
    ],
    foodSupport: buildFoodSupport(
      "Shaver Lake",
      ["Shaver coffee stop", "Cabin breakfast setup"],
      ["Shaver village casual dinner", "Fresno-bound fallback if needed on the last day"],
      ["Cabin deck downtime", "Lake edge picnic stop"],
      "This is a scenery-and-cabin trip first; the town support is serviceable but not the main draw.",
    ),
    lodging: buildLodging(
      "Shaver Lake",
      "Best mix of access, cabin inventory, and lower-friction shoulder-season logistics",
      "Huntington Lake",
      "Closer to the wilder side of the trip, but more exposed to access swings and thinner services.",
    ),
    planB: buildPlanB(
      "If snow or road uncertainty makes the upper lake side feel too fragile",
      "Keep the trip centered on Shaver, lower forest trails, cabin time, and scenic drives only as conditions allow.",
      "The quiet-mountain value is still intact even with less mileage.",
      "Usually 1-2 hours less driving and less uncertainty.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Drive in with groceries or cabin supplies already handled where possible.",
        "Check in and keep the first outing close to Shaver.",
        "Use the late afternoon for shoreline time, not a long transfer.",
        "Simple dinner and early night.",
        "The whole point is to reach mountain calm quickly.",
      ),
      buildItineraryDay(
        "Day 2",
        "Take the main hike or creek block in the morning.",
        "Refuel back near base before deciding whether Huntington still makes sense for the afternoon.",
        "If conditions are mixed, choose the scenic drive over forcing more trail time.",
        "Cabin evening or village dinner.",
        "This destination pays off when you protect the relaxed cabin rhythm.",
      ),
      buildItineraryDay(
        "Day 3",
        "Slow breakfast and one final pine or shoreline stop.",
        "Pack up without turning the return into a scramble.",
        "Head home with one practical food break.",
        "Let the last day feel like a landing, not another push.",
        "Forest weekends are better when the closeout is simple.",
      ),
    ],
  },
  {
    slug: "mount-shasta",
    name: "Mt. Shasta + McCloud",
    region: "North State",
    summary:
      "Best North State volcano-town trip for waterfalls, mountain views, and a real small-town base.",
    currentVerdict:
      "Mixed-to-good in mid-spring: the scenery is here now, but full alpine access still depends on elevation.",
    whyNow:
      "McCloud falls, volcanic views, and the town base carry the trip even before summer access is fully open.",
    mainWarning:
      "Snow and route conditions still shape how far into alpine terrain you can reasonably commit.",
    bestActivity: "Waterfalls + volcano viewpoints",
    seasonalWindow: "Late spring through fall, with winter town-only mode",
    palette: ["#1d3440", "#63818b", "#d2a766"],
    driveHours: buildDriveHours(5, 9.5, 11.7, 3.8),
    idealTripLengths: ["3-days", "5-days", "7-days"],
    collections: ["North State", "Volcanic scenery", "Town + nature"],
    tags: ["Volcano", "Waterfalls", "Mountain town", "Photography", "Moderate hiking"],
    riskBadges: ["Snow risk", "Road condition risk", "Sparse services"],
    breakdown: buildBreakdown(72, 74, 80, 66, 70, 76, 74, 84),
    activities: [
      buildActivity(
        "McCloud Falls sequence",
        "Easy",
        "Morning",
        "Classic high-reward stops that still work in shoulder season.",
      ),
      buildActivity(
        "Mount Shasta town + viewpoint circuit",
        "Very easy",
        "Late morning",
        "Keeps the trip valuable even if higher alpine moves are not sensible.",
      ),
      buildActivity(
        "Siskiyou Lake or Castle-area scenic block",
        "Easy to moderate",
        "Afternoon",
        "Flexible depending on road and snow conditions.",
      ),
    ],
    avoid: [
      "Planning the whole trip as if high-alpine road access is already summer-clean.",
      "Skipping service planning because the town looks easy on the map.",
      "Forcing too many remote segments into one day in the north state.",
    ],
    suggestedStops: [
      "Mount Shasta town",
      "McCloud Falls",
      "Siskiyou Lake",
      "Volcanic viewpoint pull-offs",
      "Castle-area optional stop",
    ],
    foodSupport: buildFoodSupport(
      "Mount Shasta + McCloud",
      ["Town coffee roaster stop", "Bakery or breakfast cafe"],
      ["Mount Shasta dinner strip", "McCloud inn fallback"],
      ["Bookshop or brewery downtime", "Town stroll"],
      "This has a better small-town support layer than most remote mountain destinations in the state.",
    ),
    lodging: buildLodging(
      "Mount Shasta",
      "The best overall base for food, services, and scenic access",
      "McCloud",
      "Quieter and more atmospheric, but thinner for flexible dinners and backups.",
    ),
    planB: buildPlanB(
      "If alpine roads or snow make the bigger mountain plan too fragile",
      "Keep the trip to McCloud Falls, town blocks, Siskiyou Lake, and lower scenic drives.",
      "The mountain still dominates the experience without forcing high exposure.",
      "Usually 1-2 hours less driving and condition uncertainty.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Arrive with time for one town or lake block instead of scattering stops on the way in.",
        "Settle into Mount Shasta before committing to any longer out-and-back.",
        "Use the first afternoon for one easy viewpoint or lake stop.",
        "Dinner in town and early rest.",
        "North-state travel days are better when you do less on arrival.",
      ),
      buildItineraryDay(
        "Day 2",
        "Make the waterfall run the main morning move.",
        "Refuel before deciding how much additional road time still makes sense.",
        "Pick either another scenic drive or a town reset, not both.",
        "Slow evening with the mountain still in view.",
        "This trip rewards clean choices more than maximum mileage.",
      ),
      buildItineraryDay(
        "Day 3",
        "Coffee, one last easy stop, and a timely exit.",
        "Begin the return while you still have energy.",
        "Use one practical lunch stop and keep the road day efficient.",
        "Arrive home before the trip starts feeling remote in a bad way.",
        "Farther north destinations need cleaner endings than close-in weekends.",
      ),
    ],
  },
  {
    slug: "lassen",
    name: "Lassen Volcanic",
    region: "North State",
    summary:
      "Best volcano-and-geothermal summer target in the north state, but spring is still a cautious scouting window.",
    currentVerdict:
      "Not ideal as a full alpine trip right now, though lower-elevation stops can still work for a very specific group.",
    whyNow:
      "The scenery is still compelling, but this is more of a shoulder-season scouting trip than a clean mainstream answer in mid-April.",
    mainWarning:
      "Snowpack and road openings are the whole story here; do not plan this like summer Lassen.",
    bestActivity: "Hydrothermal stops + volcano viewpoints",
    seasonalWindow: "Summer through early fall, spring only for selective lower stops",
    palette: ["#2a3038", "#6f7d86", "#c99a56"],
    driveHours: buildDriveHours(4.2, 8.6, 10.8, 3),
    idealTripLengths: ["3-days", "5-days", "7-days"],
    collections: ["North State", "Volcanic scenery", "Shoulder season"],
    tags: ["National park", "Volcano", "Hydrothermal", "Road trip", "Photography"],
    riskBadges: ["Snow risk", "Road closure risk", "Sparse services"],
    breakdown: buildBreakdown(58, 62, 72, 68, 66, 64, 58, 76),
    activities: [
      buildActivity(
        "Accessible south-entrance scenic stops",
        "Very easy",
        "Morning",
        "Best current way to get volcano scenery without pretending the park is fully open.",
      ),
      buildActivity(
        "Manzanita Lake or accessible hydrothermal area",
        "Easy",
        "Midday",
        "A selective block that can still feel worthwhile in shoulder season.",
      ),
      buildActivity(
        "Burney or lower-elevation regional stop",
        "Easy",
        "Afternoon",
        "Useful if the park itself feels too snow-constrained for a full day.",
      ),
    ],
    avoid: [
      "Building a summer-style multi-stop Lassen itinerary in April.",
      "Assuming park roads, boardwalks, and trailheads are all meaningfully open.",
      "Going in without a backup lower-elevation day structure.",
    ],
    suggestedStops: [
      "South entrance viewpoints",
      "Manzanita Lake area",
      "Accessible hydrothermal zone",
      "Mineral",
      "Lower-elevation regional fallback stop",
    ],
    foodSupport: buildFoodSupport(
      "Mineral + Chester + Redding-side fallback",
      ["Roadside coffee or diner stop", "Pack-ahead breakfast is smarter here"],
      ["Chester or Redding return-night dinner"],
      ["Lake stop", "Lodge patio or scenic pull-off"],
      "Services are thin enough that this should be treated as a park-and-road trip, not a town trip.",
    ),
    lodging: buildLodging(
      "Mineral or south-entrance stay",
      "Best for early park access when the open terrain is limited",
      "Chester",
      "Better services and flexibility, but adds more driving to every park block.",
    ),
    planB: buildPlanB(
      "If the park still feels too snowbound for a satisfying main day",
      "Keep the trip to accessible lower-elevation stops and fold in one regional scenic lake or forest block.",
      "You avoid forcing a fragile alpine plan while still using the north-state travel effort well.",
      "Varies, but often 1-2 fewer hours inside the park itself.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Treat the arrival like a travel day with one selective scenic block only.",
        "Check current road status before setting the next day's structure.",
        "Keep the afternoon to one easy accessible area.",
        "Early dinner and early stop.",
        "This place punishes optimistic assumptions in spring.",
      ),
      buildItineraryDay(
        "Day 2",
        "Use the most accessible scenic zone while conditions are clearest.",
        "Eat near base rather than losing time to long service gaps.",
        "Add one lower-elevation scenic block only if it still feels clean.",
        "Reset early.",
        "Shoulder-season Lassen is about selective wins, not total coverage.",
      ),
      buildItineraryDay(
        "Day 3",
        "Take one final easy viewpoint if conditions still support it.",
        "Begin the return without trying to salvage every missed stop.",
        "Use the exit route for one practical meal break.",
        "Keep the road day efficient.",
        "This trip is best framed as a scouting-quality shoulder-season play.",
      ),
    ],
  },
  {
    slug: "redwoods",
    name: "Redwood National + Prairie Creek",
    region: "Far North Coast",
    summary:
      "Best far-north giant-tree answer for cool-weather walking, family pace, and dramatic scenery without hard hiking.",
    currentVerdict:
      "Good current pick if the group is comfortable with a longer drive in exchange for a very forgiving trip structure.",
    whyNow:
      "Redwood groves, ferny trails, and coastal overlooks all work well in spring even when the weather stays cool and damp.",
    mainWarning:
      "Long driving days and damp weather are a bigger drag than trail difficulty here.",
    bestActivity: "Redwood groves + coast overlooks",
    seasonalWindow: "Year-round, strongest in spring through fall",
    palette: ["#1e2e26", "#4f7257", "#b68a50"],
    driveHours: buildDriveHours(5.5, 10.6, 12.7, 6),
    idealTripLengths: ["3-days", "5-days", "7-days"],
    collections: ["North Coast", "Giant trees", "Family-friendly"],
    tags: ["Redwoods", "Coast", "Easy walks", "Photography", "Cool weather"],
    riskBadges: ["Long drive", "Fog risk", "Wet-weather risk"],
    breakdown: buildBreakdown(83, 80, 82, 58, 74, 84, 70, 88),
    activities: [
      buildActivity(
        "Lady Bird Johnson Grove or similar grove walk",
        "Easy",
        "Morning",
        "The redwood payoff is huge without asking much physically.",
      ),
      buildActivity(
        "Prairie Creek / Elk Prairie loop",
        "Easy to moderate",
        "Late morning",
        "Gives active travelers a real forest block while staying accessible.",
      ),
      buildActivity(
        "Trinidad or coastal overlook stop",
        "Very easy",
        "Afternoon",
        "Useful if the group wants a second mood without another long trail.",
      ),
    ],
    avoid: [
      "Underestimating how much the far-north drive shapes the quality of the trip.",
      "Packing too many grove changes into one day when one or two great ones are enough.",
      "Expecting warm beach time just because there is a coast layer.",
    ],
    suggestedStops: [
      "Lady Bird Johnson Grove",
      "Prairie Creek",
      "Elk Prairie",
      "Trinidad",
      "One redwood-over-coast scenic pull-off",
    ],
    foodSupport: buildFoodSupport(
      "Trinidad + Arcata",
      ["Trinidad coffee stop", "Arcata bakery or cafe"],
      ["Trinidad dinner", "Arcata town fallback"],
      ["Harbor or bluff stops", "Arcata plaza hangout"],
      "The town layer is enough to keep this far-north trip comfortable, but the redwood and coast scenery are still the main event.",
    ),
    lodging: buildLodging(
      "Trinidad",
      "Best mix of coast mood and access to the groves",
      "Arcata",
      "More services and easier dinner flexibility, but slightly less special as a base.",
    ),
    planB: buildPlanB(
      "If weather turns colder or wetter than expected",
      "Keep the trip to short grove walks, coastal pull-offs, and a stronger Arcata or Trinidad town block.",
      "The destination still works well in short bursts because the scenery starts almost at the parking lot.",
      "Usually 1-2 fewer outdoor hours, but the trip remains viable.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Respect the long northern drive and arrive with one short grove stop in mind.",
        "Settle near Trinidad or Arcata before trying to chase more scenery.",
        "Use the late afternoon for a short redwood or bluff block only.",
        "Early dinner and reset.",
        "The long approach means day one should stay disciplined.",
      ),
      buildItineraryDay(
        "Day 2",
        "Make one major grove zone the center of the day.",
        "Come back toward town for lunch instead of stacking remote stops.",
        "Choose either a second forest block or a coast overlook, not every option.",
        "Slow dinner and cool-weather hang time.",
        "This place feels richest when you let the forest absorb the tempo.",
      ),
      buildItineraryDay(
        "Day 3",
        "One last short grove or harbor stop.",
        "Begin the return while the trip still feels calm.",
        "Use the road day efficiently.",
        "Keep the drive from erasing the recovery effect.",
        "Farther destinations need cleaner exits than nearby getaways.",
      ),
    ],
  },
  {
    slug: "klamath",
    name: "Klamath National Forest + Etna",
    region: "Far North Interior",
    summary:
      "Quiet far-north forest trip for river canyons, sparse crowds, and people who want true outdoors over polished tourism.",
    currentVerdict:
      "Mixed current pick: strong for the right self-directed traveler, weaker for groups that need dense services.",
    whyNow:
      "Snow is easing on lower forest roads, river corridors are scenic, and the region stays uncrowded compared with the more famous parks.",
    mainWarning:
      "Service gaps and variable road conditions mean this trip rewards planning more than spontaneity.",
    bestActivity: "Forest rivers + backroad scenery",
    seasonalWindow: "Late spring through fall, limited winter and early spring access",
    palette: ["#233028", "#58724c", "#b48752"],
    driveHours: buildDriveHours(5.8, 10.8, 13, 5.1),
    idealTripLengths: ["3-days", "5-days", "7-days"],
    collections: ["North State backcountry", "Quiet forest", "Self-directed trip"],
    tags: ["National forest", "Rivers", "Remote", "Moderate hiking", "Camping"],
    riskBadges: ["Sparse services", "Road condition risk", "Snow risk"],
    breakdown: buildBreakdown(68, 70, 75, 50, 68, 64, 56, 78),
    activities: [
      buildActivity(
        "Scott Valley or river overlook circuit",
        "Easy",
        "Morning",
        "Good scenery payoff without committing too fast to rougher access.",
      ),
      buildActivity(
        "Lower trail into the Marble Mountains edge",
        "Moderate",
        "Late morning",
        "A real forest effort block for active groups without forcing the most remote terrain.",
      ),
      buildActivity(
        "Etna town reset",
        "Very easy",
        "Afternoon",
        "Important because the region is sparse enough that one usable town block matters.",
      ),
    ],
    avoid: [
      "Treating this like a polished tourism trip with dense services everywhere.",
      "Going in without backup route research on forest roads.",
      "Packing too much mileage into a region where even simple transfers can take time.",
    ],
    suggestedStops: [
      "Etna",
      "Scott Valley overlook",
      "Klamath river corridor viewpoint",
      "Marble Mountains lower access",
      "Quiet forest road scenic stop",
    ],
    foodSupport: buildFoodSupport(
      "Etna + Yreka",
      ["Etna coffee stop", "Small-town breakfast stop"],
      ["Etna dinner", "Yreka fallback on arrival or exit"],
      ["Small-town main street block", "River or meadow downtime"],
      "This is enough support for self-directed travelers, but not a destination you choose for dining depth.",
    ),
    lodging: buildLodging(
      "Etna",
      "Best small-town base for accessing the forest without feeling too stripped down",
      "Yreka",
      "More practical services, but less atmospheric and farther from the best scenery blocks.",
    ),
    planB: buildPlanB(
      "If higher access or forest roads feel too uncertain",
      "Keep the trip to Scott Valley, river viewpoints, Etna, and short lower-elevation walks only.",
      "You still get the uncrowded north-state mood without gambling on remote road quality.",
      "Usually 1-2 fewer hours of backroad driving.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Treat the approach as a real north-state road day.",
        "Check in and learn the local condition picture before building the next morning too aggressively.",
        "Use the late afternoon for one valley or town block only.",
        "Simple dinner and rest.",
        "This trip rewards patience more than ambition.",
      ),
      buildItineraryDay(
        "Day 2",
        "Do the main forest or river block in the morning while everything still feels clear and manageable.",
        "Come back toward town for lunch and route reassessment.",
        "Use the afternoon for a shorter scenic leg, not another huge push.",
        "Quiet evening.",
        "Remote regions usually feel better when the day has one center of gravity.",
      ),
      buildItineraryDay(
        "Day 3",
        "One final river or valley stop.",
        "Start the exit without trying to salvage every missed option.",
        "Use Yreka or a highway town for a practical final meal.",
        "Keep the road home efficient.",
        "Backcountry-minded weekends still need a smooth closeout.",
      ),
    ],
  },
  {
    slug: "channel-islands",
    name: "Channel Islands",
    region: "Southern Coast",
    summary:
      "Unique Southern California island option when the group wants one memorable outdoor day rather than a heavy hotel-and-driving loop.",
    currentVerdict:
      "Strong special-occasion pick if ferry timing is acceptable and the group wants something distinctly different from a normal coast weekend.",
    whyNow:
      "Spring often brings clear hiking weather, greener island slopes, and wildlife payoff before hotter inland trips become necessary.",
    mainWarning:
      "This trip depends on ferry timing, wind, and sea conditions more than a normal drive destination.",
    bestActivity: "Island day hiking + wildlife spotting",
    seasonalWindow: "Spring and fall are strongest; summer also works with ferry planning",
    palette: ["#214152", "#5a8696", "#d4b170"],
    driveHours: buildDriveHours(6, 1.8, 3.5, 6.9),
    idealTripLengths: ["weekend", "3-days"],
    collections: ["Island day trip", "Southern California coast", "Photography"],
    tags: ["National park", "Island", "Wildlife", "Moderate hiking", "Day-trip friendly"],
    riskBadges: ["Ferry dependency", "Wind risk", "Limited services"],
    breakdown: buildBreakdown(84, 78, 82, 80, 72, 68, 60, 76),
    activities: [
      buildActivity(
        "Scorpion-area hike or lookout loop",
        "Easy to moderate",
        "Morning",
        "The signature island block with the best payoff-to-logistics ratio.",
      ),
      buildActivity(
        "Cavern Point style bluff walk",
        "Easy",
        "Midday",
        "High scenery and wildlife potential without turning the island day into a sufferfest.",
      ),
      buildActivity(
        "Ventura harbor recovery block",
        "Very easy",
        "Evening",
        "Important because the ferry schedule makes the mainland base part of the trip experience.",
      ),
    ],
    avoid: [
      "Treating the ferry like a casual add-on instead of the trip's key operational constraint.",
      "Planning the island day as if there will be dense food or shelter options once you land.",
      "Ignoring wind or sea forecasts until the morning of departure.",
    ],
    suggestedStops: [
      "Ventura Harbor",
      "Scorpion Anchorage side",
      "Island bluff overlook",
      "Wildlife / harbor view block",
      "Ventura town backup",
    ],
    foodSupport: buildFoodSupport(
      "Ventura + Oxnard Harbor",
      ["Ventura coffee stop", "Harbor breakfast window"],
      ["Ventura dinner", "Oxnard harbor fallback"],
      ["Harbor walk", "Ventura beachfront downtime"],
      "The island itself is the value, so mainland food support should be handled cleanly around the ferry plan.",
    ),
    lodging: buildLodging(
      "Ventura",
      "Strongest ferry logistics and the best overall pre/post-island rhythm",
      "Oxnard or Camarillo",
      "More inventory in some cases, but less elegant for a harbor-based trip flow.",
    ),
    planB: buildPlanB(
      "If wind, swell, or ferry operations make the island day too fragile",
      "Shift to a Ventura coast day, the Channel Islands visitor center, harbor time, and a nearby shoreline loop.",
      "You preserve the Southern California coast mood without burning the whole weekend on a failed island attempt.",
      "The day becomes much lower-friction and saves several hours of ferry logistics.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Reach Ventura early enough that the harbor still feels calm rather than rushed.",
        "Handle ferry logistics and keep lunch close to base.",
        "Use the afternoon for a harbor or short mainland coast block.",
        "Early dinner and sleep before the island day.",
        "This destination works best when the operation is clean.",
      ),
      buildItineraryDay(
        "Day 2",
        "Make the island day the unquestioned center of gravity.",
        "Keep food, water, and turnaround timing disciplined.",
        "Use the return ferry as part of the pacing, not dead time.",
        "Easy harbor dinner and reset.",
        "The point is one memorable outdoor day, not endless add-ons.",
      ),
      buildItineraryDay(
        "Day 3",
        "Choose one gentle coast or breakfast block.",
        "Leave Ventura without turning the final day into another operation.",
        "Drive home or to the next city stop cleanly.",
        "Keep the end simple.",
        "Special-format trips feel better when the closeout stays light.",
      ),
    ],
  },
  {
    slug: "point-loma-cabrillo",
    name: "Point Loma + Cabrillo",
    region: "Southern Coast",
    summary:
      "Lowest-friction San Diego outdoor pick for ocean views, tide pools, and a weekday or weekend reset that still feels intentional.",
    currentVerdict:
      "Excellent current pick for San Diego locals or any group that wants outdoor time without a heavy logistics day.",
    whyNow:
      "Spring coastal weather, easy access, and Cabrillo's viewpoint-and-tidepool mix make this one of the state's easiest good-now answers.",
    mainWarning:
      "Wind and crowding around the monument and tide pools can compress the best hours.",
    bestActivity: "Coastal viewpoints + tide pools",
    seasonalWindow: "Year-round, especially spring and early fall",
    palette: ["#213a49", "#6b90a2", "#d8aa63"],
    driveHours: buildDriveHours(8.2, 2.5, 0.3, 8.6),
    idealTripLengths: ["weekend", "3-days"],
    collections: ["Weekday micro-trip", "South Coast", "Easy walks"],
    tags: ["National monument", "Coast", "Easy walks", "Photography", "Family-friendly"],
    riskBadges: ["Crowding risk", "Wind risk"],
    breakdown: buildBreakdown(89, 85, 76, 95, 78, 90, 88, 92),
    activities: [
      buildActivity(
        "Cabrillo tide pools and viewpoints",
        "Easy",
        "Morning",
        "A very high reward block with almost no travel burden once you are in San Diego.",
      ),
      buildActivity(
        "Bayside Trail or harbor walk",
        "Easy to moderate",
        "Late morning",
        "Adds real outdoor movement without making the day feel like a hike trip.",
      ),
      buildActivity(
        "Liberty Station or Little Italy reset",
        "Very easy",
        "Afternoon",
        "Useful for food-first or mixed groups who want the day to stay easy.",
      ),
    ],
    avoid: [
      "Treating peak crowd windows at Cabrillo like they will self-resolve.",
      "Assuming exposed coastline time will feel comfortable all day if wind rises.",
      "Overcomplicating a destination whose whole strength is low-friction pacing.",
    ],
    suggestedStops: [
      "Cabrillo viewpoint zone",
      "Tide pools",
      "Bayside Trail",
      "Shelter Island or harbor block",
      "Liberty Station or Little Italy",
    ],
    foodSupport: buildFoodSupport(
      "Point Loma + Liberty Station",
      ["Point Loma coffee", "Liberty Station bakery stop"],
      ["Point Loma seafood", "Little Italy fallback"],
      ["Harbor walk", "Sunset Cliffs add-on", "Liberty Station hangout"],
      "This is one of the strongest low-effort coastal options in California because the city backup is immediate.",
    ),
    lodging: buildLodging(
      "Point Loma",
      "Best access to the monument, harbor, and easy dinners",
      "Little Italy / downtown San Diego",
      "More hotel inventory and nightlife, but less calm and slightly more driving.",
    ),
    planB: buildPlanB(
      "If Cabrillo is windy or too crowded at the key hours",
      "Shift to harbor walks, Liberty Station, Sunset Cliffs, and shorter viewpoint hits only.",
      "The coastal mood survives easily because the city offers multiple low-friction alternatives.",
      "Usually 30-60 minutes less waiting and parking stress.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Arrive in San Diego and keep the first outdoor block very light.",
        "Lunch near Point Loma or Liberty Station.",
        "Use the afternoon for harbor or cliffside scenery.",
        "Dinner nearby with no pressure to cover everything.",
        "This place is strongest when it stays unforced.",
      ),
      buildItineraryDay(
        "Day 2",
        "Start with Cabrillo while the light and crowd conditions are best.",
        "Refuel close by instead of driving all over the city.",
        "Use the afternoon for a shorter trail or an urban-coastal reset.",
        "Sunset stop if the wind still cooperates.",
        "The trip should feel easy almost the whole time.",
      ),
      buildItineraryDay(
        "Day 3",
        "Breakfast and one final easy viewpoint.",
        "Begin the exit without stacking more sightseeing.",
        "Keep travel simple.",
        "Arrive home or to the next stop with energy left.",
        "This is exactly the kind of place that should not be overplanned.",
      ),
    ],
  },
  {
    slug: "joshua-tree",
    name: "Joshua Tree",
    region: "Southern Desert",
    summary:
      "Classic Southern California desert answer when the group wants high-reward scenery, short hikes, and a strong photography trip.",
    currentVerdict:
      "Still a strong spring pick, but the comfortable window is closing as afternoons warm up.",
    whyNow:
      "Spring light, boulder scenery, and easy-to-moderate trail options are all working before true heat starts to punish casual itineraries.",
    mainWarning:
      "Heat and midday sun are the failure mode; this destination needs early starts and conservative pacing.",
    bestActivity: "Boulders + easy desert hikes",
    seasonalWindow: "October through April",
    palette: ["#5a432e", "#a97a43", "#e2c78b"],
    driveHours: buildDriveHours(8, 2.8, 3.1, 8.8),
    idealTripLengths: ["weekend", "3-days", "5-days"],
    collections: ["Desert window", "Photography", "Weekend iconic"],
    tags: ["National park", "Desert", "Photography", "Easy walks", "Moderate hiking"],
    riskBadges: ["Heat risk", "Crowding risk", "Limited shade"],
    breakdown: buildBreakdown(86, 78, 84, 79, 74, 72, 68, 80),
    activities: [
      buildActivity(
        "Hidden Valley loop",
        "Easy",
        "Morning",
        "One of the best high-payoff desert walks for mixed groups and first-timers.",
      ),
      buildActivity(
        "Barker Dam or short nature trail block",
        "Easy",
        "Late morning",
        "Gives another good desert texture without asking for a huge commitment.",
      ),
      buildActivity(
        "Keys View or sunset photography stop",
        "Very easy",
        "Golden hour",
        "Lets the trip cash in on the best light without more exposure miles.",
      ),
    ],
    avoid: [
      "Midday exposed hiking once temperatures begin climbing.",
      "Treating April like the core winter comfort window.",
      "Assuming the town support inside the park footprint will save a bad timing plan.",
    ],
    suggestedStops: [
      "Hidden Valley",
      "Barker Dam",
      "Keys View",
      "Cap Rock or Jumbo Rocks roadside stops",
      "Joshua Tree town or Pioneertown dinner block",
    ],
    foodSupport: buildFoodSupport(
      "Joshua Tree + Yucca Valley",
      ["Joshua Tree coffee", "Bakery or brunch stop"],
      ["Pioneertown dinner", "Yucca Valley fallback"],
      ["Art-shop block", "Desert motel downtime", "Sunset porch hangout"],
      "The park is the star, but the gateway towns are good enough to keep a 3-day trip resilient.",
    ),
    lodging: buildLodging(
      "Joshua Tree town",
      "Best balance of park access and trip atmosphere",
      "Yucca Valley",
      "More practical inventory and services, but less of the desert-trip mood.",
    ),
    planB: buildPlanB(
      "If heat rises faster than expected",
      "Keep the trip to sunrise walks, scenic drives, town downtime, and sunset viewpoints only.",
      "Joshua Tree still pays off visually if you protect the exposure windows.",
      "About 2-3 fewer exposed daytime hours.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Arrive with enough time for one short golden-hour block, not a full park marathon.",
        "Check in and keep logistics simple.",
        "Use the late afternoon for one easy walk or viewpoint.",
        "Dinner in town and early reset.",
        "Desert pacing should start conservative.",
      ),
      buildItineraryDay(
        "Day 2",
        "Make the main hiking and photo block the early-morning center of gravity.",
        "Come out of the park for a real lunch and rest window.",
        "Use the afternoon only for short scenic stops if conditions still feel good.",
        "Sunset view and easy dinner.",
        "The clock should control the trip, not ambition.",
      ),
      buildItineraryDay(
        "Day 3",
        "One final dawn or breakfast block.",
        "Begin the exit before the warmest stretch matters.",
        "Drive home with one clean stop.",
        "Keep the return simple and shaded where possible.",
        "Desert weekends are best when the last day stays disciplined.",
      ),
    ],
  },
  {
    slug: "anza-borrego",
    name: "Anza-Borrego",
    region: "Southern Desert",
    summary:
      "Best Southern California desert wildcard for short drives, big badlands scenery, and spring-specific bloom or wash color.",
    currentVerdict:
      "Good current pick while the desert window is still open, especially for San Diego and Southern California starts.",
    whyNow:
      "Cool mornings, expansive viewpoints, and flexible scenic drives make this an efficient desert answer before late-spring heat accelerates.",
    mainWarning:
      "Heat ramps quickly here, and sparse services mean casual overextension is a bad bet.",
    bestActivity: "Badlands drives + easy desert walks",
    seasonalWindow: "November through April",
    palette: ["#5f4529", "#b07a3d", "#e1c48a"],
    driveHours: buildDriveHours(9, 3.2, 1.8, 9.7),
    idealTripLengths: ["weekend", "3-days"],
    collections: ["Desert window", "San Diego escape", "Scenic drive"],
    tags: ["State park", "Desert", "Wildflowers", "Scenic drive", "Easy walks"],
    riskBadges: ["Heat risk", "Sparse services", "Flash flood risk"],
    breakdown: buildBreakdown(82, 77, 78, 82, 72, 76, 60, 84),
    activities: [
      buildActivity(
        "Badlands overlook or scenic drive block",
        "Very easy",
        "Sunrise",
        "Huge desert payoff with almost no hiking burden if timed correctly.",
      ),
      buildActivity(
        "Borrego Palm Canyon lower section or slot-style walk",
        "Easy to moderate",
        "Morning",
        "A satisfying active block if it happens before the heat climbs.",
      ),
      buildActivity(
        "Borrego Springs reset",
        "Very easy",
        "Afternoon",
        "Important because the desert value drops fast once everyone is too hot.",
      ),
    ],
    avoid: [
      "Using midday as the main adventure window.",
      "Expecting dense backup services far from Borrego Springs.",
      "Driving deeper into washes or rough roads casually without route confidence.",
    ],
    suggestedStops: [
      "Borrego Springs",
      "Badlands overlook block",
      "Palm Canyon lower trail",
      "Desert scenic drive pull-offs",
      "Small-town meal or shade reset",
    ],
    foodSupport: buildFoodSupport(
      "Borrego Springs",
      ["Coffee and breakfast stop in town"],
      ["Borrego Springs dinner options"],
      ["Pool or patio downtime", "Art and small-town wander"],
      "The town support is simple but enough because the desert day should be short, early, and intentional.",
    ),
    lodging: buildLodging(
      "Borrego Springs",
      "Only real answer for keeping the desert schedule convenient",
      "Julian add-on split stay",
      "More mountain-town charm, but it weakens the sunrise/sunset efficiency inside the desert.",
    ),
    planB: buildPlanB(
      "If heat or wind rises faster than expected",
      "Shift to sunrise and sunset scenic blocks with a long midday town reset.",
      "The park can still feel worthwhile if you stop trying to use the hottest hours.",
      "Usually 2-3 fewer exposed outdoor hours.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Arrive with time for a sunset drive or overlook, not a huge hike.",
        "Check in and orient around the heat curve immediately.",
        "Use the late afternoon for one scenic block only.",
        "Dinner in Borrego Springs and early rest.",
        "The desert asks for discipline from the first day.",
      ),
      buildItineraryDay(
        "Day 2",
        "Make dawn and the early morning the center of the trip.",
        "Get back to town before heat starts owning the day.",
        "Use the afternoon only for a very short scenic block if conditions are still reasonable.",
        "Low-key evening and sunset closeout.",
        "This destination works best in short, well-timed bursts.",
      ),
      buildItineraryDay(
        "Day 3",
        "One last dawn or breakfast stop.",
        "Start the return before the warmest period becomes annoying.",
        "Keep the road day simple.",
        "Arrive home with the desert still feeling like a good idea.",
        "The closeout should protect the trip's overall comfort.",
      ),
    ],
  },
  {
    slug: "mono-lake",
    name: "Mono Lake",
    region: "Eastern Sierra",
    summary:
      "Otherworldly tufa shoreline and 395 corridor scenery — works as a Mammoth add-on or a standalone photography weekend.",
    currentVerdict:
      "Strong shoulder-season pick right now. The lake is open year-round but mid-April hits the sweet spot before summer crowds and before passes melt out.",
    whyNow:
      "Tufa towers photograph well in low spring light, 395 is clear, and Lee Vining's food scene is awake before the Tioga Pass surge.",
    mainWarning:
      "This is a long drive for a small destination. Pair it with Mammoth or a 395 loop, or the math feels thin for a standalone weekend.",
    bestActivity: "Tufa shoreline + 395 scenic drive",
    seasonalWindow: "Spring shoulder, summer paired with Tioga, fall golden",
    palette: ["#2d3a44", "#5d7785", "#e0d0a8"],
    driveHours: buildDriveHours(6.4, 5.8, 7.5, 5.2),
    idealTripLengths: ["3-days", "5-days"],
    collections: ["Eastern Sierra", "Photography"],
    tags: ["Photography", "Scenic drive", "Easy walks", "Non-hiker friendly"],
    riskBadges: ["Long drive", "Wind exposure"],
    breakdown: buildBreakdown(82, 76, 74, 58, 80, 72, 70, 76),
    activities: [
      buildActivity(
        "South Tufa boardwalk + shoreline",
        "Very easy",
        "Golden hour",
        "The main reason to come. Low-effort walk, iconic payoff.",
      ),
      buildActivity(
        "Panum Crater rim loop",
        "Easy",
        "Morning",
        "Short volcanic crater walk that adds scale to the lake view.",
      ),
      buildActivity(
        "395 scenic drive with pull-offs",
        "Very easy",
        "Any time",
        "Turns transit time into content. Mono Vista, Conway Summit, June Lake loop.",
      ),
    ],
    avoid: [
      "Treating Mono Lake as a full weekend by itself without a Mammoth or June Lake anchor.",
      "Skipping Lee Vining food — the town is small but the Mobil Mart / Whoa Nellie Deli is worth the stop.",
      "Wading into the lake without understanding the alkali chemistry.",
    ],
    suggestedStops: [
      "South Tufa",
      "Mono Lake County Park",
      "Panum Crater",
      "June Lake Loop",
      "Lee Vining overlook",
    ],
    foodSupport: buildFoodSupport(
      "Lee Vining",
      ["Latte Da Coffee Cafe", "Mobil Mart / Whoa Nellie Deli"],
      ["Whoa Nellie Deli", "June Lake fallback"],
      ["Mono Lake Committee visitor center", "Lakefront benches"],
      "Lee Vining is small. Bring patience for limited hours; June Lake expands the food radius.",
    ),
    lodging: buildLodging(
      "Lee Vining",
      "Closest base to South Tufa and the visitor center",
      "June Lake",
      "June Lake has more cabin inventory and a better food cluster, with ~20 minutes added drive.",
    ),
    planB: buildPlanB(
      "If wind, dust, or a spring storm makes the shoreline unpleasant",
      "Shift south to June Lake Loop and down into Mammoth town time.",
      "The 395 corridor still carries the trip even if the tufa itself gets skipped.",
      "About an hour of transit moved from lake time into town time.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Drive the 395 corridor with scenic pull-offs instead of pushing through.",
        "Arrive Lee Vining midday and grab a reset lunch.",
        "South Tufa in late afternoon to catch golden hour.",
        "Dinner at Whoa Nellie Deli, early sleep.",
        "Day one is mostly the drive — respect that.",
      ),
      buildItineraryDay(
        "Day 2",
        "Panum Crater rim walk before wind picks up.",
        "June Lake Loop scenic drive with town stops.",
        "Second tufa visit or Mono Lake County Park boardwalk.",
        "Return to Lee Vining for sunset over the lake.",
        "This is the payoff day. Keep it unhurried.",
      ),
      buildItineraryDay(
        "Day 3",
        "Sunrise stop at the lake if energy allows.",
        "Coffee in Lee Vining, then start 395 south or west.",
        "Optional Mammoth stop for lunch and hot springs framing.",
        "Home with a trip that feels bigger than its miles.",
        "Paired with Mammoth, this becomes a complete Eastern Sierra loop.",
      ),
    ],
  },
  {
    slug: "mt-whitney",
    name: "Mt Whitney + Lone Pine",
    region: "Eastern Sierra",
    summary:
      "Highest peak in the contiguous US, Alabama Hills film-country below — the trailhead lottery gates the summit, but the base offers plenty.",
    currentVerdict:
      "Useful right now as an Alabama Hills + Whitney Portal scenic weekend. Not the season to summit — permits and snow make that a July+ decision.",
    whyNow:
      "Alabama Hills is in its best light window, Whitney Portal Road opens at the lower elevations, and Lone Pine town support is active before summer.",
    mainWarning:
      "Do not confuse a Whitney Portal scenic trip with a summit attempt. Permits are lotteried and the peak is still snowbound in April.",
    bestActivity: "Alabama Hills + Whitney Portal scenic drive",
    seasonalWindow: "Spring shoulder for base, summer for summit, fall for photography",
    palette: ["#3d342b", "#7a6855", "#c99b6b"],
    driveHours: buildDriveHours(7.1, 3.8, 5.6, 6.4),
    idealTripLengths: ["3-days", "5-days"],
    collections: ["Eastern Sierra", "Photography"],
    tags: ["Photography", "Scenic drive", "Moderate hiking", "Film history"],
    riskBadges: ["Long drive from Bay", "Snow risk at elevation"],
    breakdown: buildBreakdown(78, 74, 76, 62, 78, 70, 74, 78),
    activities: [
      buildActivity(
        "Alabama Hills Movie Road + Mobius Arch",
        "Very easy",
        "Sunrise or golden hour",
        "Iconic rock formations with direct Whitney backdrop. Non-hiker friendly.",
      ),
      buildActivity(
        "Whitney Portal Road drive to the trailhead",
        "Easy",
        "Morning",
        "Dramatic elevation change with the portal store and waterfall at the top.",
      ),
      buildActivity(
        "Lone Pine Lake day hike (permit-free)",
        "Moderate",
        "Morning",
        "First 2.5 miles of the Whitney trail — no permit required, strong payoff.",
      ),
    ],
    avoid: [
      "Attempting Whitney summit without a permit or out-of-season experience.",
      "Assuming every pull-off has cell service — plan offline.",
      "Treating Lone Pine as a food destination. It's a base town, not a food town.",
    ],
    suggestedStops: [
      "Mobius Arch loop",
      "Movie Road",
      "Whitney Portal Store",
      "Museum of Western Film History",
      "Manzanar National Historic Site",
    ],
    foodSupport: buildFoodSupport(
      "Lone Pine",
      ["Alabama Hills Cafe", "Lone Pine coffee stop"],
      ["Seasons Restaurant", "Whitney Portal Store (seasonal)"],
      ["Film history museum", "Alabama Hills BLM sunset drive"],
      "Lone Pine is functional, not elegant. Bishop 60 miles north expands the food options.",
    ),
    lodging: buildLodging(
      "Lone Pine",
      "Closest town to both Alabama Hills and Whitney Portal Road",
      "Bishop",
      "Bishop is 60 miles north, bigger, with more food. Trades proximity for breadth.",
    ),
    planB: buildPlanB(
      "If Whitney Portal Road has snow closures or winds are severe",
      "Stay low in Alabama Hills, add Manzanar, and loop north to Bishop for food.",
      "The film-country and 395 experience carries the weekend even without portal access.",
      "Drops about 1-2 hours of elevation driving, adds equivalent low-desert scenic time.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "395 drive in with a Manzanar or Mojave stop.",
        "Check into Lone Pine, reset lunch.",
        "Alabama Hills golden hour — Movie Road + Mobius Arch.",
        "Dinner in town, early sleep for sunrise.",
        "Don't overpack day one — the light is the point.",
      ),
      buildItineraryDay(
        "Day 2",
        "Sunrise in Alabama Hills (second session if energy allows).",
        "Whitney Portal Road drive up to the store.",
        "Lone Pine Lake hike if conditions allow, or shorter Portal-area walk.",
        "Return to town, sunset pass through Alabama Hills.",
        "This is the main day. The elevation transitions are the story.",
      ),
      buildItineraryDay(
        "Day 3",
        "Coffee and one last scenic stop.",
        "Drive north to Bishop for lunch, or south toward home.",
        "Scenic 395 return with intentional stops.",
        "Home with a trip that reads as more than a drive.",
        "Consider pairing with Mono Lake for a full Eastern Sierra loop.",
      ),
    ],
  },
  {
    slug: "mendocino",
    name: "Mendocino + Fort Bragg",
    region: "North Coast",
    summary:
      "Victorian coastal village with bluff trails, glass beach, and redwood parks 30 minutes inland — the north-coast answer to Carmel with less polish.",
    currentVerdict:
      "Strong pick right now. Spring wildflowers on the headlands, fog not yet established, and the town is awake before summer traffic.",
    whyNow:
      "Mendocino Headlands is peaking for bluff walks, Van Damme and Russian Gulch redwood parks are accessible, and Fort Bragg food is dependable.",
    mainWarning:
      "Highway 1 drive from the Bay takes longer than it looks — 3.5 hours via 128 is realistic, and late arrival costs you dinner windows.",
    bestActivity: "Headlands bluff walks + coast village",
    seasonalWindow: "Spring wildflowers, summer foggy, fall clear",
    palette: ["#263340", "#3f6874", "#a8c4c0"],
    driveHours: buildDriveHours(3.5, 8.6, 11.2, 4.1),
    idealTripLengths: ["weekend", "3-days", "5-days"],
    collections: ["Coast", "Non-hiker friendly", "Food + town"],
    tags: ["Coast", "Cafe/town", "Easy walks", "Romantic", "Scenic drive"],
    riskBadges: ["Highway 1 drive", "Fog risk"],
    breakdown: buildBreakdown(86, 82, 84, 72, 78, 90, 88, 86),
    activities: [
      buildActivity(
        "Mendocino Headlands bluff loop",
        "Very easy",
        "Late morning",
        "Flat trail along the village bluffs with sea arches and wildflowers.",
      ),
      buildActivity(
        "Russian Gulch waterfall + Fern Canyon",
        "Easy to moderate",
        "Afternoon",
        "Short redwood-canyon walk with a 36-foot waterfall. Great contrast to the coast.",
      ),
      buildActivity(
        "Glass Beach + Fort Bragg coastal trail",
        "Very easy",
        "Golden hour",
        "Low-effort coastal walk with sea-glass history and food-town access.",
      ),
    ],
    avoid: [
      "Trying to do Mendocino as a same-day return — the drive eats the value.",
      "Taking Highway 1 the whole way from Bay Area. 128 through Anderson Valley is faster and prettier.",
      "Skipping Van Damme or Russian Gulch — they make the trip more than just a village visit.",
    ],
    suggestedStops: [
      "Mendocino Headlands State Park",
      "Russian Gulch State Park",
      "Van Damme State Park",
      "Glass Beach",
      "Point Cabrillo Light Station",
    ],
    foodSupport: buildFoodSupport(
      "Mendocino village + Fort Bragg",
      ["Good Life Cafe", "GoodLife Bakery"],
      ["Cafe Beaujolais", "Trillium Cafe", "Fort Bragg seafood spots"],
      ["Dick's Place", "Coast bench stops", "Bookstore + wine bar loop"],
      "Village is intimate and seasonal. Fort Bragg (10 min north) is the pragmatic food backup.",
    ),
    lodging: buildLodging(
      "Mendocino village",
      "Walkable headlands access, Victorian inns, full village mood",
      "Fort Bragg",
      "Fort Bragg has cheaper and broader inventory, but lacks the village atmosphere.",
    ),
    planB: buildPlanB(
      "If fog settles in hard or coastal winds feel punishing",
      "Shift inland to Anderson Valley wineries, Hendy Woods redwoods, and Boonville food.",
      "The 128 corridor has enough structure to salvage a foggy coastal weekend.",
      "Trades 1-2 coast hours for equivalent valley-and-redwood time.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Leave Bay Area mid-morning via 101 + 128 through Anderson Valley.",
        "Lunch in Boonville or Philo, then drop to the coast.",
        "Arrive Mendocino, check in, headlands bluff loop at golden hour.",
        "Dinner in the village.",
        "The drive is the pre-show — don't rush it.",
      ),
      buildItineraryDay(
        "Day 2",
        "Breakfast at Good Life, then Russian Gulch waterfall walk.",
        "Fort Bragg lunch + Glass Beach + coastal trail.",
        "Return to village for bookstore/wine bar time.",
        "Point Cabrillo sunset, dinner in town.",
        "This is the full-coverage day — headlands, redwoods, food.",
      ),
      buildItineraryDay(
        "Day 3",
        "Slow village morning with a final headlands stop.",
        "Drive south via Highway 1 (short segment) then 128 back to 101.",
        "Anderson Valley wine stop if the group wants one more beat.",
        "Home by dinner.",
        "Day 3 intentionally lighter — the village is the rest.",
      ),
    ],
  },
  {
    slug: "morro-rock",
    name: "Morro Rock + Cayucos",
    region: "Central Coast",
    summary:
      "Volcanic plug rising from a harbor town, Hearst Castle 40 min north, and Cayucos fish-and-chips — the Big Sur alternative when the highway isn't cooperating.",
    currentVerdict:
      "Underrated right now. When Highway 1 north of Big Sur is fragile, Morro Bay is the clean central-coast answer with its own identity.",
    whyNow:
      "Spring weather is stable, the harbor town is awake, and the drive from the Bay or LA is shorter than the Big Sur loop.",
    mainWarning:
      "This is a low-stakes trip. If your group expects dramatic cliffs and cinematic turnouts, Big Sur still wins. Morro Bay wins on ease, not drama.",
    bestActivity: "Harbor town + Hearst Castle loop",
    seasonalWindow: "Year-round with best light March-May and September-October",
    palette: ["#2a3b40", "#527580", "#d4b28a"],
    driveHours: buildDriveHours(3.8, 3.4, 5.6, 4.8),
    idealTripLengths: ["weekend", "3-days"],
    collections: ["Coast", "Non-hiker friendly", "Food + town"],
    tags: ["Coast", "Cafe/town", "Easy walks", "Family-friendly", "Harbor"],
    riskBadges: ["Wind exposure"],
    breakdown: buildBreakdown(84, 86, 80, 84, 86, 88, 82, 88),
    activities: [
      buildActivity(
        "Morro Rock harbor walk + embarcadero",
        "Very easy",
        "Late afternoon",
        "Flat waterfront stroll with otters, sea lions, and fish-and-chip stops.",
      ),
      buildActivity(
        "Hearst Castle tour + elephant seal colony",
        "Easy",
        "Midday",
        "40 minutes north in San Simeon. Tour plus the Piedras Blancas seal colony.",
      ),
      buildActivity(
        "Montana de Oro bluff trail",
        "Easy to moderate",
        "Morning",
        "Uncrowded state park just south — cliffs, tide pools, fewer people than Big Sur.",
      ),
    ],
    avoid: [
      "Expecting Big Sur-scale drama. This trip is about ease, not grandeur.",
      "Skipping Cayucos — it's the food-town anchor that makes the trip feel complete.",
      "Booking Hearst Castle same-day — tours do sell out on weekends.",
    ],
    suggestedStops: [
      "Morro Rock",
      "Embarcadero waterfront",
      "Montana de Oro State Park",
      "Cayucos pier",
      "Hearst Castle + Piedras Blancas",
    ],
    foodSupport: buildFoodSupport(
      "Morro Bay + Cayucos",
      ["Top Dog Coffee Bar (Cayucos)", "Kiteboarder's Cafe"],
      ["Giovanni's Fish Market", "Schooners Wharf", "Ruddell's Smokehouse (Cayucos)"],
      ["Embarcadero benches", "Cayucos pier walk", "Brown Butter Cookie Company"],
      "Cayucos (10 min north) is the food heart. Morro Bay is the base. Use both.",
    ),
    lodging: buildLodging(
      "Morro Bay embarcadero",
      "Walk-to-water access, harbor views, family-friendly inventory",
      "Cayucos",
      "Cayucos has more charm and better food density, but smaller inventory.",
    ),
    planB: buildPlanB(
      "If wind at the rock is punishing or marine layer collapses visibility",
      "Shift inland to Paso Robles wine country, 30 minutes east.",
      "Paso gives the group a completely different day without a real drive.",
      "Zero added drive time. The pivot adds wineries instead of subtracting coast.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Arrive midday via 101. Skip Highway 1 fragility on the way in.",
        "Check in, lunch at Giovanni's on the embarcadero.",
        "Harbor walk, Morro Rock approach, Cayucos for late afternoon.",
        "Dinner at Ruddell's or Schooners.",
        "Day 1 is intentionally short — the drive is easier than Big Sur's, use the saved time.",
      ),
      buildItineraryDay(
        "Day 2",
        "Early breakfast, then north to Hearst Castle (pre-booked tour).",
        "Piedras Blancas elephant seal colony on the return.",
        "Afternoon at Montana de Oro bluff trail.",
        "Cayucos sunset pier walk + dinner.",
        "This is the coverage day — castle, colony, cliffs, food.",
      ),
      buildItineraryDay(
        "Day 3",
        "Slow morning, coffee at Top Dog in Cayucos.",
        "Optional Paso Robles wine stop or Montana de Oro return.",
        "Home via 101.",
        "Arrive with a trip that wasn't exhausting.",
        "The value prop is low-friction central coast, not maximum density.",
      ),
    ],
  },
  {
    slug: "mojave",
    name: "Mojave National Preserve",
    region: "Southern Desert",
    summary:
      "The emptier, quieter desert between Joshua Tree and Death Valley — Kelso Dunes, Joshua tree forests, lava tubes, and almost no crowds.",
    currentVerdict:
      "Last comfortable window. April works, May is the edge, June is out. Go now if you want desert solitude without Joshua Tree's crowds.",
    whyNow:
      "Temperatures are still workable, wildflowers linger in good years, and the preserve doesn't have Joshua Tree's weekend parking problem.",
    mainWarning:
      "Services are minimal. Gas up in Baker or Barstow, bring water, and don't assume cell coverage anywhere inside the preserve.",
    bestActivity: "Kelso Dunes + Joshua tree forest solitude",
    seasonalWindow: "November-April. Dangerous May through September.",
    palette: ["#3d2f26", "#a8714a", "#e8c88a"],
    driveHours: buildDriveHours(8.2, 2.8, 3.6, 7.4),
    idealTripLengths: ["weekend", "3-days"],
    collections: ["Desert", "Photography"],
    tags: ["Desert", "Photography", "Scenic drive", "Easy walks", "Remote"],
    riskBadges: ["Remote", "Limited services", "Heat risk late-April"],
    breakdown: buildBreakdown(80, 74, 78, 68, 82, 72, 64, 74),
    activities: [
      buildActivity(
        "Kelso Dunes trail",
        "Moderate",
        "Early morning or golden hour",
        "600-foot dunes with booming sand. Main draw of the preserve.",
      ),
      buildActivity(
        "Kelso Depot visitor center + Cima Dome drive",
        "Very easy",
        "Midday",
        "Historic depot with exhibits, then the densest Joshua tree forest anywhere.",
      ),
      buildActivity(
        "Lava Tube at Aiken Mine Road",
        "Easy (rough road access)",
        "Midday",
        "Short underground walk with skylight beams. High-clearance vehicle recommended.",
      ),
    ],
    avoid: [
      "Treating this like Joshua Tree — the services and infrastructure are much thinner.",
      "Attempting the Lava Tube road in a low-clearance sedan.",
      "Traveling May through September without heat-emergency planning.",
    ],
    suggestedStops: [
      "Kelso Dunes",
      "Kelso Depot visitor center",
      "Cima Dome Joshua tree forest",
      "Hole-in-the-Wall rings trail",
      "Mitchell Caverns (if open)",
    ],
    foodSupport: buildFoodSupport(
      "Baker or Barstow",
      ["Alien Fresh Jerky (Baker novelty)", "Barstow fast-food strip"],
      ["Mad Greek Cafe (Baker)", "Barstow dinner fallback"],
      ["Kelso Depot visitor center", "Roadside pull-offs"],
      "There is no food inside the preserve. Plan to eat in Baker or pack in.",
    ),
    lodging: buildLodging(
      "Primitive camping (Hole-in-the-Wall or Mid Hills)",
      "The authentic preserve experience — quiet, dark skies, minimal services",
      "Baker or Barstow motel",
      "Motels trade the dark-sky experience for plumbing and restaurants.",
    ),
    planB: buildPlanB(
      "If heat arrives early or wind kicks up hard at the dunes",
      "Shift to higher-elevation Hole-in-the-Wall and Mid Hills sections, or exit to Joshua Tree.",
      "The preserve's elevation range lets you chase cooler air without leaving.",
      "Usually 10-15°F difference between Kelso Valley and Mid Hills.",
    ),
    itinerary: [
      buildItineraryDay(
        "Day 1",
        "Arrive via I-15 (Baker exit) with a full tank and water.",
        "Kelso Depot visitor center for orientation.",
        "Cima Dome Joshua tree drive in afternoon light.",
        "Camp at Hole-in-the-Wall or motel in Baker.",
        "Day 1 is about setting up — don't fight the heat.",
      ),
      buildItineraryDay(
        "Day 2",
        "Dawn start for Kelso Dunes while temps are low.",
        "Depot area rest and hydration midday.",
        "Hole-in-the-Wall rings trail in late afternoon.",
        "Dark-sky stargazing if camping, or Baker dinner.",
        "The main day — bracket activities around the heat curve.",
      ),
      buildItineraryDay(
        "Day 3",
        "One last dawn stop — dunes overlook or Cima Dome.",
        "Breakfast in Baker, then exit.",
        "Optional Mad Greek Cafe stop for the novelty.",
        "Home with a desert trip that felt genuinely remote.",
        "The preserve rewards respect for its emptiness — don't over-schedule.",
      ),
    ],
  },
];

export const destinations: Destination[] = destinationSeeds.map((destination) => {
  const fitScore = calculateTripFitScore(destination.breakdown);

  return {
    ...destination,
    fitScore,
    fitLabel: labelTripFitScore(fitScore),
  };
});

export const planningPreset = {
  origin: "bay-area" as Origin,
  tripLength: "3-days" as TripLength,
  drivingToleranceId: "balanced" as DrivingTolerance,
  groupProfile: "mixed" as GroupProfile,
  tripFormat: "one-night" as TripFormat,
  tripIntensity: "balanced" as TripIntensity,
  lodgingStyle: "town-base" as LodgingStyle,
  interestMode: "specific" as InterestMode,
  interestKeys: ["scenic-views", "moderate-hiking", "good-food"] as InterestKey[],
  drivingTolerance: "max 6 hours",
  interests: ["Scenic views", "Moderate hiking", "Good food / cafe"],
  groupType: "Mixed energy levels with one non-hiker",
};

export const savedTrips = [
  {
    slug: "big-sur-carmel",
    title: "Bay Area spring coast reset",
    updatedAt: "Updated April 14, 2026",
    alertState: "Route check recommended before departure",
  },
  {
    slug: "yosemite",
    title: "Waterfalls over high-country gamble",
    updatedAt: "Updated April 14, 2026",
    alertState: "Stay valley-first for best reliability",
  },
];

function getTripLengthWeight(tripLength: TripLength) {
  const tripLengthWeight: Record<TripLength, number> = {
    weekend: 6,
    "3-days": 4,
    "5-days": 2,
    "7-days": 0,
  };

  return tripLengthWeight[tripLength];
}

function getDriveHoursLimit(
  drivingTolerance: DrivingTolerance,
  tripLength: TripLength,
  tripFormat: TripFormat,
) {
  const toleranceLimits: Record<DrivingTolerance, number> = {
    tight: 2.75,
    balanced: 4.25,
    stretch: 6.25,
  };

  const lengthAdjustment: Record<TripLength, number> = {
    weekend: 0,
    "3-days": 0.75,
    "5-days": 1.75,
    "7-days": 2.75,
  };

  const formatAdjustment: Record<TripFormat, number> = {
    "same-day": -1.5,
    "one-night": 0,
    "weekend-stay": 0.75,
  };

  return toleranceLimits[drivingTolerance] + lengthAdjustment[tripLength] + formatAdjustment[tripFormat];
}

function getDrivePenalty(
  driveHours: number,
  drivingTolerance: DrivingTolerance,
  tripLength: TripLength,
  tripFormat: TripFormat,
) {
  const driveHoursLimit = getDriveHoursLimit(drivingTolerance, tripLength, tripFormat);
  let penalty = Math.max(driveHours - driveHoursLimit, 0) * 5.25;

  if (tripLength === "weekend" && driveHours > 5) {
    penalty += 6 + (driveHours - 5) * 3;
  }

  if (tripFormat === "same-day" && driveHours > 3) {
    penalty += 8 + (driveHours - 3) * 4;
  }

  return penalty;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function buildDestinationMatchText(destination: Destination) {
  return normalizeText(
    [
      destination.name,
      destination.region,
      destination.summary,
      destination.bestActivity,
      destination.currentVerdict,
      destination.whyNow,
      destination.tags.join(" "),
      destination.collections.join(" "),
      destination.foodSupport.nearbyTown,
      destination.foodSupport.note,
      destination.foodSupport.cafes.join(" "),
      destination.foodSupport.dinner.join(" "),
      destination.lodging.bestBase,
      destination.lodging.bestFor,
      destination.lodging.alternative,
      destination.lodging.tradeoff,
      destination.planB.trigger,
      destination.planB.alternative,
      destination.activities.map((activity) => activity.name).join(" "),
      destination.activities.map((activity) => activity.whyItFits).join(" "),
      destination.suggestedStops.join(" "),
    ].join(" "),
  );
}

function hasKeywordMatch(haystack: string, keywords: string[]) {
  return keywords.some((keyword) => haystack.includes(normalizeText(keyword)));
}

function getInterestMatchScore(destination: Destination, interest: InterestKey) {
  const haystack = buildDestinationMatchText(destination);

  switch (interest) {
    case "scenic-views":
      return hasKeywordMatch(haystack, [
        "scenic drive",
        "coast",
        "waterfalls",
        "lake",
        "desert",
        "viewpoint",
      ])
        ? 5
        : -2;
    case "moderate-hiking":
      return hasKeywordMatch(haystack, ["hiking", "waterfalls", "moderate", "mist trail"])
        ? 5
        : -3;
    case "easy-walks":
      return hasKeywordMatch(haystack, [
        "easy",
        "very easy",
        "non hiker",
        "family friendly",
        "shoreline",
        "short walk",
      ])
        ? 5
        : -2;
    case "good-food":
      return hasKeywordMatch(haystack, [
        "food town",
        "cafe",
        "dinner",
        "carmel",
        "monterey",
        "truckee",
        "mariposa",
        "town",
      ])
        ? 6
        : -3;
    case "photography":
      return hasKeywordMatch(haystack, [
        "photography",
        "golden hour",
        "viewpoint",
        "waterfalls",
        "scenic",
      ])
        ? 5
        : -2;
    case "snow-play":
      return hasKeywordMatch(haystack, ["snow", "ski", "alpine", "winter", "hot springs"])
        ? 6
        : -3;
    default:
      return 0;
  }
}

function getInterestBoost(destination: Destination, interests: InterestKey[]) {
  if (interests.length === 0) {
    return 0;
  }

  return interests.reduce((total, interest) => total + getInterestMatchScore(destination, interest), 0);
}

function getGroupBoost(destination: Destination, groupProfile: GroupProfile) {
  const haystack = buildDestinationMatchText(destination);

  switch (groupProfile) {
    case "mixed":
      return (
        Math.round((destination.breakdown.groupFit - 75) * 0.18) +
        (hasKeywordMatch(haystack, [
          "mixed group",
          "non hiker",
          "family friendly",
          "food town",
          "cafe town",
        ])
          ? 6
          : 0)
      );
    case "active":
      return (
        Math.round((destination.breakdown.activityMatch - 76) * 0.16) +
        (hasKeywordMatch(haystack, ["hiking", "waterfalls", "snow", "alpine"]) ? 5 : -1)
      );
    case "easygoing":
      return (
        Math.round((destination.breakdown.planB - 76) * 0.12) +
        (hasKeywordMatch(haystack, [
          "easy",
          "very easy",
          "scenic drive",
          "family friendly",
          "non hiker",
        ])
          ? 5
          : -2)
      );
    case "food-first":
      return (
        Math.round((destination.breakdown.lodging - 76) * 0.12) +
        (hasKeywordMatch(haystack, [
          "food town",
          "cafe",
          "dinner",
          "carmel",
          "monterey",
          "truckee",
          "mariposa",
        ])
          ? 7
          : -3)
      );
    default:
      return 0;
  }
}

function getTripFormatBoost(destination: Destination, tripFormat: TripFormat, origin: Origin) {
  const haystack = buildDestinationMatchText(destination);
  const driveHours = destination.driveHours[origin];

  switch (tripFormat) {
    case "same-day":
      return (
        (driveHours <= 2 ? 10 : driveHours <= 3 ? 4 : -6) +
        Math.round((destination.breakdown.planB - 76) * 0.12) +
        (hasKeywordMatch(haystack, ["easy", "very easy", "harbor", "town", "shoreline", "village"])
          ? 4
          : -2)
      );
    case "one-night":
      return driveHours <= 3.5 ? 5 : driveHours <= 4.5 ? 2 : 0;
    case "weekend-stay":
      return driveHours <= 5 ? 2 : 0;
    default:
      return 0;
  }
}

function getIntensityBoost(destination: Destination, tripIntensity: TripIntensity) {
  const haystack = buildDestinationMatchText(destination);

  switch (tripIntensity) {
    case "slow":
      return (
        Math.round((destination.breakdown.planB - 76) * 0.14) +
        Math.round((destination.breakdown.groupFit - 76) * 0.1) +
        (hasKeywordMatch(haystack, [
          "easy",
          "very easy",
          "town",
          "cafe",
          "harbor",
          "shoreline",
          "lakefront",
        ])
          ? 5
          : -2)
      );
    case "full-days":
      return (
        Math.round((destination.breakdown.activityMatch - 76) * 0.14) +
        (hasKeywordMatch(haystack, [
          "moderate hiking",
          "waterfalls",
          "snow",
          "all day",
          "main hike",
          "active",
        ])
          ? 5
          : -2)
      );
    case "balanced":
    default:
      return 0;
  }
}

function getLodgingBoost(destination: Destination, lodgingStyle: LodgingStyle) {
  const haystack = buildDestinationMatchText(destination);

  switch (lodgingStyle) {
    case "town-base":
      return (
        Math.round((destination.breakdown.lodging - 76) * 0.16) +
        (hasKeywordMatch(haystack, [
          "town",
          "cafe",
          "dinner",
          "village",
          "harbor",
          "walkable",
          "food",
        ])
          ? 6
          : -3)
      );
    case "cabin-lodge":
      return (
        (hasKeywordMatch(haystack, [
          "cabin",
          "lodge",
          "lake",
          "forest",
          "resort",
          "mountain town",
        ])
          ? 7
          : -2) + Math.round((destination.breakdown.lodging - 74) * 0.1)
      );
    case "camping":
      return hasKeywordMatch(haystack, [
        "camping",
        "campground",
        "forest",
        "park",
        "trailhead",
        "remote",
        "desert",
      ])
        ? 6
        : -4;
    default:
      return 0;
  }
}

function getDateBoost(destination: Destination, startDate: string | null | undefined) {
  if (!startDate) {
    return 0;
  }

  const parsed = new Date(`${startDate}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }

  const month = parsed.getMonth() + 1;
  const meta = destinationSeedMeta[destination.slug as keyof typeof destinationSeedMeta];
  let score = 0;

  if (meta?.bestMonths.includes(month)) {
    score += 8;
  } else if (meta?.avoidMonths.includes(month)) {
    score -= 16;
  }

  const isWeekdayDeparture = parsed.getDay() >= 1 && parsed.getDay() <= 4;
  const hasCrowdingRisk = destination.riskBadges.some((risk) =>
    /crowding|parking|traffic/i.test(risk),
  );

  if (isWeekdayDeparture && hasCrowdingRisk) {
    score += 4;
  }

  return score;
}

export function buildScoringContext(
  destination: Destination,
  origin: Origin,
  tripLength: TripLength,
  context: RankingContext = {},
): ScoringContext {
  const drivingTolerance = context.drivingTolerance ?? planningPreset.drivingToleranceId;
  const groupProfile = context.groupProfile ?? planningPreset.groupProfile;
  const tripFormat = context.tripFormat ?? planningPreset.tripFormat;
  const lodgingStyle = context.lodgingStyle ?? planningPreset.lodgingStyle;
  const interests = context.interests ?? [];

  const driveHours = destination.driveHours[origin];
  const driveLimitHours = getDriveHoursLimit(drivingTolerance, tripLength, tripFormat);
  const month = resolveMonth(context.startDate);
  const meta = destinationSeedMeta[destination.slug as keyof typeof destinationSeedMeta];
  const isInBestMonth = month != null && meta?.bestMonths.includes(month) === true;
  const isInAvoidMonth = month != null && meta?.avoidMonths.includes(month) === true;

  const interestMatches = interests.reduce((total, interest) => {
    return total + (getInterestMatchScore(destination, interest) > 0 ? 1 : 0);
  }, 0);

  const groupMatchBoost = clampAdjustment(getGroupBoost(destination, groupProfile));
  const lodgingMatchBoost = clampAdjustment(getLodgingBoost(destination, lodgingStyle));
  const tripLengthMatch = destination.idealTripLengths.includes(tripLength);

  return {
    driveHours,
    driveLimitHours,
    isInBestMonth,
    isInAvoidMonth,
    interestMatches,
    totalInterests: interests.length,
    groupMatchBoost,
    tripLengthMatch,
    lodgingMatchBoost,
  };
}

function clampAdjustment(value: number) {
  return Math.max(-15, Math.min(15, value));
}

function resolveMonth(startDate: string | null | undefined) {
  if (!startDate) {
    return null;
  }

  const parsed = new Date(`${startDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.getMonth() + 1;
}

export function rankDestinationList(
  destinationList: Destination[],
  origin: Origin,
  tripLength: TripLength,
  context: RankingContext = {},
): RankedDestination[] {
  const tripLengthWeight = getTripLengthWeight(tripLength);
  const drivingTolerance = context.drivingTolerance ?? planningPreset.drivingToleranceId;
  const groupProfile = context.groupProfile ?? planningPreset.groupProfile;
  const tripFormat = context.tripFormat ?? planningPreset.tripFormat;
  const tripIntensity = context.tripIntensity ?? planningPreset.tripIntensity;
  const lodgingStyle = context.lodgingStyle ?? planningPreset.lodgingStyle;
  const interests = context.interests ?? planningPreset.interestKeys;

  return [...destinationList]
    .map((destination) => {
      const scoringContext = buildScoringContext(destination, origin, tripLength, context);
      const contextualFitScore = calculateTripFitScore(destination.breakdown, scoringContext);
      const contextualFitLabel = labelTripFitScore(contextualFitScore);

      const drivePenalty = getDrivePenalty(
        destination.driveHours[origin],
        drivingTolerance,
        tripLength,
        tripFormat,
      );
      const tripLengthPenalty = destination.idealTripLengths.includes(tripLength)
        ? 0
        : tripLengthWeight;
      const interestBoost = getInterestBoost(destination, interests);
      const groupBoost = getGroupBoost(destination, groupProfile);
      const tripFormatBoost = getTripFormatBoost(destination, tripFormat, origin);
      const intensityBoost = getIntensityBoost(destination, tripIntensity);
      const lodgingBoost = getLodgingBoost(destination, lodgingStyle);
      const dateBoost = getDateBoost(destination, context.startDate);

      return {
        ...destination,
        fitScore: contextualFitScore,
        fitLabel: contextualFitLabel,
        rankingScore: Math.round(
          contextualFitScore -
            drivePenalty -
            tripLengthPenalty +
            interestBoost +
            groupBoost +
            tripFormatBoost +
            intensityBoost +
            lodgingBoost +
            dateBoost,
        ),
      };
    })
    .sort((left, right) => right.rankingScore - left.rankingScore);
}

export function rankDestinations(origin: Origin, tripLength: TripLength) {
  return rankDestinationList(destinations, origin, tripLength);
}

export function findDestinationBySlug(destinationList: Destination[], slug: string) {
  return destinationList.find((destination) => destination.slug === slug);
}

export function getDestinationBySlug(slug: string) {
  return findDestinationBySlug(destinations, slug);
}
