/**
 * Regression: the onboarding tour (z-9000) must never cover an open
 * sheet — it swallowed the auth sheet's Sign Up tab clicks in production.
 * Sheets signal openness by locking body scroll via src/lib/scrollLock.ts.
 */
import { render, act, cleanup } from '@testing-library/react';
import { FxTour } from '@/components/figma/FxTour';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/scrollLock';

jest.useFakeTimers();

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
  localStorage.clear();
});

function tourVisible() {
  return document.querySelector('.fx-tour') !== null;
}

describe('FxTour vs open sheets', () => {
  it('does NOT auto-start while a sheet is open, starts after it closes', async () => {
    lockBodyScroll(); // e.g. the auth sheet is open
    render(<FxTour />);

    await act(async () => { jest.advanceTimersByTime(2400); });
    expect(tourVisible()).toBe(false); // held back

    await act(async () => { jest.advanceTimersByTime(2000); });
    expect(tourVisible()).toBe(false); // still held back while locked

    unlockBodyScroll(); // sheet closed
    await act(async () => { jest.advanceTimersByTime(1200); });
    expect(tourVisible()).toBe(true); // now it may start
  });

  it('pauses when a sheet opens mid-tour and resumes after it closes', async () => {
    render(<FxTour />);
    await act(async () => { jest.advanceTimersByTime(2400); });
    expect(tourVisible()).toBe(true);

    lockBodyScroll(); // user opened a sheet during the tour
    await act(async () => { jest.advanceTimersByTime(1500); });
    expect(tourVisible()).toBe(false); // tour stepped aside

    unlockBodyScroll();
    await act(async () => { jest.advanceTimersByTime(1500); });
    expect(tourVisible()).toBe(true); // resumed at the same step
  });

  it('never auto-starts once marked as seen', async () => {
    localStorage.setItem('pp_tour_seen_v1', '1');
    render(<FxTour />);
    await act(async () => { jest.advanceTimersByTime(4000); });
    expect(tourVisible()).toBe(false);
  });
});
