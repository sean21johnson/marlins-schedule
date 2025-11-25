// src/types/scheduleTile.ts

export interface ScheduleTileProps {
    id: string;
    teamName: string;
    levelLabel: string;
  
    // Right-column status text: "NO GAME", "Final", "7:05 PM", etc.
    statusLabel: string;
  
    // Middle text: "vs FCL Mets (CHC)", "@ DSL Giants Black", etc.
    matchupLabel?: string;
  
    // Extra lines like "WP: Smith", "LP: Jones", "SV: Ramirez"
    detailLines?: string[];
  
    // Venue name (e.g. "Clover Park"). If we later add city/state, we can expand this.
    venueText?: string;
  
    // For games with scores (Final / Live).
    affiliateRuns?: number | null;
    opponentRuns?: number | null;
  
    // True when the game is completed.
    isFinal?: boolean;
  }