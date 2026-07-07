'use client';

import { useEffect, useState } from 'react';

// Primary download CTA with best-effort ARM64 detection (UA-CH).
export function DownloadButtons({ dlBase, repo }: { dlBase: string; repo: string }) {
  const [arch, setArch] = useState<'x64' | 'arm64'>('x64');
  // null = checking, true = a release exists, false = none published yet
  const [ready, setReady] = useState<boolean | null>(null);
  const [version, setVersion] = useState('');

  useEffect(() => {
    const api = repo.replace('github.com', 'api.github.com/repos') + '/releases/latest';
    fetch(api, { headers: { Accept: 'application/vnd.github+json' } })
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(d => { setReady(true); setVersion(String(d.tag_name ?? '')); })
      .catch(() => setReady(false));
  }, [repo]);

  useEffect(() => {
    const nav = navigator as Navigator & {
      userAgentData?: { getHighEntropyValues(h: string[]): Promise<{ architecture?: string }> };
    };
    nav.userAgentData?.getHighEntropyValues(['architecture'])
      .then(v => { if (v.architecture === 'arm') setArch('arm64'); })
      .catch(() => {});
  }, []);

  function track() {
    try { window.bcTrack?.('desktop_download', arch); } catch { /* noop */ }
  }

  if (ready === false) {
    return (
      <div className="dlw-cta">
        <div className="dlw-soon">
          <b>The first public build is being prepared.</b>
          <span>
            Check back shortly, or watch{' '}
            <a href={`${repo}/releases`} target="_blank" rel="noopener noreferrer">
              GitHub Releases ↗
            </a>{' '}
            to grab it the minute it lands.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="dlw-cta">
      <a className="dlw-btn" href={`${dlBase}/Busbar-Calculator-Setup-${arch}.exe`}
        aria-disabled={ready === null} onClick={track}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M3 5.5 10.5 4.4v7.1H3V5.5Zm0 13 7.5 1.1v-7H3v5.9ZM11.5 4.2 21 3v8.5h-9.5V4.2Zm0 15.6L21 21v-8.5h-9.5v7.3Z"/>
        </svg>
        Download for Windows {arch === 'arm64' ? '(ARM64)' : ''}
        {version && <em className="dlw-ver">{version.replace('desktop-', '')}</em>}
      </a>
      <div className="dlw-alts">
        <a href={`${dlBase}/Busbar-Calculator-Setup-x64.exe`} onClick={track}>x64 installer</a>
        <a href={`${dlBase}/Busbar-Calculator-Setup-arm64.exe`} onClick={track}>ARM64 installer</a>
        <a href={`${dlBase}/Busbar-Calculator-x64.msi`} onClick={track}>MSI (IT deploy)</a>
        <a href={`${dlBase}/SHA256SUMS.txt`}>checksums</a>
        <a href={`${repo}/releases`} target="_blank" rel="noopener noreferrer">all releases ↗</a>
      </div>
    </div>
  );
}
