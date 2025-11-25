import type { AffiliateGame } from '@/utils/mapScheduleToAffiliateGames';

import type { ScheduleTileProps } from '@/types/scheduleTile';

import type { VenueInfo } from '@/hooks/useVenueMap';

function formatLocalGameTime(utcIso?: string): string | undefined {
  if (!utcIso) return undefined;
  const d = new Date(utcIso);
  if (Number.isNaN(d.getTime())) return undefined;

  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

interface AffiliateGameWithParent extends AffiliateGame {
  opponentParentAbbr?: string;
}

export function generateGameTiles(
  affiliateGames: AffiliateGameWithParent[],
  venueMap: Record<number, VenueInfo>,
): ScheduleTileProps[] {
  return affiliateGames.map((game) => {
    const id = String(game.affiliateTeamId);
    const teamName = game.affiliateName;

    if (!game.hasGame) {
      return {
        id,
        teamName,
        levelLabel: '',
        statusLabel: 'NO GAME',
        matchupLabel: '',
        detailLines: [],
        venueText: undefined,
      };
    }

    const isHome = !!game.isHome;
    const opponentName = isHome ? game.awayTeamName : game.homeTeamName;

    const parentChunk =
      game.opponentParentAbbr && opponentName
        ? ` (${game.opponentParentAbbr})`
        : '';

    const matchupLabel = opponentName
      ? `${isHome ? 'v ' : '@ '}${opponentName}${parentChunk}`
      : '';

    let statusLabel: string;
    switch (game.status) {
      case 'FINAL':
        statusLabel = 'Final';
        break;
      case 'IN_PROGRESS':
        statusLabel = game.statusText ?? 'In Progress';
        break;
      case 'UPCOMING': {
        // If MLB marks start time as TBD, the API often sends a placeholder UTC time (ex: 07:33Z).
        // In that case we should show "Time TBD" instead of formatting it.
        const timeLabel = game.startTimeTbd
          ? undefined
          : formatLocalGameTime(game.startTimeUtc);

        statusLabel = timeLabel ?? 'Time TBD';
        break;
      }
      default:
        statusLabel = game.statusText || '';
    }

    const affiliateRuns = isHome ? game.homeScore : game.awayScore;
    const opponentRuns = isHome ? game.awayScore : game.homeScore;

    const venueInfo = game.venueId ? venueMap[game.venueId] : undefined;
    const venueParts: string[] = [];

    if (venueInfo?.name) venueParts.push(venueInfo.name);
    if (venueInfo?.city) venueParts.push(venueInfo.city);
    if (venueInfo?.state) venueParts.push(venueInfo.state);

    const venueText =
      venueParts.length > 0
        ? venueParts.join(', ')
        : game.venueName || undefined;

    const detailLines: string[] = [];

    if (game.status === 'UPCOMING' && game.probablePitchers) {
      const affiliateSp = isHome
        ? game.probablePitchers.home
        : game.probablePitchers.away;
      const opponentSp = isHome
        ? game.probablePitchers.away
        : game.probablePitchers.home;

      if (affiliateSp) detailLines.push(`SP: ${affiliateSp}`);
      if (opponentSp) detailLines.push(`Opp SP: ${opponentSp}`);
    }

    if (game.status === 'FINAL' && game.decisions) {
      const { winner, loser, save } = game.decisions;
      if (winner) detailLines.push(`WP: ${winner}`);
      if (save) detailLines.push(`SV: ${save}`);
      if (loser) detailLines.push(`LP: ${loser}`);
    }

    return {
      id,
      teamName,
      levelLabel: '',
      statusLabel,
      matchupLabel,
      detailLines,
      venueText,
      affiliateRuns: affiliateRuns ?? undefined,
      opponentRuns: opponentRuns ?? undefined,
      isFinal: game.status === 'FINAL',
    };
  });
}