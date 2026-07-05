/**
 * Busbar Pulse smoke tests — player flow + answer validation.
 */
import { render, screen, fireEvent, act } from '@testing-library/react';
import PulsePlayer, { type PulseSurvey } from '@/components/pulse/PulsePlayer';
import { validateQuestions, validateAnswers } from '@/lib/pulse';

const SURVEY: PulseSurvey = {
  id: 1, slug: 'test', title: 'Test survey',
  questions: [
    { id: 'mood', type: 'emoji', title: 'How happy are you?' },
    { id: 'use', type: 'single', title: 'Main use?', options: ['A', 'B'] },
    { id: 'wish', type: 'text', title: 'Anything else?', max: 100 },
  ],
};

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true, status: 200, json: () => Promise.resolve({ ok: true }),
  } as Response) as unknown as typeof fetch;
});

describe('PulsePlayer', () => {
  it('walks the flow: emoji auto-advances, single advances, send finishes', async () => {
    jest.useFakeTimers();
    const onComplete = jest.fn();
    render(<PulsePlayer survey={SURVEY} onClose={() => {}} onComplete={onComplete} dryRun />);
    expect(screen.getByText('How happy are you?')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('5 of 5'));
    act(() => { jest.advanceTimersByTime(200); });
    expect(screen.getByText('Main use?')).toBeTruthy();
    fireEvent.click(screen.getByText('A'));
    act(() => { jest.advanceTimersByTime(200); });
    expect(screen.getByText('Anything else?')).toBeTruthy();
    fireEvent.click(screen.getByText('Send'));
    await act(async () => { await Promise.resolve(); });
    expect(screen.getByText(/Thanks/)).toBeTruthy();
    expect(onComplete).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('every step is skippable', () => {
    render(<PulsePlayer survey={SURVEY} onClose={() => {}} onComplete={() => {}} dryRun />);
    fireEvent.click(screen.getByText('Skip ›'));
    expect(screen.getByText('Main use?')).toBeTruthy();
  });
});

describe('pulse validation', () => {
  const qs = validateQuestions(SURVEY.questions)!;
  it('accepts valid question sets and rejects malformed ones', () => {
    expect(qs).toHaveLength(3);
    expect(validateQuestions([{ id: 'x', type: 'single', title: 'no options' }])).toBeNull();
    expect(validateQuestions([])).toBeNull();
  });
  it('validates answers strictly against the schema', () => {
    expect(validateAnswers(qs, { mood: 5, use: 'A', wish: 'hi' })).toBeTruthy();
    expect(validateAnswers(qs, { mood: 9 })).toBeNull();          // out of range
    expect(validateAnswers(qs, { use: 'C' })).toBeNull();          // unknown option
    expect(validateAnswers(qs, { hacker: 1 })).toBeNull();         // unknown qid
    expect(validateAnswers(qs, { wish: 'x'.repeat(200) })).toBeNull(); // over max
  });
});
