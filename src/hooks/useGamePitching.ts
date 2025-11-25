import { useEffect, useMemo, useState } from 'react';

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

export function useGamePitching(
  games: AffiliateGame[],
): (AffiliateGame & { opponentParentAbbr?: string })[] {
  const gamePks = useMemo(
    () =>
      Array.from(
        new Set(
          games
            .map((g) => g.gamePk)
            .filter((pk): pk is number => typeof pk === 'number'),
        ),
      ),
    [games],
  );

  const [byPk, setByPk] = useState<GameInfoByPk>({});

  useEffect(() => {
    if (gamePks.length === 0) {
      return;
    }

    let cancelled = false;

    const fetchAll = async () => {
      try {
        const entries = await Promise.all(
          gamePks.map(async (pk) => {
            const res = await fetch(
              `https://statsapi.mlb.com/api/v1.1/game/${pk}/feed/live`,
            );
            if (!res.ok) {
              throw new Error(`Failed to fetch live game ${pk}`);
            }

            const json = await res.json();

            const liveProbable = json.liveData?.probablePitchers ?? null;
            const gameProbable = json.gameData?.probablePitchers ?? null;

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

            const decisionsRaw = json.liveData?.decisions ?? {};
            const decisions: DecisionsInfo = {
              winner: decisionsRaw.winner?.fullName,
              loser: decisionsRaw.loser?.fullName,
              save: decisionsRaw.save?.fullName,
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

        const next: GameInfoByPk = {};
        for (const [pk, info] of entries) {
          next[pk] = info;
        }
        setByPk(next);
      } catch (err) {
        if (!cancelled) {
          void err;
        }
      }
    };

    void fetchAll();

    return () => {
      cancelled = true;
    };
  }, [gamePks]);

  return useMemo(() => {
    if (gamePks.length === 0) return games;

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
  }, [games, byPk, gamePks]);
}