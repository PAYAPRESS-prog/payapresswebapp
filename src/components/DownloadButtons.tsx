'use client';

import { useEffect, useState } from 'react';

// Primary download CTA with best-effort ARM64 detection (UA-CH).
export function DownloadButtons({ dlBase, repo }: { dlBase: string; repo: string }) {
  const [arch, setArch] = useState<'x64' | 'arm64'>('x64');

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

  return (
    <div className="dlw-cta">
      <a className="dlw-btn" href={`${dlBase}/Busbar-Calculator-Setup-${arch}.exe`} onClick={track}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M3 5.5 10.5 4.4v7.1H3V5.5Zm0 13 7.5 1.1v-7H3v5.9ZM11.5 4.2 21 3v8.5h-9.5V4.2Zm0 15.6L21 21v-8.5h-9.5v7.3Z"/>
        </svg>
        Download for Windows {arch === 'arm64' ? '(ARM64)' : ''}
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
