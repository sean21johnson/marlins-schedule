// src/types/schedule.ts

export interface Person {
  fullName: string;
}

export interface Team {
  id: number;
  name: string;
  abbreviation?: string;
  parentOrgName?: string;
}

export interface Side {
  team: Team;
  score?: number;
}

export interface GameStatus {
  abstractGameState: string; // "Preview" | "Live" | "Final" | etc
  detailedState: string;
}

export interface Venue {
  id?: number;
  name?: string;
  link?: string;
}

export interface Game {
  gamePk: number;
  gameDate: string; // ISO string
  status: GameStatus;
  teams: {
    home: Side;
    away: Side;
  };
  venue?: Venue;
  probablePitchers?: {
    home?: Person;
    away?: Person;
  };
  decisions?: {
    winner?: Person;
    loser?: Person;
    save?: Person;
  };
}

export interface ScheduleDate {
  date: string; // "2025-07-15"
  totalItems: number;
  games: Game[];
}

export interface ScheduleResponse {
  dates: ScheduleDate[];
  totalItems: number;
}