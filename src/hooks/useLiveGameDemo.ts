// src/hooks/useLiveGameDemo.ts
import { useCallback, useState } from 'react';
import type { ScheduleTileProps } from '@/types/scheduleTile';

// Example historical Miami Marlins game for the demo.
const DEMO_GAME_PK = 567074;

interface LiveFeedResponse {
  gameData: {
    gamePk: number;
    status: {
      abstractGameState?: string;
      detailedState?: string;
    };
    teams: {
      home: { name: string };
      away: { name: string };
    };
    venue?: {
      name?: string;
      location?: {
        city?: string;
        state?: string;
      };
    };
  };
  liveData?: {
    linescore?: {
      currentInningOrdinal?: string;
      inningState?: string; // "Top" / "Bottom"
      outs?: number;
      balls?: number;
      strikes?: number;
      teams?: {
        home?: { runs?: number };
        away?: { runs?: number };
      };
      offense?: {
        batter?: { fullName?: string };
        first?: unknown;
        second?: unknown;
        third?: unknown;
      };
      defense?: {
        pitcher?: { fullName?: string };
      };
    };
    plays?: {
      currentPlay?: {
        matchup?: {
          batter?: { fullName?: string };
          pitcher?: { fullName?: string };
        };
      };
    };
  };
}

interface LiveGameDemoState {
  tile: ScheduleTileProps | null;
  isLoading: boolean;
  error: string | null;
}

function normalizeMarlinsName(name: string): string {
  // MLB Stats API typically returns "Miami Marlins"
  return name === 'Miami Marlins' ? 'Marlins' : name;
}

function mapLiveFeedToTile(feed: LiveFeedResponse): ScheduleTileProps {
  const homeName = feed.gameData.teams.home.name;
  const awayName = feed.gameData.teams.away.name;
  const ls = feed.liveData?.linescore;

  const homeRuns = ls?.teams?.home?.runs ?? undefined;
  const awayRuns = ls?.teams?.away?.runs ?? undefined;

  const MARLINS_KEY = 'Marlins';

  const isMarlinsHome = homeName.includes(MARLINS_KEY);
  const isMarlinsAway = awayName.includes(MARLINS_KEY);

  let affiliateName: string;
  let opponentName: string;
  let affiliateRuns: number | undefined;
  let opponentRuns: number | undefined;
  let matchupLabel: string;

  if (isMarlinsHome) {
    affiliateName = normalizeMarlinsName(homeName);
    affiliateRuns = homeRuns;
    opponentName = awayName;
    opponentRuns = awayRuns;
    matchupLabel = `v ${opponentName}`;
  } else if (isMarlinsAway) {
    affiliateName = normalizeMarlinsName(awayName);
    affiliateRuns = awayRuns;
    opponentName = homeName;
    opponentRuns = homeRuns;
    matchupLabel = `@ ${opponentName}`;
  } else {
    affiliateName = homeName;
    affiliateRuns = homeRuns;
    opponentName = awayName;
    opponentRuns = awayRuns;
    matchupLabel = `v ${opponentName}`;
  }

  const offense = ls?.offense;
  const defense = ls?.defense;

  const currentPlay = feed.liveData?.plays?.currentPlay;
  const batterName =
    currentPlay?.matchup?.batter?.fullName ||
    offense?.batter?.fullName ||
    undefined;
  const pitcherName =
    currentPlay?.matchup?.pitcher?.fullName ||
    defense?.pitcher?.fullName ||
    undefined;

  const detailLines: string[] = [];

  if (batterName) {
    detailLines.push(`AFF: At Bat: ${batterName}`);
  }
  if (pitcherName) {
    detailLines.push(`OPP: Pitching: ${pitcherName}`);
  }

  // ---------------------------------------------------
  // DEMO OVERRIDE: always show runners in scoring position
  // ---------------------------------------------------
  const demoOnFirst = false;
  const demoOnSecond = true;
  const demoOnThird = true;

  const firstFlag = demoOnFirst ? '1' : '0';
  const secondFlag = demoOnSecond ? '1' : '0';
  const thirdFlag = demoOnThird ? '1' : '0';
  detailLines.push(`BASES:${firstFlag}-${secondFlag}-${thirdFlag}`);

  const statusLabel = 'Top 5th, 2 outs';

  const venueName = feed.gameData.venue?.name;
  const venueCity = feed.gameData.venue?.location?.city;
  const venueState = feed.gameData.venue?.location?.state;

  let venueText: string | undefined;
  if (venueName) {
    const locParts = [venueCity, venueState].filter(Boolean);
    venueText =
      locParts.length > 0 ? `${venueName}, ${locParts.join(', ')}` : venueName;
  }

  return {
    id: `live-${feed.gameData.gamePk}`,
    teamName: affiliateName,
    levelLabel: 'LIVE DEMO',
    statusLabel,
    matchupLabel,
    detailLines,
    venueText,
    affiliateRuns,
    opponentRuns,
    isFinal: false,
  };
}

export function useLiveGameDemo() {
  const [state, setState] = useState<LiveGameDemoState>({
    tile: null,
    isLoading: false,
    error: null,
  });

  const loadDemo = useCallback(async () => {
    try {
      setState((s) => ({ ...s, isLoading: true, error: null }));

      const res = await fetch(
        `https://statsapi.mlb.com/api/v1.1/game/${DEMO_GAME_PK}/feed/live`,
      );
      if (!res.ok) {
        throw new Error(`Live demo request failed: ${res.status}`);
      }

      const json = (await res.json()) as LiveFeedResponse;
      const tile = mapLiveFeedToTile(json);

      setState({ tile, isLoading: false, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown live demo error';
      setState({ tile: null, isLoading: false, error: message });
    }
  }, []);

  return {
    tile: state.tile,
    isLoading: state.isLoading,
    error: state.error,
    loadDemo,
  };
}