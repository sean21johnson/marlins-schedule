import React from 'react';
import styled from 'styled-components';

import BaseDiamond from '@/components/Schedule/BaseDiamond';

import type { ScheduleTileProps } from '@/types/scheduleTile';

const RowWrapper = styled.article<{ $isLiveDemo: boolean }>`
  padding: 8px 12px;
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(0, 2.1fr) 220px;
  gap: 8px;
  align-items: flex-start;
  min-height: 80px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  background-color: ${({ $isLiveDemo }) => ($isLiveDemo ? '#e0f2fe' : '#ffffff')};
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`;

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const TeamTopRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  white-space: nowrap;
`;

const TeamName = styled.span`
  font-weight: 400;
  font-size: 1.2rem;
  color: #111827;
`;

const TeamScore = styled.span`
  font-weight: 700;
  font-size: 1.2rem;
  color: #111827;
`;

const DetailLine = styled.div`
  font-size: 0.78rem;
  color: #4b5563;
`;

const Middle = styled.div`
  font-size: 1.2rem;
  color: #111827;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  overflow: hidden;
  gap: 2px;
`;

const MatchupRow = styled.div`
  display: flex;
  align-items: baseline;
  white-space: nowrap;
  overflow: hidden;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const VsToken = styled.span`
  display: inline-block;
  width: 24px;
  text-align: right;
  margin-right: 8px;
  flex-shrink: 0;
  @media (max-width: 900px) {
    width: auto;
    text-align: left;
    margin-right: 0;
    margin-bottom: 2px;
  }
`;

const OpponentText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  @media (max-width: 900px) {
    white-space: normal;
  }
`;

const OpponentScore = styled.span`
  font-weight: 700;
  margin-left: 4px;
`;

const OpponentDetailLine = styled(DetailLine)`
  padding-left: 32px;
  @media (max-width: 900px) {
    padding-left: 0;
  }
`;

const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  min-width: 220px;
  max-width: 220px;
  font-size: 1.2rem;
  color: #111827;
  @media (max-width: 900px) {
    align-items: flex-start;
    min-width: 100%;
    max-width: 100%;
    margin-top: 4px;
  }
`;

const StatusText = styled.div`
  font-weight: 400;
`;

const VenueNameText = styled.div`
  margin-top: 2px;
  font-size: 0.78rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  @media (max-width: 900px) {
    white-space: normal;
  }
`;

const VenueLocationText = styled.div`
  font-size: 0.78rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  @media (max-width: 900px) {
    white-space: normal;
  }
`;

const LiveStatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DiamondWrapper = styled.div`
  flex-shrink: 0;
`;

function splitDetailLines(tile: ScheduleTileProps): {
  affiliateLines: string[];
  opponentLines: string[];
} {
  const detailLines = tile.detailLines ?? [];
  const affiliateLines: string[] = [];
  const opponentLines: string[] = [];

  const hasScores =
    typeof tile.affiliateRuns === 'number' &&
    typeof tile.opponentRuns === 'number';
  const affiliateWon = hasScores && tile.affiliateRuns! > tile.opponentRuns!;
  const opponentWon = hasScores && tile.opponentRuns! > tile.affiliateRuns!;

  for (const raw of detailLines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith('AFF:')) {
      affiliateLines.push(line.slice('AFF:'.length).trim());
      continue;
    }
    if (line.startsWith('OPP:')) {
      opponentLines.push(line.slice('OPP:'.length).trim());
      continue;
    }
    if (line.startsWith('BASES:')) {
      continue;
    }
    if (line.startsWith('Opp SP:')) {
      const rest = line.slice('Opp SP:'.length).trim();
      opponentLines.push(`SP: ${rest}`);
      continue;
    }
    if (line.startsWith('SP:')) {
      affiliateLines.push(line);
      continue;
    }

    if (line.startsWith('WP:') || line.startsWith('SV:')) {
      if (affiliateWon) {
        affiliateLines.push(line);
      } else if (opponentWon) {
        opponentLines.push(line);
      } else {
        affiliateLines.push(line);
      }
      continue;
    }

    if (line.startsWith('LP:')) {
      if (affiliateWon) {
        opponentLines.push(line);
      } else if (opponentWon) {
        affiliateLines.push(line);
      } else {
        opponentLines.push(line);
      }
      continue;
    }

    affiliateLines.push(line);
  }

  return { affiliateLines, opponentLines };
}

