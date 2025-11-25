import { useEffect, useMemo, useRef, useState } from 'react';

import type { AffiliateGame } from '@/utils/mapScheduleToAffiliateGames';
import { MLB_PARENT_ABBREVIATIONS } from '@/config/mlbParentAbbreviations';

interface ProbablePitchersSide {
  home?: string;
  away?: string;
}

interface DecisionsInfo {
  winner?: string;
  loser?: string;
  save?: string;
}

interface GameExtraInfo {
  probablePitchers?: ProbablePitchersSide;
  decisions?: DecisionsInfo;
  homeParentAbbr?: string;
  awayParentAbbr?: string;
  homeIsMlb?: boolean;
  awayIsMlb?: boolean;
}

type GameInfoByPk = Record<number, GameExtraInfo>;

type LiveFeedResponse = {
  liveData?: {
    probablePitchers?: {
      home?: { fullName?: string };
      away?: { fullName?: string };
    };
    decisions?: {
      winner?: { fullName?: string };
      loser?: { fullName?: string };
      save?: { fullName?: string };
    };
  };
  gameData?: {
    probablePitchers?: {
      home?: { fullName?: string };
      away?: { fullName?: string };
    };
    teams?: {
      home?: { id?: number; parentOrgId?: number };
      away?: { id?: number; parentOrgId?: number };
    };
  };
};

function buildGamePkKey(games: AffiliateGame[]): string {
  const pks = new Set<number>();
  for (const g of games) {
    if (typeof g.gamePk === 'number') pks.add(g.gamePk);
  }
  return Array.from(pks)
    .sort((a, b) => a - b)
    .join(',');
}

export function useGamePitching(
  games: AffiliateGame[],
): (AffiliateGame & { opponentParentAbbr?: string })[] {
  const gamePkKey = useMemo(() => buildGamePkKey(games), [games]);

  const [byPk, setByPk] = useState<GameInfoByPk>({});

  const fetchedPksRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!gamePkKey) return;

    const pks = gamePkKey
      .split(',')
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n));

    const toFetch = pks.filter((pk) => !fetchedPksRef.current.has(pk));
    if (toFetch.length === 0) return;

    let cancelled = false;
    const controllers = toFetch.map(() => new AbortController());

    const fetchAll = async () => {
      try {
        const entries = await Promise.all(
          toFetch.map(async (pk, idx) => {
            const res = await fetch(
              `https://statsapi.mlb.com/api/v1.1/game/${pk}/feed/live`,
              { signal: controllers[idx].signal },
            );
            if (!res.ok) {
              throw new Error(`Failed to fetch live game ${pk}`);
            }

            const json = (await res.json()) as LiveFeedResponse;

            const liveProbable = json.liveData?.probablePitchers ?? undefined;
            const gameProbable = json.gameData?.probablePitchers ?? undefined;

            const probablePitchers: ProbablePitchersSide = {};
            const homeProb =
              liveProbable?.home?.fullName ??
              gameProbable?.home?.fullName ??
              undefined;
            const awayProb =
              liveProbable?.away?.fullName ??
              gameProbable?.away?.fullName ??
              undefined;

            if (homeProb) probablePitchers.home = homeProb;
            if (awayProb) probablePitchers.away = awayProb;

            const decisionsRaw = json.liveData?.decisions ?? undefined;
            const decisions: DecisionsInfo = {
              winner: decisionsRaw?.winner?.fullName,
              loser: decisionsRaw?.loser?.fullName,
              save: decisionsRaw?.save?.fullName,
            };

            const homeTeam = json.gameData?.teams?.home;
            const awayTeam = json.gameData?.teams?.away;

            let homeParentAbbr: string | undefined;
            let awayParentAbbr: string | undefined;
            let homeIsMlb = false;
            let awayIsMlb = false;

            if (homeTeam?.id != null) {
              const parentId = homeTeam.parentOrgId ?? homeTeam.id;
              homeParentAbbr = MLB_PARENT_ABBREVIATIONS[parentId];
              homeIsMlb = !!MLB_PARENT_ABBREVIATIONS[homeTeam.id];
            }

            if (awayTeam?.id != null) {
              const parentId = awayTeam.parentOrgId ?? awayTeam.id;
              awayParentAbbr = MLB_PARENT_ABBREVIATIONS[parentId];
              awayIsMlb = !!MLB_PARENT_ABBREVIATIONS[awayTeam.id];
            }

            const info: GameExtraInfo = {
              probablePitchers:
                Object.keys(probablePitchers).length > 0
                  ? probablePitchers
                  : undefined,
              decisions:
                decisions.winner || decisions.loser || decisions.save
                  ? decisions
                  : undefined,
              homeParentAbbr,
              awayParentAbbr,
              homeIsMlb,
              awayIsMlb,
            };

            return [pk, info] as const;
          }),
        );

        if (cancelled) return;

        for (const [pk] of entries) {
          fetchedPksRef.current.add(pk);
        }

        setByPk((prev) => {
          const next: GameInfoByPk = { ...prev };
          for (const [pk, info] of entries) {
            next[pk] = info;
          }
          return next;
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!cancelled) {
          void err;
        }
      }
    };

    void fetchAll();

    return () => {
      cancelled = true;
      for (const c of controllers) c.abort();
    };
  }, [gamePkKey]);

  return useMemo(() => {
    if (!gamePkKey) return games;

    return games.map((game) => {
      const pk = game.gamePk;
      if (typeof pk !== 'number') return game;

      const info = byPk[pk];
      if (!info) return game;

      let opponentParentAbbr: string | undefined;

      if (typeof game.isHome === 'boolean') {
        if (game.isHome) {
          const isMlb = info.awayIsMlb;
          opponentParentAbbr = isMlb ? undefined : info.awayParentAbbr;
        } else {
          const isMlb = info.homeIsMlb;
          opponentParentAbbr = isMlb ? undefined : info.homeParentAbbr;
        }
      }

      return {
        ...game,
        probablePitchers: info.probablePitchers ?? game.probablePitchers,
        decisions: info.decisions ?? game.decisions,
        opponentParentAbbr,
      };
    });
  }, [games, byPk, gamePkKey]);
}