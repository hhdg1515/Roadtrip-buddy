import "server-only";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { getAllDestinations } from "@/lib/data/repository";
import {
  planningPreset,
  type DrivingTolerance,
  type GroupProfile,
  type InterestKey,
  type LodgingStyle,
  type Origin,
} from "@/lib/data/openseason";
import { toSavedTripQueryString, withQueryString } from "@/lib/planning";
import {
  isInterestKey,
  parseDrivingTolerance,
  parseGroupProfile,
  parseLodgingStyle,
  parseOrigin,
} from "@/lib/planning-params";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient as createServerClient } from "@/lib/supabase/server";

type Relation<T> = T | T[] | null;

type PreferenceRow = {
  origin_city: string | null;
  driving_tolerance: string | null;
  favorite_activities: string[] | null;
  group_default: string | null;
  lodging_preference: string | null;
  avoidances: string[] | null;
  updated_at: string | null;
};

type SavedTripRow = {
  id: string;
  title: string;
  user_origin: string;
  created_at: string;
  preferences: Record<string, unknown> | null;
  destination:
    | {
        slug: string;
        name: string;
        region: string;
      }
    | Array<{
        slug: string;
        name: string;
        region: string;
      }>
    | null;
};

export type UserPreferences = {
  origin: Origin;
  drivingTolerance: DrivingTolerance;
  groupProfile: GroupProfile;
  lodgingStyle: LodgingStyle;
  interests: InterestKey[];
  avoidances: string[];
  updatedAt: string | null;
};

export type SavedTripSummary = {
  id: string;
  slug: string;
  title: string;
  destinationName: string;
  region: string;
  savedAt: string;
  userOrigin: string;
  destinationHref: string;
  fitScore: number | null;
  fitLabel: string | null;
  currentVerdict: string | null;
  mainWarning: string | null;
  updatedAt: string | null;
};

const defaultPreferences: UserPreferences = {
  origin: planningPreset.origin,
  drivingTolerance: planningPreset.drivingToleranceId,
  groupProfile: planningPreset.groupProfile,
  lodgingStyle: planningPreset.lodgingStyle,
  interests: [...planningPreset.interestKeys],
  avoidances: ["Overcommitting to fragile mountain access", "Last-minute closure surprises"],
  updatedAt: null,
};

const getAuthContext = cache(async () => {
  if (!hasSupabaseEnv()) {
    return {
      isConfigured: false,
      supabase: null,
      user: null as User | null,
    };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Failed to read Supabase auth session.", error);
    return {
      isConfigured: true,
      supabase,
      user: null as User | null,
    };
  }

  return {
    isConfigured: true,
    supabase,
    user,
  };
});

export async function getCurrentUser() {
  const { user } = await getAuthContext();
  return user;
}

export async function getUserPreferences() {
  const { isConfigured, supabase, user } = await getAuthContext();

  if (!isConfigured || !supabase || !user) {
    return {
      isConfigured,
      user,
      preferences: defaultPreferences,
    };
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .select(
      "origin_city, driving_tolerance, favorite_activities, group_default, lodging_preference, avoidances, updated_at",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to read user preferences.", error);
    return {
      isConfigured,
      user,
      preferences: defaultPreferences,
    };
  }

  const row = data as PreferenceRow | null;

  return {
    isConfigured,
    user,
    preferences: row
      ? {
          origin: parseOrigin(row.origin_city) ?? defaultPreferences.origin,
          drivingTolerance:
            parseDrivingTolerance(row.driving_tolerance) ?? defaultPreferences.drivingTolerance,
          groupProfile:
            parseGroupProfile(row.group_default) ?? defaultPreferences.groupProfile,
          lodgingStyle:
            parseLodgingStyle(row.lodging_preference) ?? defaultPreferences.lodgingStyle,
          interests:
            row.favorite_activities?.filter(isInterestKey) ?? defaultPreferences.interests,
          avoidances: row.avoidances?.filter(Boolean) ?? defaultPreferences.avoidances,
          updatedAt: row.updated_at ?? null,
        }
      : defaultPreferences,
  };
}

export async function getSavedTripSummaries(): Promise<SavedTripSummary[]> {
  const { isConfigured, supabase, user } = await getAuthContext();

  if (!isConfigured || !supabase || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("trip_plans")
    .select(
      `
        id,
        title,
        user_origin,
        created_at,
        preferences,
        destination:destinations (
          slug,
          name,
          region
        )
      `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to read saved trip plans.", error);
    return [];
  }

  const destinationLookup = new Map(
    (await getAllDestinations()).map((destination) => [destination.slug, destination]),
  );

  return ((data ?? []) as SavedTripRow[])
    .map((row) => {
      const destination = unwrapRelation(row.destination);

      if (!destination?.slug) {
        return null;
      }

      const current = destinationLookup.get(destination.slug);

      return {
        id: row.id,
        slug: destination.slug,
        title: row.title,
        destinationName: destination.name,
        region: destination.region,
        savedAt: row.created_at,
        userOrigin: row.user_origin,
        destinationHref: withQueryString(
          `/destinations/${destination.slug}`,
          toSavedTripQueryString({
            userOrigin: row.user_origin,
            preferences: row.preferences,
          }),
        ),
        fitScore: current?.fitScore ?? null,
        fitLabel: current?.fitLabel ?? null,
        currentVerdict: current?.currentVerdict ?? null,
        mainWarning: current?.mainWarning ?? null,
        updatedAt: current?.updatedAt ?? null,
      } satisfies SavedTripSummary;
    })
    .filter((trip): trip is SavedTripSummary => Boolean(trip));
}

function unwrapRelation<T>(value: Relation<T>): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}
