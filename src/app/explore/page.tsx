import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DestinationCard } from "@/components/home/destination-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getUserPreferences } from "@/lib/account";
import type { Destination, RankedDestination } from "@/lib/data/openseason";
import { getRankedDestinations } from "@/lib/data/repository";
import {
  getPlanningState,
  labelOrigin,
  labelTripLength,
  rankingContextFromPlanning,
  toPlanningQueryString,
} from "@/lib/planning";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type FilterGroupId = "regions" | "activities" | "styles";

type FilterOption = {
  id: string;
  label: string;
  matches: (destination: Destination) => boolean;
};

const regionFilters: FilterOption[] = [
  {
    id: "sierra",
    label: "Sierra Nevada",
    matches: (destination) => /sierra/i.test(destination.region),
  },
  {
    id: "central-coast",
    label: "Central Coast",
    matches: (destination) => /central coast/i.test(destination.region),
  },
  {
    id: "southern-desert",
    label: "Southern Desert",
    matches: (destination) => /desert/i.test(destination.region),
  },
  {
    id: "northern-california",
    label: "Northern California",
    matches: (destination) =>
      /north/i.test(destination.region) && !/sierra/i.test(destination.region),
  },
  {
    id: "bay-area",
    label: "Bay Area escapes",
    matches: (destination) => destination.driveHours["bay-area"] <= 3,
  },
  {
    id: "los-angeles",
    label: "LA escapes",
    matches: (destination) => destination.driveHours["los-angeles"] <= 3,
  },
];

const activityFilters: FilterOption[] = [
  {
    id: "hiking",
    label: "Hiking",
    matches: (destination) => hasAnyKeyword(destination, ["hiking", "hike"]),
  },
  {
    id: "skiing",
    label: "Skiing / Snow",
    matches: (destination) => hasAnyKeyword(destination, ["snow", "ski"]),
  },
  {
    id: "scenic-drive",
    label: "Scenic drive",
    matches: (destination) => hasAnyKeyword(destination, ["scenic drive"]),
  },
  {
    id: "coast",
    label: "Coast",
    matches: (destination) => hasAnyKeyword(destination, ["coast"]),
  },
  {
    id: "desert",
    label: "Desert",
    matches: (destination) => hasAnyKeyword(destination, ["desert"]),
  },
  {
    id: "wildflowers",
    label: "Wildflowers",
    matches: (destination) => hasAnyKeyword(destination, ["wildflower"]),
  },
  {
    id: "fall-colors",
    label: "Fall colors",
    matches: (destination) => hasAnyKeyword(destination, ["fall color", "aspen", "autumn"]),
  },
  {
    id: "camping",
    label: "Camping",
    matches: (destination) => hasAnyKeyword(destination, ["camping", "camp"]),
  },
  {
    id: "food-town",
    label: "Food / town",
    matches: (destination) =>
      hasAnyKeyword(destination, ["food", "cafe", "town", "oyster", "dinner"]),
  },
];

const styleFilters: FilterOption[] = [
  {
    id: "easy",
    label: "Easy",
    matches: (destination) => hasAnyKeyword(destination, ["easy", "easygoing", "easy walks"]),
  },
  {
    id: "adventurous",
    label: "Adventurous",
    matches: (destination) =>
      hasAnyKeyword(destination, ["moderate hiking", "adventure", "backcountry", "remote"]),
  },
  {
    id: "family-friendly",
    label: "Family-friendly",
    matches: (destination) => hasAnyKeyword(destination, ["family-friendly", "family"]),
  },
  {
    id: "romantic",
    label: "Romantic",
    matches: (destination) => hasAnyKeyword(destination, ["romantic"]),
  },
  {
    id: "group-trip",
    label: "Group trip",
    matches: (destination) => hasAnyKeyword(destination, ["mixed group", "group"]),
  },
  {
    id: "non-hiker",
    label: "Non-hiker friendly",
    matches: (destination) => hasAnyKeyword(destination, ["non-hiker", "easy walks"]),
  },
];

