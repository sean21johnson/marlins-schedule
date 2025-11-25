import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';

import ScheduleList from './ScheduleList';

import type { ScheduleTileProps } from '@/types/scheduleTile';

const baseTile: ScheduleTileProps = {
  id: '1',
  teamName: 'Jacksonville Jumbo Shrimp',
  levelLabel: 'AAA',
  statusLabel: 'Final',
  matchupLabel: '@ Norfolk Tides',
  detailLines: ['SP: Affiliate SP', 'Opp SP: Opponent SP'],
  venueText: '1-800-ASK-GARY Field, Jacksonville, FL',
  affiliateRuns: 3,
  opponentRuns: 2,
  isFinal: true,
};

describe('ScheduleList', () => {
  it('renders an empty list when there are no tiles', () => {
    render(<ScheduleList tiles={[]} />);

    const list = screen.getByTestId('schedule-list');
    expect(list).toBeInTheDocument();

    const gameRows = within(list).queryAllByTestId('game-row');
    expect(gameRows).toHaveLength(0);
  });

  it('renders one Game row per tile', () => {
    const tiles: ScheduleTileProps[] = [
      baseTile,
      {
        ...baseTile,
        id: '2',
        teamName: 'Pensacola Blue Wahoos',
        matchupLabel: '@ Mississippi Braves',
        affiliateRuns: 5,
        opponentRuns: 1,
      },
    ];

    render(<ScheduleList tiles={tiles} />);

    const list = screen.getByTestId('schedule-list');
    const gameRows = within(list).getAllByTestId('game-row');
    expect(gameRows).toHaveLength(2);

    expect(
      within(list).getByText('Jacksonville Jumbo Shrimp'),
    ).toBeInTheDocument();
    expect(
      within(list).getByText('Pensacola Blue Wahoos'),
    ).toBeInTheDocument();
  });
});