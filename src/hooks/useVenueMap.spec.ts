import { renderHook, waitFor } from '@testing-library/react';

import { useVenueMap } from './useVenueMap';

import type { ScheduleResponse } from '../types/schedule';

function makeScheduleWithVenueIds(ids: number[]): ScheduleResponse {
  return {
    dates: [
      {
        games: ids.map((id) => ({
          venue: { id },
        })),
      },
    ],
  } as unknown as ScheduleResponse;
}

describe('useVenueMap', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('returns an empty map when schedule is null', () => {
    const { result } = renderHook(() => useVenueMap(null));

    expect(result.current.venueMap).toEqual({});
    expect(result.current.isLoadingVenues).toBe(false);
    expect(result.current.venueError).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('dedupes venue ids, fetches venue details, and builds the map (json.venues shape)', async () => {
    const schedule = {
      dates: [
        {
          games: [
            { venue: { id: 100 } },
            { venue: { id: 200 } },
            { venue: { id: 100 } },
          ],
        },
      ],
    } as unknown as ScheduleResponse;

    (global.fetch as unknown as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        venues: [
          {
            id: 100,
            name: 'Venue A',
            location: { city: 'Miami', stateAbbrev: 'FL' },
          },
          {
            id: 200,
            name: 'Venue B',
            location: { city: 'Philadelphia', state: 'Pennsylvania' },
          },
        ],
      }),
    });

    const { result } = renderHook(() => useVenueMap(schedule));

    await waitFor(() => {
      expect(result.current.isLoadingVenues).toBe(false);
      expect(Object.keys(result.current.venueMap).length).toBe(2);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const calledUrl = (global.fetch as unknown as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain(
      'https://statsapi.mlb.com/api/v1/venues?venueIds=',
    );
    expect(calledUrl).toContain('hydrate=location');

    expect(calledUrl).toMatch(/venueIds=.*100/);
    expect(calledUrl).toMatch(/venueIds=.*200/);

    expect(result.current.venueError).toBeNull();
    expect(result.current.venueMap[100]).toEqual({
      id: 100,
      name: 'Venue A',
      city: 'Miami',
      state: 'FL',
    });
    expect(result.current.venueMap[200]).toEqual({
      id: 200,
      name: 'Venue B',
      city: 'Philadelphia',
      state: 'Pennsylvania',
    });
  });

  it('supports a bare array response shape', async () => {
    const schedule = makeScheduleWithVenueIds([300]);

    (global.fetch as unknown as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 300,
          name: 'Venue C',
          location: { city: 'San Juan', country: 'PR' },
        },
      ],
    });

    const { result } = renderHook(() => useVenueMap(schedule));

    await waitFor(() => {
      expect(result.current.isLoadingVenues).toBe(false);
      expect(result.current.venueMap[300]?.name).toBe('Venue C');
    });

    expect(result.current.venueMap[300]).toEqual({
      id: 300,
      name: 'Venue C',
      city: 'San Juan',
      state: 'PR',
    });
    expect(result.current.venueError).toBeNull();
  });

  it('sets venueError and clears loading when fetch fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const schedule = makeScheduleWithVenueIds([999]);

    (global.fetch as unknown as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useVenueMap(schedule));

    await waitFor(() => {
      expect(result.current.isLoadingVenues).toBe(false);
      expect(result.current.venueError).toBe('Unable to load venue details');
    });

    expect(result.current.venueMap).toEqual({});

    consoleSpy.mockRestore();
  });

  it('clears state when schedule becomes null', async () => {
    type Props = { schedule: ScheduleResponse | null };

    const scheduleWithVenues = makeScheduleWithVenueIds([123]);

    (global.fetch as unknown as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        venues: [
          {
            id: 123,
            name: 'Some Park',
            location: { city: 'X', stateAbbrev: 'Y' },
          },
        ],
      }),
    });

    const { result, rerender } = renderHook(
      (props: Props) => useVenueMap(props.schedule),
      { initialProps: { schedule: scheduleWithVenues } as Props },
    );

    await waitFor(() => {
      expect(result.current.isLoadingVenues).toBe(false);
      expect(result.current.venueMap[123]?.name).toBe('Some Park');
    });

    rerender({ schedule: null });

    expect(result.current.venueMap).toEqual({});
    expect(result.current.isLoadingVenues).toBe(false);
    expect(result.current.venueError).toBeNull();
  });
});