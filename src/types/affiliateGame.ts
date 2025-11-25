import type { AffiliateConfig } from '@/config/affiliates';

export type GameState = 'NOT_STARTED' | 'FINAL' | 'IN_PROGRESS';

export interface AffiliateGame {
  affiliate: AffiliateConfig;
  hasGame: boolean;
  state: GameState;
  isHome: boolean;
  opponentName?: string;
  opponentParentClub?: string;
  venue?: string;
  startTimeLocal?: string;
  score?: {
    affiliate: number;
    opponent: number;
  };
  probablePitchers?: {
    affiliate?: string;
    opponent?: string;
  };
  decisions?: {
    winner?: string;
    loser?: string;
    save?: string;
  };
}