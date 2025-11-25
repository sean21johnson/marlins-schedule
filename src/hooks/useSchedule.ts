import { useEffect, useState } from 'react';

import { AFFILIATES } from '@/config/affiliates';
import type { ScheduleResponse } from '@/types/schedule';

const BASE_URL = 'https://statsapi.mlb.com/api/v1/schedule';

/*
 MLB + minors levels we care about:
  1  = MLB
  11 = AAA
  12 = AA
  13 = High-A
  14 = A
  16 = Rookie
*/
const SPORT_IDS = [1, 11, 12, 13, 14, 16] as const;

interface UseScheduleResult {
  data: ScheduleResponse | null;
  isLoading: boolean;
  error: string | null;
}

function buildScheduleUrl(date: string): string {
  const params = new URLSearchParams();

  AFFILIATES.forEach(({ teamId }) => {
    params.append('teamId', String(teamId));
  });

  SPORT_IDS.forEach((sportId) => {
    params.append('sportId', String(sportId));
  });

  params.set('date', date);

  return `${BASE_URL}?${params.toString()}`;
}

export function useSchedule(date: string): UseScheduleResult {
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) {
      setData(null);
      return;
    }

    const controller = new AbortController();

    const fetchSchedule = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const url = buildScheduleUrl(date);
        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const json = (await res.json()) as ScheduleResponse;
        setData(json);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        console.error('Failed to load schedule', err);
        setError('Failed to load schedule. Please try again.');
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();

    return () => {
      controller.abort();
    };
  }, [date]);

  return { data, isLoading, error };
}