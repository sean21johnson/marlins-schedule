import React from 'react';
import styled from 'styled-components';

import type { ScheduleTileProps } from '@/types/scheduleTile';
import Game from '@/components/Schedule/Game';

interface ScheduleListProps {
  tiles: ScheduleTileProps[];
}

const ListWrapper = styled.section`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  @media (max-width: 900px) {
    gap: 6px;
    padding: 0 8px;
  }
`;

export const ScheduleList: React.FC<ScheduleListProps> = ({ tiles }) => {
  return (
    <ListWrapper
      aria-label="Affiliate schedule"
      data-testid="schedule-list"
      role="list"
    >
      {tiles.map((tile) => (
        <Game key={tile.id} {...tile} />
      ))}
    </ListWrapper>
  );
};

export default ScheduleList;