export default async function ExplorePage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const { preferences } = await getUserPreferences();
  const planningState = getPlanningState(resolvedSearchParams, preferences);
  const rankingContext = rankingContextFromPlanning(planningState);

  const selectedRegions = selectedValues(
    resolvedSearchParams.regions,
    regionFilters.map((filter) => filter.id),
  );
  const selectedActivities = selectedValues(
    resolvedSearchParams.activities,
    activityFilters.map((filter) => filter.id),
  );
  const selectedStyles = selectedValues(
    resolvedSearchParams.styles,
    styleFilters.map((filter) => filter.id),
  );

  const ranked = await getRankedDestinations(
    planningState.origin,
    planningState.tripLength,
    rankingContext,
  );

  const filtered = applyFilters(ranked, [
    { options: regionFilters, selectedIds: selectedRegions },
    { options: activityFilters, selectedIds: selectedActivities },
    { options: styleFilters, selectedIds: selectedStyles },
  ]);

  const planningQueryString = toPlanningQueryString(planningState);
  const activeFilterCount =
    selectedRegions.length + selectedActivities.length + selectedStyles.length;

  return (
    <div className="space-y-12 py-10">
      <SectionHeading
        eyebrow="Explore"
        title="Browse the current California shortlist"
        description="Filter by where you want to go, what you want to do, and the trip style. Everything stays ranked by your current brief."
      />

      <Card>
        <CardHeader>
          <p className="eyebrow">Current brief</p>
          <h2 className="display-title text-3xl font-semibold">
            {labelOrigin(planningState.origin)}, {labelTripLength(planningState.tripLength).toLowerCase()}
          </h2>
        </CardHeader>
        <CardBody className="space-y-5 text-sm leading-6">
          <p className="text-muted">
            Filters are additive within a group and combined across groups. Submit to recompute the
            shortlist.
          </p>
          <form method="get" action="/explore" className="space-y-6">
            <FilterGroup
              legend="Region"
              groupId="regions"
              options={regionFilters}
              selectedIds={selectedRegions}
            />
            <FilterGroup
              legend="Activity"
              groupId="activities"
              options={activityFilters}
              selectedIds={selectedActivities}
            />
            <FilterGroup
              legend="Trip style"
              groupId="styles"
              options={styleFilters}
              selectedIds={selectedStyles}
            />

            <input type="hidden" name="origin" value={planningState.origin} />
            <input type="hidden" name="tripLength" value={planningState.tripLength} />
            {planningState.startDate ? (
              <input type="hidden" name="startDate" value={planningState.startDate} />
            ) : null}
            <input type="hidden" name="drivingTolerance" value={planningState.drivingTolerance} />
            <input type="hidden" name="groupProfile" value={planningState.groupProfile} />
            <input type="hidden" name="tripFormat" value={planningState.tripFormat} />
            <input type="hidden" name="tripIntensity" value={planningState.tripIntensity} />
            <input type="hidden" name="lodgingStyle" value={planningState.lodgingStyle} />
            <input type="hidden" name="interestMode" value={planningState.interestMode} />
            {planningState.interestMode === "specific"
              ? planningState.interests.map((interest) => (
                  <input key={interest} type="hidden" name="interests" value={interest} />
                ))
              : null}

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className={buttonVariants({ variant: "primary" })}>
                Apply filters
              </button>
              {activeFilterCount > 0 ? (
                <Link
                  href={`/explore?${planningQueryString}`}
                  className={buttonVariants({ variant: "ghost" })}
                >
                  Clear filters
                </Link>
              ) : null}
              <Link
                href={`/plan?${planningQueryString}`}
                className={buttonVariants({ variant: "secondary" })}
              >
                Retune brief
              </Link>
              <Badge tone="soft">
                {filtered.length} of {ranked.length} destinations
              </Badge>
            </div>
          </form>
        </CardBody>
      </Card>

      {filtered.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map((destination) => (
            <DestinationCard
              key={destination.slug}
              destination={destination}
              origin={planningState.origin}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="space-y-3 py-10 text-center">
            <p className="eyebrow">Nothing matches</p>
            <p className="text-base leading-7 text-muted">
              No destinations match the current filter combination. Loosen a filter or retune the
              brief.
            </p>
            <div className="flex justify-center">
              <Link
                href={`/explore?${planningQueryString}`}
                className={buttonVariants({ variant: "primary" })}
              >
                Clear filters
              </Link>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

type FilterGroupProps = Readonly<{
  legend: string;
  groupId: FilterGroupId;
  options: FilterOption[];
  selectedIds: string[];
}>;

function FilterGroup({ legend, groupId, options, selectedIds }: FilterGroupProps) {
  const selectedSet = new Set(selectedIds);

  return (
    <fieldset className="space-y-3">
      <legend className="text-[0.7rem] font-semibold tracking-[0.16em] uppercase text-muted">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const inputId = `${groupId}-${option.id}`;
          const isSelected = selectedSet.has(option.id);

          return (
            <label
              key={option.id}
              htmlFor={inputId}
              className={
                isSelected
                  ? "cursor-pointer rounded-full border border-foreground bg-foreground px-3 py-1.5 text-xs font-semibold tracking-[0.12em] uppercase text-white"
                  : "cursor-pointer rounded-full border border-white/40 bg-white/55 px-3 py-1.5 text-xs font-semibold tracking-[0.12em] uppercase text-foreground hover:border-foreground/50"
              }
            >
              <input
                id={inputId}
                type="checkbox"
                name={groupId}
                value={option.id}
                defaultChecked={isSelected}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function hasAnyKeyword(destination: Destination, keywords: string[]) {
  const haystack = [
    destination.bestActivity,
    destination.summary,
    ...destination.tags,
    ...destination.collections,
  ]
    .join(" ")
    .toLowerCase();

  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function applyFilters(
  destinations: RankedDestination[],
  groups: Array<{ options: FilterOption[]; selectedIds: string[] }>,
) {
  return destinations.filter((destination) =>
    groups.every(({ options, selectedIds }) => {
      if (selectedIds.length === 0) {
        return true;
      }

      const selectedOptions = options.filter((option) => selectedIds.includes(option.id));
      return selectedOptions.some((option) => option.matches(destination));
    }),
  );
}

function selectedValues(
  value: string | string[] | undefined,
  allowedIds: string[],
): string[] {
  const rawValues = Array.isArray(value) ? value : value ? [value] : [];
  const allowed = new Set(allowedIds);
  return rawValues.filter((candidate) => allowed.has(candidate));
}
