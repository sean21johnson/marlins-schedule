/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';
import { useLiveGameDemo } from '@/hooks/useLiveGameDemo';

jest.mock('@/hooks/useTodayLocalDate', () => ({
  useTodayLocalDate: () => '2024-03-01',
}));

jest.mock('@/hooks/useSchedule', () => ({
  useSchedule: () => ({ data: { mock: true }, error: null }),
}));

jest.mock('@/hooks/useVenueMap', () => ({
  useVenueMap: () => ({ venueMap: new Map() }),
}));

jest.mock('@/utils/mapScheduleToAffiliateGames', () => ({
  mapScheduleToAffiliateGames: () => [
    { id: 'base-game', teamName: 'Base Team' },
  ],
}));

jest.mock('@/hooks/useGamePitching', () => ({
  useGamePitching: (games: any) => games,
}));

jest.mock('@/utils/generateGameTiles', () => ({
  generateGameTiles: (games: any) =>
    games.map((g: any) => ({
      id: g.id,
      teamName: g.teamName,
      levelLabel: 'AAA',
      statusLabel: 'Final',
      matchupLabel: '@ Opponent',
      detailLines: [],
      venueText: 'Demo Park, City, ST',
      affiliateRuns: 1,
      opponentRuns: 0,
      isFinal: true,
    })),
}));

jest.mock('@/components/DateControl/DateControl', () => {
  return {
    __esModule: true,
    default: (props: any) => (
      <button
        type="button"
        data-testid="date-control"
        onClick={() => props.onChangeDate('2024-03-02')}
      >
        Mock DateControl
      </button>
    ),
  };
});

jest.mock('@/components/Schedule/ScheduleList', () => {
  return {
    __esModule: true,
    default: (props: any) => (
      <div data-testid="schedule-list">
        {props.tiles.map((t: any) => (
          <div key={t.id} data-testid="schedule-list-item">
            {t.id}:{t.teamName}
          </div>
        ))}
      </div>
    ),
  };
});

jest.mock('@/hooks/useLiveGameDemo');

const mockedUseLiveGameDemo = useLiveGameDemo as jest.MockedFunction<
  typeof useLiveGameDemo
>;

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders heading, date control, and base schedule list', () => {
    mockedUseLiveGameDemo.mockReturnValue({
      tile: null,
      isLoading: false,
      error: null,
      loadDemo: jest.fn(),
    } as any);

    render(<App />);

    expect(
      screen.getByRole('heading', { name: /schedule and results/i }),
    ).toBeInTheDocument();

    expect(screen.getByTestId('date-control')).toBeInTheDocument();

    const items = screen.getAllByTestId('schedule-list-item');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('base-game:Base Team');
  });

  it('calls loadDemo when turning on simulation with no existing live tile', async () => {
    const user = userEvent.setup();
    const mockLoadDemo = jest.fn();

    mockedUseLiveGameDemo.mockReturnValue({
      tile: null,
      isLoading: false,
      error: null,
      loadDemo: mockLoadDemo,
    } as any);

    render(<App />);

    const button = screen.getByTestId('simulate-button');
    await user.click(button);

    expect(mockLoadDemo).toHaveBeenCalledTimes(1);
  });

  it('prepends live demo tile when present and simulation is toggled on', async () => {
    const user = userEvent.setup();
    const mockLoadDemo = jest.fn();

    const liveTile = {
      id: 'live-567074',
      teamName: 'Miami Marlins',
      levelLabel: 'LIVE DEMO',
      statusLabel: 'Top 5th, 2 outs',
      matchupLabel: 'v Philadelphia Phillies',
      detailLines: [],
      venueText: 'Citizens Bank Park, Philadelphia, PA',
      affiliateRuns: 4,
      opponentRuns: 3,
      isFinal: false,
    };

    mockedUseLiveGameDemo.mockReturnValue({
      tile: liveTile,
      isLoading: false,
      error: null,
      loadDemo: mockLoadDemo,
    } as any);

    render(<App />);

    const button = screen.getByTestId('simulate-button');
    await user.click(button);

    const items = screen.getAllByTestId('schedule-list-item');

    expect(items[0]).toHaveTextContent('live-567074:Miami Marlins');
    expect(items[1]).toHaveTextContent('base-game:Base Team');
  });

  it('renders live demo error text when present', () => {
    mockedUseLiveGameDemo.mockReturnValue({
      tile: null,
      isLoading: false,
      error: 'Live demo failed',
      loadDemo: jest.fn(),
    } as any);

    render(<App />);

    expect(screen.getByText('Live demo failed')).toBeInTheDocument();
  });
});