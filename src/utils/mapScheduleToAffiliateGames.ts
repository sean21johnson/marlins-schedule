import { AFFILIATES } from '@/config/affiliates';

import type { ScheduleResponse, Game } from '@/types/schedule';

export type GameStatus = 'FINAL' | 'IN_PROGRESS' | 'UPCOMING';

export interface AffiliateGame {
  affiliateTeamId: number;
  affiliateName: string;
  hasGame: boolean;
  gamePk?: number;
  isHome?: boolean;
  homeTeamName?: string;
  awayTeamName?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  status?: GameStatus;
  statusText?: string;
  startTimeUtc?: string;
  venueId?: number;
  venueName?: string;
  probablePitchers?: {
    home?: string;
    away?: string;
  };
  decisions?: {
    winner?: string;
    loser?: string;
    save?: string;
  };
}

function mapStatus(abstractGameState: string, detailedState: string): GameStatus {
  const abstract = abstractGameState.toLowerCase();
  const detailed = detailedState.toLowerCase();

  if (abstract === 'live' || detailed.includes('in progress')) {
    return 'IN_PROGRESS';
  }

  if (abstract === 'final') {
    return 'FINAL';
  }

  return 'UPCOMING';
}

export function mapScheduleToAffiliateGames(
  schedule: ScheduleResponse | null,
): AffiliateGame[] {
  if (!schedule?.dates?.length) {
    return AFFILIATES.map((affiliate) => ({
      affiliateTeamId: affiliate.teamId,
      affiliateName: affiliate.name,
      hasGame: false,
    }));
  }

  const date = schedule.dates[0];

  const affiliateById = new Map(AFFILIATES.map((a) => [a.teamId, a]));
  const gameByAffiliateId = new Map<number, Game>();

  for (const game of date.games) {
    const homeId = game.teams.home.team.id;
    const awayId = game.teams.away.team.id;

    const homeAffiliate = affiliateById.get(homeId);
    const awayAffiliate = affiliateById.get(awayId);

    if (!homeAffiliate && !awayAffiliate) {
      continue;
    }

    const affiliate = homeAffiliate ?? awayAffiliate!;
    gameByAffiliateId.set(affiliate.teamId, game);
  }

  return AFFILIATES.map((affiliate) => {
    const game = gameByAffiliateId.get(affiliate.teamId);

    if (!game) {
      return {
        affiliateTeamId: affiliate.teamId,
        affiliateName: affiliate.name,
        hasGame: false,
      } satisfies AffiliateGame;
    }

    const homeSide = game.teams.home;
    const awaySide = game.teams.away;
    const homeId = homeSide.team.id;
    const isHome = homeId === affiliate.teamId;

    const status = mapStatus(
      game.status.abstractGameState,
      game.status.detailedState,
    );

    return {
      affiliateTeamId: affiliate.teamId,
      affiliateName: affiliate.name,
      hasGame: true,

      gamePk: game.gamePk,
      isHome,

      homeTeamName: homeSide.team.name,
      awayTeamName: awaySide.team.name,
      homeScore: typeof homeSide.score === 'number' ? homeSide.score : null,
      awayScore: typeof awaySide.score === 'number' ? awaySide.score : null,

      status,
      statusText: game.status.detailedState,
      startTimeUtc: game.gameDate,

      venueId: game.venue?.id,
      venueName: game.venue?.name ?? '',
    } satisfies AffiliateGame;
  });
}