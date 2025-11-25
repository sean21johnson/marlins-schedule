/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';

import { useGamePitching } from './useGamePitching';

jest.mock('@/config/mlbParentAbbreviations', () => ({
  MLB_PARENT_ABBREVIATIONS: {
    100: 'MIA',
    200: 'PHI',
  },
}));

type FetchJson = Record<string, any>;

function mockOk(json: FetchJson) {
  return {
    ok: true,
    json: async () => json,
  } as Response;
}

function extractPkFromUrl(input: RequestInfo): number | null {
  const url = String(input);
  const match = url.match(/game\/(\d+)\//);
  return match ? Number(match[1]) : null;
}

describe('useGamePitching', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (globalThis as any).fetch = jest.fn();
  });

  it('hydrates probable pitchers + decisions, dedupes gamePks, and sets opponentParentAbbr correctly', async () => {
    const fetchMock = globalThis.fetch as jest.Mock;

    fetchMock.mockImplementation((input: RequestInfo) => {
      const pk = extractPkFromUrl(input);

      if (pk === 111) {
        return Promise.resolve(
          mockOk({
            gameData: {
              teams: {
                home: { id: 990, parentOrgId: 100 },
                away: { id: 991, parentOrgId: 200 },
              },
              probablePitchers: {
                home: { fullName: 'Home Prob (fallback)' },
                away: { fullName: 'Away Prob (fallback)' },
              },
            },
            liveData: {
              probablePitchers: {
                home: { fullName: 'Home Prob' },
                away: { fullName: 'Away Prob' },
              },
              decisions: {
                winner: { fullName: 'WP Name' },
                loser: { fullName: 'LP Name' },
                save: { fullName: 'SV Name' },
              },
            },
          }),
        );
      }

      if (pk === 222) {
        return Promise.resolve(
          mockOk({
            gameData: {
              teams: {
                home: { id: 200 }, 
                away: { id: 992, parentOrgId: 100 }, 
              },
              probablePitchers: {
                home: { fullName: 'MLB Home Prob' },
                away: { fullName: 'Away Prob 222' },
              },
            },
            liveData: {},
          }),
        );
      }

      throw new Error(`Unexpected gamePk in test fetch: ${String(input)}`);
    });

    const games = [
      { gamePk: 111, isHome: true }, 
      { gamePk: 222, isHome: false },
      { gamePk: 111, isHome: true }, 
    ] as any[];

    const { result } = renderHook(() => useGamePitching(games as any));

    await waitFor(() => {
      expect(result.current[0].probablePitchers).toEqual({
        home: 'Home Prob',
        away: 'Away Prob',
      });
    });

    expect(result.current[0].decisions).toEqual({
      winner: 'WP Name',
      loser: 'LP Name',
      save: 'SV Name',
    });

    expect(result.current[0].opponentParentAbbr).toBe('PHI');
    expect(result.current[2].opponentParentAbbr).toBe('PHI');

    expect(result.current[1].probablePitchers).toEqual({
      home: 'MLB Home Prob',
      away: 'Away Prob 222',
    });
    expect(result.current[1].opponentParentAbbr).toBeUndefined();

    const fetchedPks = (fetchMock.mock.calls as Array<[RequestInfo]>)
      .map(([input]) => extractPkFromUrl(input))
      .filter((v): v is number => typeof v === 'number');

    expect(new Set(fetchedPks)).toEqual(new Set([111, 222]));
  });
});