type LiveBases = {
  onFirst: boolean;
  onSecond: boolean;
  onThird: boolean;
};

function extractLiveBases(tile: ScheduleTileProps): LiveBases | null {
  const detailLines = tile.detailLines ?? [];
  const baseLine = detailLines
    .map((l) => l.trim())
    .find((l) => l.startsWith('BASES:'));

  if (!baseLine) return null;

  const payload = baseLine.slice('BASES:'.length);
  const [firstFlag, secondFlag, thirdFlag] = payload.split('-');

  return {
    onFirst: firstFlag === '1',
    onSecond: secondFlag === '1',
    onThird: thirdFlag === '1',
  };
}

const Game: React.FC<ScheduleTileProps> = (tile) => {
  const raw = (tile.matchupLabel ?? '').trim();
  let token: string | undefined;
  let opponentLabel = raw;

  if (raw.startsWith('@')) {
    token = '@';
    opponentLabel = raw.slice(1).trim();
  } else if (raw.startsWith('v ')) {
    token = 'vs.';
    opponentLabel = raw.slice(1).trim();
  }

  const { affiliateLines, opponentLines } = splitDetailLines(tile);

  let venueName: string | undefined;
  let venueLocation: string | undefined;

  if (tile.venueText) {
    const parts = tile.venueText
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      venueName = parts[0];
    }
    if (parts.length > 1) {
      venueLocation = parts.slice(1).join(', ');
    }
  }

  const isLiveDemo = tile.id != null && String(tile.id).startsWith('live-');
  const liveBases = isLiveDemo ? extractLiveBases(tile) : null;

  return (
    <RowWrapper data-testid="game-row" $isLiveDemo={isLiveDemo} role="listitem"
        aria-label={`${tile.teamName} ${tile.statusLabel}${opponentLabel ? `, ${token === '@' ? 'at' : 'versus'} ${opponentLabel}` : ''}`}
      >
      <Left data-testid="game-left">
        <TeamTopRow>
          <TeamName>{tile.teamName}</TeamName>
          {typeof tile.affiliateRuns === 'number' && (
            <TeamScore>{tile.affiliateRuns}</TeamScore>
          )}
        </TeamTopRow>
        {affiliateLines.map((line, idx) => (
          <DetailLine key={`a-${idx}`}>{line}</DetailLine>
        ))}
      </Left>
      <Middle data-testid="game-middle">
        {tile.matchupLabel ? (
          <MatchupRow>
            {token && (
              <VsToken aria-label={token === '@' ? 'at' : 'versus'}>{token}</VsToken>
            )}
            <OpponentText title={opponentLabel}>
              {opponentLabel}
              {typeof tile.opponentRuns === 'number' && (
                <OpponentScore>{tile.opponentRuns}</OpponentScore>
              )}
            </OpponentText>
          </MatchupRow>
        ) : (
          <span aria-hidden="true">&nbsp;</span>
        )}
        {opponentLines.map((line, idx) => (
          <OpponentDetailLine key={`o-${idx}`}>{line}</OpponentDetailLine>
        ))}
      </Middle>
      <RightCol data-testid="game-right">
        {isLiveDemo && liveBases ? (
          <>
            <LiveStatusRow>
              <StatusText>{tile.statusLabel}</StatusText>
              <DiamondWrapper>
                <BaseDiamond
                  onFirst={liveBases.onFirst}
                  onSecond={liveBases.onSecond}
                  onThird={liveBases.onThird}
                />
              </DiamondWrapper>
            </LiveStatusRow>
            {venueName && <VenueNameText>{venueName}</VenueNameText>}
            {venueLocation && (
              <VenueLocationText>{venueLocation}</VenueLocationText>
            )}
          </>
        ) : (
          <>
            <StatusText>{tile.statusLabel}</StatusText>
            {venueName && <VenueNameText>{venueName}</VenueNameText>}
            {venueLocation && (
              <VenueLocationText>{venueLocation}</VenueLocationText>
            )}
          </>
        )}
      </RightCol>
    </RowWrapper>
  );
};

export default Game;