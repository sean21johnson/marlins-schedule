/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, renderHook, waitFor } from '@testing-library/react';

import { useLiveGameDemo } from './useLiveGameDemo';

const DEMO_GAME_PK = 567074;

function mockOk(json: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => json,
  } as Response;
}

function mockNotOk(status: number) {
  return {
    ok: false,
    status,
    json: async () => ({}),
  } as Response;
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe('useLiveGameDemo', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (globalThis as any).fetch = jest.fn();
  });

  it('fetches, maps feed into a live demo tile, and places Marlins on the left when they are HOME', async () => {
    const fetchMock = globalThis.fetch as jest.Mock;

    const deferred = createDeferred<Response>();
    fetchMock.mockReturnValueOnce(deferred.promise);

    const { result } = renderHook(() => useLiveGameDemo());

    act(() => {
      void result.current.loadDemo();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    deferred.resolve(
      mockOk({
        gameData: {
          gamePk: DEMO_GAME_PK,
          status: { detailedState: 'Final' },
          teams: {
            home: { name: 'Marlins' },
            away: { name: 'Philadelphia Phillies' },
          },
          venue: {
            name: 'loanDepot park',
            location: { city: 'Miami', state: 'FL' },
          },
        },
        liveData: {
          linescore: {
            teams: {
              home: { runs: 4 },
              away: { runs: 3 },
            },
            offense: { batter: { fullName: 'Jazz Chisholm Jr.' } },
            defense: { pitcher: { fullName: 'Zack Wheeler' } },
          },
        },
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.tile).not.toBeNull();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `https://statsapi.mlb.com/api/v1.1/game/${DEMO_GAME_PK}/feed/live`,
    );

    const tile = result.current.tile!;
    expect(tile.id).toBe(`live-${DEMO_GAME_PK}`);
    expect(tile.teamName).toBe('Marlins');
    expect(tile.matchupLabel).toBe('v Philadelphia Phillies');
    expect(tile.affiliateRuns).toBe(4);
    expect(tile.opponentRuns).toBe(3);

    // Demo overrides
    expect(tile.statusLabel).toBe('Top 5th, 2 outs');
    expect(tile.detailLines).toEqual(
      expect.arrayContaining([
        'AFF: At Bat: Jazz Chisholm Jr.',
        'OPP: Pitching: Zack Wheeler',
        'BASES:0-1-1',
      ]),
    );

    expect(tile.venueText).toBe('loanDepot park, Miami, FL');

    expect(tile.isFinal).toBe(false);
    expect(tile.levelLabel).toBe('LIVE DEMO');
  });

  it('places Marlins on the left when they are AWAY and uses "@ Opponent"', async () => {
    const fetchMock = globalThis.fetch as jest.Mock;

    fetchMock.mockResolvedValueOnce(
      mockOk({
        gameData: {
          gamePk: DEMO_GAME_PK,
          status: { detailedState: 'In Progress' },
          teams: {
            home: { name: 'Philadelphia Phillies' },
            away: { name: 'Miami Marlins' },
          },
          venue: {
            name: 'Citizens Bank Park',
            location: { city: 'Philadelphia', state: 'PA' },
          },
        },
        liveData: {
          linescore: {
            teams: {
              home: { runs: 2 },
              away: { runs: 5 },
            },
            offense: { batter: { fullName: 'Luis Arraez' } },
            defense: { pitcher: { fullName: 'Aaron Nola' } },
          },
        },
      }),
    );

    const { result } = renderHook(() => useLiveGameDemo());

    await act(async () => {
      await result.current.loadDemo();
    });

    await waitFor(() => {
      expect(result.current.tile).not.toBeNull();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `https://statsapi.mlb.com/api/v1.1/game/${DEMO_GAME_PK}/feed/live`,
    );

    const tile = result.current.tile!;
    expect(tile.teamName).toBe('Marlins');
    expect(tile.matchupLabel).toBe('@ Philadelphia Phillies');
    expect(tile.affiliateRuns).toBe(5);
    expect(tile.opponentRuns).toBe(2);
    expect(tile.venueText).toBe('Citizens Bank Park, Philadelphia, PA');

    expect(tile.detailLines).toEqual(
      expect.arrayContaining([
        'AFF: At Bat: Luis Arraez',
        'OPP: Pitching: Aaron Nola',
        'BASES:0-1-1',
      ]),
    );
  });

  it('sets error when the request fails and leaves tile null', async () => {
    const fetchMock = globalThis.fetch as jest.Mock;

    fetchMock.mockResolvedValueOnce(mockNotOk(500));

    const { result } = renderHook(() => useLiveGameDemo());

    await act(async () => {
      await result.current.loadDemo();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.tile).toBeNull();
      expect(result.current.error).toMatch(/Live demo request failed: 500/);
    });
  });
});