/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor } from '@testing-library/react';

import { useSchedule } from './useSchedule';

jest.mock('@/config/affiliates', () => ({
  AFFILIATES: [
    { teamId: 111, name: 'Affiliate A' },
    { teamId: 222, name: 'Affiliate B' },
  ],
}));

function mockOk(json: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => json,
  } as Response;
}

function mockNotOk(status: number) {
  return {
    ok: false,
    status,
    json: async () => ({}),
  } as Response;
}

describe('useSchedule', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (globalThis as any).fetch = jest.fn();
  });

  it('does not fetch when date is empty and returns data as null', () => {
    const fetchMock = globalThis.fetch as jest.Mock;

    const { result } = renderHook(() => useSchedule(''));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('fetches schedule for a date and builds the URL with teamId + sportId params', async () => {
    const fetchMock = globalThis.fetch as jest.Mock;

    const scheduleJson = { dates: [] };
    fetchMock.mockResolvedValueOnce(mockOk(scheduleJson));

    const { result } = renderHook(() => useSchedule('2025-01-15'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual(scheduleJson);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [calledUrl, calledOpts] = fetchMock.mock.calls[0] as [
      string,
      { signal?: AbortSignal } | undefined,
    ];

    const url = new URL(calledUrl);
    expect(url.origin + url.pathname).toBe(
      'https://statsapi.mlb.com/api/v1/schedule',
    );

    const teamIds = url.searchParams.getAll('teamId');
    expect(teamIds.sort()).toEqual(['111', '222']);

    const sportIds = url.searchParams.getAll('sportId');
    expect(sportIds.sort()).toEqual(['1', '11', '12', '13', '14', '16']);

    expect(url.searchParams.get('date')).toBe('2025-01-15');

    expect(calledOpts?.signal).toBeDefined();
  });

  it('sets a user-friendly error and clears data when the request fails', async () => {
    const fetchMock = globalThis.fetch as jest.Mock;

    const scheduleJson = { dates: [{ date: '2025-01-15' }] };
    fetchMock.mockResolvedValueOnce(mockOk(scheduleJson));
    fetchMock.mockResolvedValueOnce(mockNotOk(500));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result, rerender } = renderHook(({ d }) => useSchedule(d), {
      initialProps: { d: '2025-01-15' },
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(scheduleJson);
      expect(result.current.error).toBeNull();
    });

    rerender({ d: '2025-01-16' });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe(
        'Failed to load schedule. Please try again.',
      );
    });

    consoleSpy.mockRestore();
  });

  it('aborts the in-flight request when date changes and does not set an error for AbortError', async () => {
    const fetchMock = globalThis.fetch as jest.Mock;

    const abortSpy = jest
      .spyOn(AbortController.prototype, 'abort')
      .mockImplementation(function mockAbort(this: AbortController) {
        try {
          return (AbortController.prototype.abort as any).mock?.calls
            ? undefined
            : undefined;
        } catch {
          return undefined;
        }
      });

    fetchMock.mockImplementation((_url: string, opts?: { signal?: AbortSignal }) => {
      return new Promise((_resolve, reject) => {
        const signal = opts?.signal;
        if (!signal) return;

        const onAbort = () => {
          reject(new DOMException('Aborted', 'AbortError'));
        };

        if (signal.aborted) {
          onAbort();
          return;
        }

        signal.addEventListener('abort', onAbort, { once: true });
      });
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result, rerender } = renderHook(({ d }) => useSchedule(d), {
      initialProps: { d: '2025-01-15' },
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    rerender({ d: '2025-01-16' });

    await waitFor(() => {
      expect(abortSpy).toHaveBeenCalledTimes(1);
    });

    expect(result.current.error).toBeNull();
    expect(consoleSpy).not.toHaveBeenCalled();

    abortSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});