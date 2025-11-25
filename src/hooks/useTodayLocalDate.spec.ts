import { useTodayLocalDate } from './useTodayLocalDate';

describe('useTodayLocalDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns today in local YYYY-MM-DD format', () => {
    jest.setSystemTime(new Date(2025, 0, 2, 12, 0, 0)); 

    expect(useTodayLocalDate()).toBe('2025-01-02');
  });

  it('zero-pads month and day', () => {
    jest.setSystemTime(new Date(2025, 8, 7, 9, 0, 0)); 

    expect(useTodayLocalDate()).toBe('2025-09-07');
  });
});