import { SectionHeading } from "@/components/ui/section-heading";
import { getUserPreferences } from "@/lib/account";
import { getRankedDestinations } from "@/lib/data/repository";
import {
  getPlanningState,
  labelOrigin,
  labelTripLength,
  rankingContextFromPlanning,
  toPlanningQueryString,
} from "@/lib/planning";
import { ExploreFilters } from "./explore-filters";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExplorePage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const { preferences } = await getUserPreferences();
  const planningState = getPlanningState(resolvedSearchParams, preferences);
  const rankingContext = rankingContextFromPlanning(planningState);

  const ranked = await getRankedDestinations(
    planningState.origin,
    planningState.tripLength,
    rankingContext,
  );

  const planningQueryString = toPlanningQueryString(planningState);

  return (
    <div className="space-y-8 py-8">
      <SectionHeading
        eyebrow={`${labelOrigin(planningState.origin)} · ${labelTripLength(
          planningState.tripLength,
        ).toLowerCase()}`}
        title="Browse California"
      />

      <ExploreFilters
        destinations={ranked}
        origin={planningState.origin}
        planningState={planningState}
        planBriefHref={`/plan?${planningQueryString}`}
      />
    </div>
  );
}
