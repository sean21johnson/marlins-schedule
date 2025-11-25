import { useEffect, useMemo, useState } from 'react';

import type { ScheduleResponse } from '@/types/schedule';

export interface VenueInfo {
  id: number;
  name: string;
  city?: string;
  state?: string;
}

interface UseVenueMapResult {
  venueMap: Record<number, VenueInfo>;
  isLoadingVenues: boolean;
  venueError: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getVenuesArray(json: unknown): unknown[] {
  if (Array.isArray(json)) return json;

  if (isRecord(json)) {
    const venues = json.venues;
    if (Array.isArray(venues)) return venues;
  }

  return [];
}

export function useVenueMap(
  schedule: ScheduleResponse | null,
): UseVenueMapResult {
  const [venueMap, setVenueMap] = useState<Record<number, VenueInfo>>({});
  const [isLoadingVenues, setIsLoadingVenues] = useState(false);
  const [venueError, setVenueError] = useState<string | null>(null);

  const venueIds = useMemo(() => {
    const ids = new Set<number>();

    if (!schedule?.dates?.length) {
      return ids;
    }

    for (const date of schedule.dates) {
      for (const game of date.games ?? []) {
        const id = game.venue?.id;
        if (typeof id === 'number') {
          ids.add(id);
        }
      }
    }

    return ids;
  }, [schedule]);

  useEffect(() => {
    if (!schedule || venueIds.size === 0) {
      setVenueMap({});
      setIsLoadingVenues(false);
      setVenueError(null);
      return;
    }

    let cancelled = false;

    const fetchVenues = async () => {
      try {
        setIsLoadingVenues(true);
        setVenueError(null);

        const idsArray = Array.from(venueIds);
        const url = `https://statsapi.mlb.com/api/v1/venues?venueIds=${idsArray.join(
          ',',
        )}&hydrate=location`;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch venues: ${res.status}`);
        }

        const json: unknown = await res.json();
        if (cancelled) return;

        const venuesApi = getVenuesArray(json);

        const nextMap: Record<number, VenueInfo> = {};

        for (const v of venuesApi) {
          if (!isRecord(v)) continue;

          const id = v.id;
          const name = v.name;

          if (typeof id !== 'number' || typeof name !== 'string') continue;

          const location = isRecord(v.location) ? v.location : undefined;

          const city =
            typeof location?.city === 'string' ? location.city : undefined;

          const stateLike =
            typeof location?.stateAbbrev === 'string'
              ? location.stateAbbrev
              : typeof location?.state === 'string'
              ? location.state
              : typeof location?.country === 'string'
              ? location.country
              : undefined;

          nextMap[id] = {
            id,
            name,
            city,
            state: stateLike,
          };
        }

        setVenueMap(nextMap);
        setIsLoadingVenues(false);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setVenueError('Unable to load venue details');
        setIsLoadingVenues(false);
      }
    };

    void fetchVenues();

    return () => {
      cancelled = true;
    };
  }, [schedule, venueIds]);

  return { venueMap, isLoadingVenues, venueError };
}