'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let wasDismissed = false;
    try { wasDismissed = !!localStorage.getItem('pp_install_dismissed'); } catch { /* ignore */ }
    if (wasDismissed) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 3500);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') { setVisible(false); setDeferredPrompt(null); }
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    try { localStorage.setItem('pp_install_dismissed', '1'); } catch { /* ignore */ }
  };

  if (dismissed || !deferredPrompt) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] px-3 sm:px-4"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(calc(100% + 2rem))',
        transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <div
        className="max-w-md mx-auto rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3"
        style={{
          background: '#131318',
          border: '1px solid rgba(184,115,51,0.3)',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(184,115,51,0.06)',
        }}
      >
        <div
          className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-base sm:text-lg font-black"
          style={{ background: 'linear-gradient(135deg, #b87333, #cd7f32, #e8a855)', color: '#060608' }}
        >
          PP
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-100 leading-tight truncate">Install PAYAPRESS</p>
          <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 leading-snug truncate">Add to home screen</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={handleDismiss}
            className="text-[11px] sm:text-xs text-zinc-600 hover:text-zinc-400 transition-colors px-1.5 sm:px-2 py-1 whitespace-nowrap"
            aria-label="Dismiss install prompt"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition-opacity hover:opacity-85 whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #cd7f32, #b87333)', color: '#fff' }}
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
