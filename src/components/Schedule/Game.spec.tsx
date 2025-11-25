import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';

import Game from './Game';
import type { ScheduleTileProps } from '../../types/scheduleTile';

const baseTile: ScheduleTileProps = {
  id: '1A',
  teamName: 'Jacksonville Jumbo Shrimp',
  levelLabel: 'AAA',
  statusLabel: 'Final',
  matchupLabel: '@ Norfolk Tides',
  detailLines: [
    'SP: Affiliate SP',
    'Opp SP: Opponent SP',
    'AFF: Custom affiliate line',
    'OPP: Custom opponent line',
    'BASES:0-0-0',
  ],
  venueText: '1-800-ASK-GARY Field, Jacksonville, FL',
  affiliateRuns: 3,
  opponentRuns: 2,
  isFinal: true,
};

describe('Game', () => {
  it('renders affiliate and opponent info with scores and venue', () => {
    render(<Game {...baseTile} />);

    const left = screen.getByTestId('game-left');
    const middle = screen.getByTestId('game-middle');
    const right = screen.getByTestId('game-right');

    expect(
      within(left).getByText('Jacksonville Jumbo Shrimp'),
    ).toBeInTheDocument();
    expect(within(left).getByText('3')).toBeInTheDocument();
    expect(within(left).getByText('SP: Affiliate SP')).toBeInTheDocument();
    expect(
      within(left).getByText('Custom affiliate line'),
    ).toBeInTheDocument();

    expect(within(middle).getByText('@')).toBeInTheDocument();
    expect(within(middle).getByText('Norfolk Tides')).toBeInTheDocument();
    expect(within(middle).getByText('2')).toBeInTheDocument();
    expect(within(middle).getByText('SP: Opponent SP')).toBeInTheDocument();
    expect(
      within(middle).getByText('Custom opponent line'),
    ).toBeInTheDocument();

    expect(within(right).getByText('Final')).toBeInTheDocument();
    expect(
      within(right).getByText('1-800-ASK-GARY Field'),
    ).toBeInTheDocument();
    expect(within(right).getByText('Jacksonville, FL')).toBeInTheDocument();
  });

  it('renders live demo with base diamond and runners from BASES metadata', () => {
    const liveTile: ScheduleTileProps = {
      ...baseTile,
      id: 'live-567074',
      teamName: 'Miami Marlins',
      matchupLabel: 'v Philadelphia Phillies',
      statusLabel: 'Top 5th, 2 outs',
      detailLines: [
        'AFF: At Bat: Jazz Chisholm Jr.',
        'OPP: Pitching: Zack Wheeler',
        'BASES:0-1-1',
      ],
      venueText: 'Citizens Bank Park, Philadelphia, PA',
      affiliateRuns: 4,
      opponentRuns: 3,
      isFinal: false,
    };

    render(<Game {...liveTile} />);

    const left = screen.getByTestId('game-left');
    const middle = screen.getByTestId('game-middle');
    const right = screen.getByTestId('game-right');

    expect(within(left).getByText('Miami Marlins')).toBeInTheDocument();
    expect(within(left).getByText('4')).toBeInTheDocument();
    expect(within(middle).getByText('Philadelphia Phillies')).toBeInTheDocument();
    expect(within(middle).getByText('3')).toBeInTheDocument();

    expect(
      within(left).getByText('At Bat: Jazz Chisholm Jr.'),
    ).toBeInTheDocument();
    expect(
      within(middle).getByText('Pitching: Zack Wheeler'),
    ).toBeInTheDocument();

    expect(within(right).getByText('Top 5th, 2 outs')).toBeInTheDocument();
    const diamond = within(right).getByTestId('base-diamond');
    expect(diamond).toBeInTheDocument();

    expect(
      within(diamond).queryByTestId('base-runner-first'),
    ).not.toBeInTheDocument();
    expect(
      within(diamond).getByTestId('base-runner-second'),
    ).toBeInTheDocument();
    expect(
      within(diamond).getByTestId('base-runner-third'),
    ).toBeInTheDocument();

    expect(
      within(right).getByText('Citizens Bank Park'),
    ).toBeInTheDocument();
    expect(
      within(right).getByText('Philadelphia, PA'),
    ).toBeInTheDocument();
  });
});