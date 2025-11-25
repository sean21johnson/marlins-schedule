/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateGameTiles } from './generateGameTiles';

describe('generateGameTiles', () => {
  const toLocaleSpy = jest
    .spyOn(Date.prototype, 'toLocaleTimeString')
    .mockReturnValue('6:40 PM');

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    toLocaleSpy.mockRestore();
  });

  it('returns a "NO GAME" tile when hasGame is false', () => {
    const tiles = generateGameTiles(
      [
        {
          affiliateTeamId: 999,
          affiliateName: 'FCL Marlins',
          hasGame: false,
        } as any,
      ],
      {},
    );

    expect(tiles).toHaveLength(1);
    expect(tiles[0]).toEqual({
      id: '999',
      teamName: 'FCL Marlins',
      levelLabel: '',
      statusLabel: 'NO GAME',
      matchupLabel: '',
      detailLines: [],
      venueText: undefined,
    });
  });

  it('builds an UPCOMING home tile: "v Opponent (PARENT)", time label, venue from venueMap, and SP lines', () => {
    const tiles = generateGameTiles(
      [
        {
          affiliateTeamId: 1,
          affiliateName: 'Miami Marlins',
          hasGame: true,
          isHome: true,
          awayTeamName: 'Jacksonville Jumbo Shrimp',
          opponentParentAbbr: 'MIA',
          status: 'UPCOMING',
          startTimeUtc: '2025-01-01T23:40:00Z',
          homeScore: undefined,
          awayScore: undefined,
          venueId: 123,
          probablePitchers: { home: 'Marlins SP', away: 'Jumbo Shrimp SP' },
        } as any,
      ],
      {
        123: { id: 123, name: 'loanDepot park', city: 'Miami', state: 'FL' },
      } as any,
    );

    expect(tiles).toHaveLength(1);

    const t = tiles[0];
    expect(t.teamName).toBe('Miami Marlins');
    expect(t.matchupLabel).toBe('v Jacksonville Jumbo Shrimp (MIA)');
    expect(t.statusLabel).toBe('6:40 PM');

    expect(t.venueText).toBe('loanDepot park, Miami, FL');

    expect(t.detailLines).toEqual(['SP: Marlins SP', 'Opp SP: Jumbo Shrimp SP']);

    expect(Date.prototype.toLocaleTimeString).toHaveBeenCalled();
    expect(Date.prototype.toLocaleTimeString).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ hour: 'numeric', minute: '2-digit' }),
    );
  });

  it('builds a FINAL away tile: "@ Opponent", status "Final", scores mapped and decisions lines in WP/SV/LP order', () => {
    const tiles = generateGameTiles(
      [
        {
          affiliateTeamId: 2,
          affiliateName: 'Miami Marlins',
          hasGame: true,
          isHome: false,
          homeTeamName: 'Philadelphia Phillies',
          opponentParentAbbr: undefined,
          status: 'FINAL',
          statusText: 'Final',
          homeScore: 5,
          awayScore: 3,
          venueName: 'Citizens Bank Park',
          decisions: { winner: 'WP Name', loser: 'LP Name', save: 'SV Name' },
        } as any,
      ],
      {},
    );

    const t = tiles[0];

    expect(t.matchupLabel).toBe('@ Philadelphia Phillies');

    expect(t.statusLabel).toBe('Final');
    expect(t.isFinal).toBe(true);

    expect(t.affiliateRuns).toBe(3);
    expect(t.opponentRuns).toBe(5);

    expect(t.detailLines).toEqual(['WP: WP Name', 'SV: SV Name', 'LP: LP Name']);

    expect(t.venueText).toBe('Citizens Bank Park');
  });

  it('builds an IN_PROGRESS tile using statusText and keeps detailLines empty if no metadata applies', () => {
    const tiles = generateGameTiles(
      [
        {
          affiliateTeamId: 3,
          affiliateName: 'Miami Marlins',
          hasGame: true,
          isHome: true,
          awayTeamName: 'New York Mets',
          status: 'IN_PROGRESS',
          statusText: 'Bottom 7th, 1 out',
          homeScore: 4,
          awayScore: 2,
        } as any,
      ],
      {},
    );

    const t = tiles[0];
    expect(t.statusLabel).toBe('Bottom 7th, 1 out');
    expect(t.matchupLabel).toBe('v New York Mets');
    expect(t.detailLines).toEqual([]);
    expect(t.isFinal).toBe(false);
  });

  it('uses "Time TBD" for UPCOMING when startTimeUtc is invalid', () => {
    const tiles = generateGameTiles(
      [
        {
          affiliateTeamId: 4,
          affiliateName: 'Miami Marlins',
          hasGame: true,
          isHome: true,
          awayTeamName: 'Boston Red Sox',
          status: 'UPCOMING',
          startTimeUtc: 'not-a-date',
        } as any,
      ],
      {},
    );

    expect(tiles[0].statusLabel).toBe('Time TBD');
  });
});