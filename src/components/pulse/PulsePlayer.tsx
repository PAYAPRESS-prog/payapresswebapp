'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/scrollLock';

/* Busbar Pulse — survey player. One question per screen, tap-first,
   skippable, progress dots. Mobile: bottom sheet; desktop: anchored
   card (both via .plx CSS). Partial answers are beaconed on close so
   nothing typed is ever lost. */

export interface PulseSurvey {
  id: number;
  slug: string;
  title: string;
  questions: Array<{
    id: string;
    type: 'emoji' | 'nps' | 'single' | 'multi' | 'text';
    title: string;
    options?: string[];
    max?: number;
  }>;
}

const EMOJIS = ['😖', '😕', '😐', '🙂', '🤩'];

function getVid(): string {
  try { return localStorage.getItem('bc_vid') ?? 'anon'; } catch { return 'anon'; }
}

export function PulsePlayer({
  survey, onClose, onComplete, dryRun = false, loggedIn = false,
}: {
  survey: PulseSurvey;
  onClose: () => void;
  onComplete: () => void;
  dryRun?: boolean;
  loggedIn?: boolean;
}) {
  const [step, setStep] = useState(0);           // question index; qs.length = done
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [email, setEmail] = useState('');
  const [leaving, setLeaving] = useState(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const sentFinal = useRef(false);
  const qs = survey.questions;
  const done = step >= qs.length;

  useEffect(() => { lockBodyScroll(); return () => unlockBodyScroll(); }, []);

  // Salvage partial answers if the tab closes mid-survey.
  useEffect(() => {
    if (dryRun) return;
    const salvage = () => {
      if (sentFinal.current || Object.keys(answersRef.current).length === 0) return;
      try {
        navigator.sendBeacon?.('/api/survey/respond', new Blob([JSON.stringify({
          surveyId: survey.id, visitorId: getVid(), answers: answersRef.current,
          partial: true, page: location.pathname,
          device: innerWidth < 640 ? 'mobile' : 'desktop',
        })], { type: 'application/json' }));
      } catch { /* best effort */ }
    };
    window.addEventListener('pagehide', salvage);
    return () => window.removeEventListener('pagehide', salvage);
  }, [dryRun, survey.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    setLeaving(true);
    if (!dryRun && !sentFinal.current && Object.keys(answersRef.current).length > 0) {
      // save whatever we have as partial (fire once, awaited server-side)
      sentFinal.current = true;
      fetch('/api/survey/respond', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: survey.id, visitorId: getVid(), answers: answersRef.current,
          partial: true, page: location.pathname,
          device: window.innerWidth < 640 ? 'mobile' : 'desktop', website: '',
        }),
      }).catch(() => {});
    }
    setTimeout(onClose, 300);
  }

  function setAnswer(qid: string, v: unknown, autoNext = false) {
    setAnswers(a => ({ ...a, [qid]: v }));
    if (autoNext) setTimeout(() => setStep(s => s + 1), 160);
  }

  async function finish() {
    sentFinal.current = true;
    setStep(qs.length); // thank-you view
    try { window.bcTrack?.('pulse_completed'); } catch { /* noop */ }
    if (!dryRun) {
      await fetch('/api/survey/respond', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: survey.id, visitorId: getVid(), answers: answersRef.current,
          partial: false, email: email.trim() || undefined,
          page: location.pathname,
          device: window.innerWidth < 640 ? 'mobile' : 'desktop', website: '',
        }),
      }).catch(() => {});
    }
    onComplete();
    setTimeout(() => { setLeaving(true); setTimeout(onClose, 300); }, 2500);
  }

  const q = qs[step];
  const isLast = step === qs.length - 1;

  return createPortal(
    <div className={`plx-overlay${leaving ? ' is-leaving' : ''}`} onClick={close}
      role="dialog" aria-modal="true" aria-label={survey.title}>
      <div className="plx-sheet" onClick={e => e.stopPropagation()}>
        <div className="plx-handle" aria-hidden />
        <button type="button" className="plx-close" onClick={close} aria-label="Close">✕</button>

        {!done && q && (
          <>
            <div className="plx-head">
              {step === 0 && (
                <div className="plx-mascot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/mr-busbar.png" alt="" width={30} height={86} />
                </div>
              )}
              <p className="plx-progress">
                {qs.map((_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}
                <span>{step + 1}/{qs.length}</span>
              </p>
              <h2 className="plx-title">{q.title}</h2>
            </div>

            {q.type === 'emoji' && (
              <div className="plx-emojis">
                {EMOJIS.map((e, i) => (
                  <button key={i} type="button"
                    className={`plx-emoji${answers[q.id] === i + 1 ? ' active' : ''}`}
                    onClick={() => setAnswer(q.id, i + 1, true)} aria-label={`${i + 1} of 5`}>
                    {e}
                  </button>
                ))}
              </div>
            )}

            {q.type === 'nps' && (
              <div className="plx-nps">
                {Array.from({ length: 11 }, (_, i) => (
                  <button key={i} type="button"
                    className={`plx-nps-n${answers[q.id] === i ? ' active' : ''}`}
                    onClick={() => setAnswer(q.id, i, true)}>
                    {i}
                  </button>
                ))}
                <div className="plx-nps-legend"><span>Not likely</span><span>Very likely</span></div>
              </div>
            )}

            {q.type === 'single' && (
              <div className="plx-opts">
                {(q.options ?? []).map(o => (
                  <button key={o} type="button"
                    className={`plx-opt${answers[q.id] === o ? ' active' : ''}`}
                    onClick={() => setAnswer(q.id, o, true)}>
                    {o}
                  </button>
                ))}
              </div>
            )}

            {q.type === 'multi' && (
              <div className="plx-opts">
                {(q.options ?? []).map(o => {
                  const cur = (answers[q.id] as string[]) ?? [];
                  const on = cur.includes(o);
                  return (
                    <button key={o} type="button" className={`plx-opt${on ? ' active' : ''}`}
                      aria-pressed={on}
                      onClick={() => setAnswer(q.id, on ? cur.filter(x => x !== o) : [...cur, o])}>
                      <i className="plx-check" aria-hidden>{on ? '✓' : ''}</i>{o}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === 'text' && (
              <div className="plx-textwrap">
                <textarea className="plx-textarea" rows={4}
                  maxLength={q.max ?? 280}
                  placeholder="Type here… (optional)"
                  value={(answers[q.id] as string) ?? ''}
                  onChange={e => setAnswer(q.id, e.target.value)} />
                {isLast && !loggedIn && (
                  <input className="plx-email" type="email" placeholder="Want a reply? Leave your email (optional)"
                    value={email} onChange={e => setEmail(e.target.value)} />
                )}
              </div>
            )}

            <div className="plx-foot">
              {step > 0
                ? <button type="button" className="plx-ghost" onClick={() => setStep(step - 1)}>‹ Back</button>
                : <span />}
              {isLast
                ? <button type="button" className="plx-primary" onClick={finish}>Send</button>
                : <button type="button" className="plx-ghost" onClick={() => setStep(step + 1)}>
                    {answers[q.id] !== undefined ? 'Next ›' : 'Skip ›'}
                  </button>}
            </div>
          </>
        )}

        {done && (
          <div className="plx-thanks">
            <div className="plx-mascot big">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mr-busbar.png" alt="" width={44} height={126} />
            </div>
            <h2>Thanks! 🧡</h2>
            <p>This genuinely shapes the roadmap.</p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default PulsePlayer;
