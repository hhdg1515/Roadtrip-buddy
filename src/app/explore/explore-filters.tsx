"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DestinationGrid } from "@/components/destinations/destination-grid";
import type { Destination, Origin, RankedDestination } from "@/lib/data/openseason";
import { type PlanningState } from "@/lib/planning";

type FilterOption = {
  id: string;
  label: string;
  matches: (destination: Destination) => boolean;
};

const regionFilters: FilterOption[] = [
  { id: "sierra", label: "Sierra Nevada", matches: (d) => /sierra/i.test(d.region) },
  { id: "central-coast", label: "Central Coast", matches: (d) => /central coast/i.test(d.region) },
  { id: "southern-desert", label: "Southern Desert", matches: (d) => /desert/i.test(d.region) },
  {
    id: "northern-california",
    label: "Northern California",
    matches: (d) => /north/i.test(d.region) && !/sierra/i.test(d.region),
  },
];

const activityFilters: FilterOption[] = [
  { id: "hiking", label: "Hiking", matches: (d) => hasAnyKeyword(d, ["hiking", "hike"]) },
  { id: "skiing", label: "Skiing / Snow", matches: (d) => hasAnyKeyword(d, ["snow", "ski"]) },
  { id: "scenic-drive", label: "Scenic drive", matches: (d) => hasAnyKeyword(d, ["scenic drive"]) },
  { id: "coast", label: "Coast", matches: (d) => hasAnyKeyword(d, ["coast"]) },
  { id: "desert", label: "Desert", matches: (d) => hasAnyKeyword(d, ["desert"]) },
  { id: "wildflowers", label: "Wildflowers", matches: (d) => hasAnyKeyword(d, ["wildflower"]) },
  {
    id: "fall-colors",
    label: "Fall colors",
    matches: (d) => hasAnyKeyword(d, ["fall color", "aspen", "autumn"]),
  },
  { id: "camping", label: "Camping", matches: (d) => hasAnyKeyword(d, ["camping", "camp"]) },
  {
    id: "food-town",
    label: "Food / town",
    matches: (d) => hasAnyKeyword(d, ["food", "cafe", "town", "oyster", "dinner"]),
  },
];

const styleFilters: FilterOption[] = [
  {
    id: "easy",
    label: "Easy",
    matches: (d) => hasAnyKeyword(d, ["easy", "easygoing", "easy walks"]),
  },
  {
    id: "adventurous",
    label: "Adventurous",
    matches: (d) =>
      hasAnyKeyword(d, ["moderate hiking", "adventure", "backcountry", "remote"]),
  },
  {
    id: "family-friendly",
    label: "Family-friendly",
    matches: (d) => hasAnyKeyword(d, ["family-friendly", "family"]),
  },
  { id: "romantic", label: "Romantic", matches: (d) => hasAnyKeyword(d, ["romantic"]) },
  {
    id: "group-trip",
    label: "Group trip",
    matches: (d) => hasAnyKeyword(d, ["mixed group", "group"]),
  },
  {
    id: "non-hiker",
    label: "Non-hiker friendly",
    matches: (d) => hasAnyKeyword(d, ["non-hiker", "easy walks"]),
  },
];

type Props = Readonly<{
  destinations: RankedDestination[];
  origin: Origin;
  planningState: PlanningState;
  planBriefHref: string;
}>;

export function ExploreFilters({ destinations, origin, planningState, planBriefHref }: Props) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return destinations.filter((destination) => {
      if (selectedRegion) {
        const option = regionFilters.find((f) => f.id === selectedRegion);
        if (option && !option.matches(destination)) return false;
      }
      if (selectedActivities.length > 0) {
        const matched = activityFilters
          .filter((f) => selectedActivities.includes(f.id))
          .some((f) => f.matches(destination));
        if (!matched) return false;
      }
      if (selectedStyles.length > 0) {
        const matched = styleFilters
          .filter((f) => selectedStyles.includes(f.id))
          .some((f) => f.matches(destination));
        if (!matched) return false;
      }
      return true;
    });
  }, [destinations, selectedRegion, selectedActivities, selectedStyles]);

  const activeFilterCount =
    (selectedRegion ? 1 : 0) + selectedActivities.length + selectedStyles.length;

  const clearAll = () => {
    setSelectedRegion(null);
    setSelectedActivities([]);
    setSelectedStyles([]);
  };

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleRegion = (id: string) => {
    setSelectedRegion((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="eyebrow">Refine</p>
              <h2 className="display-title text-[22px] text-foreground">
                {filtered.length}{" "}
                <span className="text-[#9a8878]">of {destinations.length} destinations</span>
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {activeFilterCount > 0 ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="uppercase tracking-[0.14em] text-[#9a8878] transition hover:text-foreground"
                >
                  Clear
                </button>
              ) : null}
              <Link
                href={planBriefHref}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Edit brief
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <FilterRow
            legend="Region"
            options={regionFilters}
            isSelected={(id) => selectedRegion === id}
            onToggle={toggleRegion}
          />
          <FilterRow
            legend="Activity"
            options={activityFilters}
            isSelected={(id) => selectedActivities.includes(id)}
            onToggle={toggleActivity}
          />
          <FilterRow
            legend="Style"
            options={styleFilters}
            isSelected={(id) => selectedStyles.includes(id)}
            onToggle={toggleStyle}
          />
        </CardBody>
      </Card>

      {filtered.length > 0 ? (
        <DestinationGrid
          destinations={filtered}
          origin={origin}
          planningState={planningState}
          enablePeek
        />
      ) : (
        <Card>
          <CardBody className="space-y-3 py-8 text-center">
            <p className="text-sm text-[#6b5c44]">No destinations match. Loosen a filter.</p>
            <button
              type="button"
              onClick={clearAll}
              className={buttonVariants({ variant: "primary", size: "sm" })}
            >
              Clear filters
            </button>
          </CardBody>
        </Card>
      )}
    </>
  );
}

type FilterRowProps = Readonly<{
  legend: string;
  options: FilterOption[];
  isSelected: (id: string) => boolean;
  onToggle: (id: string) => void;
}>;

function FilterRow({ legend, options, isSelected, onToggle }: FilterRowProps) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#9a8878]">{legend}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const selected = isSelected(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              aria-pressed={selected}
              className={
                selected
                  ? "rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background transition"
                  : "rounded-md bg-[rgba(26,22,18,0.05)] px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-[rgba(26,22,18,0.09)]"
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
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
