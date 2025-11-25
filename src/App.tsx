import React, { useState } from 'react';
import styled from 'styled-components';
import { PageWrapper } from '@/styles';

import DateControl from '@/components/DateControl/DateControl';
import ScheduleList from '@/components/Schedule/ScheduleList';
import SimulateButton from '@/components/SimulateButton/SimulateButton';

import { useTodayLocalDate } from '@/hooks/useTodayLocalDate';
import { useSchedule } from '@/hooks/useSchedule';
import { useVenueMap } from '@/hooks/useVenueMap';
import { mapScheduleToAffiliateGames } from '@/utils/mapScheduleToAffiliateGames';
import { generateGameTiles } from '@/utils/generateGameTiles';
import { useGamePitching } from '@/hooks/useGamePitching';
import { useLiveGameDemo } from '@/hooks/useLiveGameDemo';

import type { ScheduleTileProps } from '@/types/scheduleTile';

const Header = styled.header`
  text-align: center;
  margin-bottom: 24px;
`;

const TitleRow = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const MarlinsLogo = styled.img`
  width: 34px;
  height: 34px;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  color: #00A3E0;
`;

const HeaderRow = styled.div`
  margin-top: 8px;
`;

const LiveDemoErrorText = styled.div`
  margin-top: 4px;
  font-size: 0.8rem;
  color: #b91c1c;
`;

const ErrorText = styled.div`
  margin-top: 8px;
  font-size: 0.9rem;
`;

const App: React.FC = () => {
  const today = useTodayLocalDate();
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [showLiveDemo, setShowLiveDemo] = useState(false);

  const { data, error } = useSchedule(selectedDate);
  const { venueMap } = useVenueMap(data ?? null);
  const affiliateGames = data ? mapScheduleToAffiliateGames(data) : [];
  const gamesWithPitching = useGamePitching(affiliateGames);
  const {
    tile: liveDemoTile,
    isLoading: isLoadingLiveDemo,
    error: liveDemoError,
    loadDemo,
  } = useLiveGameDemo();

  const baseTiles: ScheduleTileProps[] = generateGameTiles(
    gamesWithPitching,
    venueMap,
  );

  const handleToggleLiveDemo = () => {
    if (showLiveDemo) {
      setShowLiveDemo(false);
      return;
    }

    setShowLiveDemo(true);

    if (!liveDemoTile && !isLoadingLiveDemo) {
      void loadDemo();
    }
  };

  const gameTiles: ScheduleTileProps[] =
    showLiveDemo && liveDemoTile ? [liveDemoTile, ...baseTiles] : baseTiles;

  return (
    <PageWrapper as="main">
      <Header>
        <TitleRow>
          <MarlinsLogo src="/marlins-logo.png" alt="Miami Marlins logo" />
          <HeaderTitle>Schedule and Results</HeaderTitle>
        </TitleRow>
        <HeaderRow>
          <DateControl
            selectedDate={selectedDate}
            onChangeDate={setSelectedDate}
          />
        </HeaderRow>
        <HeaderRow>
          <SimulateButton
            onClick={handleToggleLiveDemo}
            disabled={isLoadingLiveDemo}
            active={showLiveDemo}
            aria-controls="schedule-list"
          >
            {showLiveDemo ? 'End Live Game Simulation' : 'Simulate Live Game'}
          </SimulateButton>
          {liveDemoError && (
            <LiveDemoErrorText role="alert">{liveDemoError}</LiveDemoErrorText>
          )}
        </HeaderRow>
        <ErrorText role="alert">{error && <span>{error}</span>}</ErrorText>
      </Header>

      <section aria-label="Schedule content">
        <ScheduleList tiles={gameTiles} />
      </section>
    </PageWrapper>
  );
};

export default App;