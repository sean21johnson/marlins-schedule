/* eslint-disable @typescript-eslint/no-explicit-any */
import { mapScheduleToAffiliateGames } from './mapScheduleToAffiliateGames';

jest.mock('@/config/affiliates', () => ({
  AFFILIATES: [
    { teamId: 100, name: 'Affiliate A' },
    { teamId: 200, name: 'Affiliate B' },
  ],
}));

describe('mapScheduleToAffiliateGames', () => {
  it('returns hasGame=false for every affiliate when schedule is null', () => {
    const result = mapScheduleToAffiliateGames(null);

    expect(result).toHaveLength(2);
    expect(result).toEqual([
      { affiliateTeamId: 100, affiliateName: 'Affiliate A', hasGame: false },
      { affiliateTeamId: 200, affiliateName: 'Affiliate B', hasGame: false },
    ]);
  });

  it('maps a single affiliate game, setting isHome, names, scores, venue, startTimeUtc, and status', () => {
    const schedule: any = {
      dates: [
        {
          games: [
            {
              gamePk: 111,
              gameDate: '2025-01-01T23:40:00Z',
              status: {
                abstractGameState: 'Final',
                detailedState: 'Final',
              },
              venue: { id: 999, name: 'Test Park' },
              teams: {
                home: { team: { id: 100, name: 'Affiliate A' }, score: 5 },
                away: { team: { id: 9999, name: 'Opponent X' }, score: 2 },
              },
            },
          ],
        },
      ],
    };

    const result = mapScheduleToAffiliateGames(schedule);

    const a = result.find((r) => r.affiliateTeamId === 100)!;
    const b = result.find((r) => r.affiliateTeamId === 200)!;

    expect(a.hasGame).toBe(true);
    expect(a.gamePk).toBe(111);
    expect(a.isHome).toBe(true);
    expect(a.homeTeamName).toBe('Affiliate A');
    expect(a.awayTeamName).toBe('Opponent X');
    expect(a.homeScore).toBe(5);
    expect(a.awayScore).toBe(2);
    expect(a.venueId).toBe(999);
    expect(a.venueName).toBe('Test Park');
    expect(a.startTimeUtc).toBe('2025-01-01T23:40:00Z');
    expect(a.status).toBe('FINAL');
    expect(a.statusText).toBe('Final');

    expect(b).toEqual({
      affiliateTeamId: 200,
      affiliateName: 'Affiliate B',
      hasGame: false,
    });
  });

  it('ignores games not involving any affiliate', () => {
    const schedule: any = {
      dates: [
        {
          games: [
            {
              gamePk: 222,
              gameDate: '2025-01-01T23:40:00Z',
              status: { abstractGameState: 'Preview', detailedState: 'Scheduled' },
              venue: { id: 1, name: 'Nope Park' },
              teams: {
                home: { team: { id: 9991, name: 'Nope Home' }, score: 0 },
                away: { team: { id: 9992, name: 'Nope Away' }, score: 0 },
              },
            },
          ],
        },
      ],
    };

    const result = mapScheduleToAffiliateGames(schedule);

    expect(result).toEqual([
      { affiliateTeamId: 100, affiliateName: 'Affiliate A', hasGame: false },
      { affiliateTeamId: 200, affiliateName: 'Affiliate B', hasGame: false },
    ]);
  });

  it('when both teams are affiliates, prefers the HOME affiliate for now', () => {
    const schedule: any = {
      dates: [
        {
          games: [
            {
              gamePk: 333,
              gameDate: '2025-01-01T23:40:00Z',
              status: { abstractGameState: 'Preview', detailedState: 'Scheduled' },
              teams: {
                home: { team: { id: 200, name: 'Affiliate B' }, score: 1 },
                away: { team: { id: 100, name: 'Affiliate A' }, score: 2 },
              },
              venue: { id: 2, name: 'Affiliate Park' },
            },
          ],
        },
      ],
    };

    const result = mapScheduleToAffiliateGames(schedule);

    const a = result.find((r) => r.affiliateTeamId === 100)!;
    const b = result.find((r) => r.affiliateTeamId === 200)!;

    expect(b.hasGame).toBe(true);
    expect(b.gamePk).toBe(333);
    expect(b.isHome).toBe(true);
    expect(a.hasGame).toBe(false);
  });

  it('maps status into IN_PROGRESS when abstract=live OR detailed includes "in progress"', () => {
    const schedule: any = {
      dates: [
        {
          games: [
            {
              gamePk: 444,
              gameDate: '2025-01-01T23:40:00Z',
              status: { abstractGameState: 'Live', detailedState: 'Something' },
              teams: {
                home: { team: { id: 100, name: 'Affiliate A' }, score: 0 },
                away: { team: { id: 9999, name: 'Opponent X' }, score: 0 },
              },
              venue: { id: 3, name: 'Live Park' },
            },
          ],
        },
      ],
    };

    const result = mapScheduleToAffiliateGames(schedule);
    const a = result.find((r) => r.affiliateTeamId === 100)!;
    expect(a.status).toBe('IN_PROGRESS');
  });

  it('maps status into UPCOMING for non-live, non-final states', () => {
    const schedule: any = {
      dates: [
        {
          games: [
            {
              gamePk: 555,
              gameDate: '2025-01-01T23:40:00Z',
              status: { abstractGameState: 'Preview', detailedState: 'Scheduled' },
              teams: {
                home: { team: { id: 100, name: 'Affiliate A' }, score: null },
                away: { team: { id: 9999, name: 'Opponent X' }, score: null },
              },
              venue: { id: 4, name: 'Soon Park' },
            },
          ],
        },
      ],
    };

    const result = mapScheduleToAffiliateGames(schedule);
    const a = result.find((r) => r.affiliateTeamId === 100)!;
    expect(a.status).toBe('UPCOMING');
  });
});