export interface ScheduleTileProps {
    id: string;
    teamName: string;
    levelLabel: string;
    statusLabel: string;
    matchupLabel?: string;
    detailLines?: string[];
    venueText?: string;
    affiliateRuns?: number | null;
    opponentRuns?: number | null;
    isFinal?: boolean;
  }