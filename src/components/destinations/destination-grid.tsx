"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { DestinationCard } from "@/components/home/destination-card";
import { DestinationPeek } from "@/components/destinations/destination-peek";
import type { Destination, Origin } from "@/lib/data/openseason";
import {
  normalizeCompareSlugs,
  withCompareSlugs,
  withPlanningQuery,
  type PlanningState,
} from "@/lib/planning";

const PEEK_OPEN_DELAY = 300;
const PEEK_CLOSE_DELAY = 150;

type Props = Readonly<{
  destinations: Destination[];
  origin: Origin;
  planningState: PlanningState;
  className?: string;
  enablePeek?: boolean;
}>;

export function DestinationGrid({
  destinations,
  origin,
  planningState,
  className = "grid gap-4 md:grid-cols-2",
  enablePeek = false,
}: Props) {
  const searchParams = useSearchParams();
  const [peekSlug, setPeekSlug] = useState<string | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const compareSlugs = useMemo(
    () => normalizeCompareSlugs(searchParams.getAll("slugs")),
    [searchParams],
  );

  const clearTimers = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const handleCardEnter = useCallback(
    (slug: string) => {
      if (!enablePeek) return;
      clearTimers();
      if (peekSlug && peekSlug !== slug) {
        setPeekSlug(slug);
        return;
      }
      openTimer.current = setTimeout(() => setPeekSlug(slug), PEEK_OPEN_DELAY);
    },
    [clearTimers, peekSlug, enablePeek],
  );

  const handleCardLeave = useCallback(() => {
    if (!enablePeek) return;
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    closeTimer.current = setTimeout(() => setPeekSlug(null), PEEK_CLOSE_DELAY);
  }, [enablePeek]);

  const handlePanelEnter = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  const handlePanelLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setPeekSlug(null), PEEK_CLOSE_DELAY);
  }, []);

  const closePeek = useCallback(() => {
    clearTimers();
    setPeekSlug(null);
  }, [clearTimers]);

  const peekDestination = destinations.find((destination) => destination.slug === peekSlug) ?? null;

  return (
    <>
      <div className={className}>
        {destinations.map((destination) => (
          <div
            key={destination.slug}
            onMouseEnter={() => handleCardEnter(destination.slug)}
            onMouseLeave={handleCardLeave}
          >
            <DestinationCard
              destination={destination}
              origin={origin}
              href={withCompareSlugs(
                withPlanningQuery(`/destinations/${destination.slug}`, planningState),
                compareSlugs,
              )}
            />
          </div>
        ))}
      </div>

      {enablePeek ? (
        <DestinationPeek
          destination={peekDestination}
          href={
            peekSlug
              ? withCompareSlugs(
                  withPlanningQuery(`/destinations/${peekSlug}`, planningState),
                  compareSlugs,
                )
              : "#"
          }
          onClose={closePeek}
          onPanelEnter={handlePanelEnter}
          onPanelLeave={handlePanelLeave}
        />
      ) : null}
    </>
  );
}
