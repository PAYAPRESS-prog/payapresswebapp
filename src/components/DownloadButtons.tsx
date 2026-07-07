'use client';

import { useEffect, useState } from 'react';

// Set this to the Play Store URL once the listing is live, e.g.
// 'https://play.google.com/store/apps/details?id=com.payapress.calculator'
// — the Android section then swaps the "coming soon" chip for a real
// Google Play button automatically.
const PLAY_STORE_URL = '';

type Platform = 'windows' | 'android';

interface ReleaseInfo {
  // null = checking, '' = no release published yet, 'tag' = ready
  windows: string | null;
  android: string | null;
}

// Releases are per-platform tags (desktop-v* / android-v*), so
// `releases/latest` is wrong for both — it points at whichever platform
// shipped last. Fetch the release list once and pick the newest tag of each.
function useReleases(repo: string): ReleaseInfo {
  const [info, setInfo] = useState<ReleaseInfo>({ windows: null, android: null });
  useEffect(() => {
    const api = repo.replace('github.com', 'api.github.com/repos') + '/releases?per_page=30';
    fetch(api, { headers: { Accept: 'application/vnd.github+json' } })
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((list: Array<{ tag_name?: string; draft?: boolean }>) => {
        const tags = (Array.isArray(list) ? list : [])
          .filter(r => !r.draft)
          .map(r => String(r.tag_name ?? ''));
        setInfo({
          windows: tags.find(t => t.startsWith('desktop-v')) ?? '',
          android: tags.find(t => t.startsWith('android-v')) ?? '',
        });
      })
      .catch(() => setInfo({ windows: '', android: '' }));
  }, [repo]);
  return info;
}

function WinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 5.5 10.5 4.4v7.1H3V5.5Zm0 13 7.5 1.1v-7H3v5.9ZM11.5 4.2 21 3v8.5h-9.5V4.2Zm0 15.6L21 21v-8.5h-9.5v7.3Z"/>
    </svg>
  );
}

function AndroidIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.46 11.46 0 0 0-8.94 0L5.65 5.67c-.19-.29-.58-.38-.87-.2-.28.18-.37.54-.22.83L6.4 9.48A10.81 10.81 0 0 0 1 18h22a10.81 10.81 0 0 0-5.4-8.52ZM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z"/>
    </svg>
  );
}

function Soon({ repo, label }: { repo: string; label: string }) {
  return (
    <div className="dlw-soon">
      <b>{label}</b>
      <span>
        Check back shortly, or watch{' '}
        <a href={`${repo}/releases`} target="_blank" rel="noopener noreferrer">
          GitHub Releases ↗
        </a>{' '}
        to grab it the minute it lands.
      </span>
    </div>
  );
}

function WindowsCta({ repo, tag }: { repo: string; tag: string | null }) {
  const [arch, setArch] = useState<'x64' | 'arm64'>('x64');
  useEffect(() => {
    const nav = navigator as Navigator & {
      userAgentData?: { getHighEntropyValues(h: string[]): Promise<{ architecture?: string }> };
    };
    nav.userAgentData?.getHighEntropyValues(['architecture'])
      .then(v => { if (v.architecture === 'arm') setArch('arm64'); })
      .catch(() => {});
  }, []);

  if (tag === '') return <Soon repo={repo} label="The first public Windows build is being prepared." />;
  const dl = `${repo}/releases/download/${tag}`;
  const track = () => { try { window.bcTrack?.('desktop_download', arch); } catch { /* noop */ } };

  return (
    <>
      <a className="dlw-btn" href={`${dl}/Busbar-Calculator-Setup-${arch}.exe`}
        aria-disabled={tag === null} onClick={track}>
        <WinIcon />
        Download for Windows {arch === 'arm64' ? '(ARM64)' : ''}
        {tag && <em className="dlw-ver">{tag.replace('desktop-', '')}</em>}
      </a>
      <div className="dlw-alts">
        <a href={`${dl}/Busbar-Calculator-Setup-x64.exe`} onClick={track}>x64 installer</a>
        <a href={`${dl}/Busbar-Calculator-Setup-arm64.exe`} onClick={track}>ARM64 installer</a>
        <a href={`${dl}/Busbar-Calculator-x64.msi`} onClick={track}>MSI (IT deploy)</a>
        <a href={`${dl}/SHA256SUMS.txt`}>checksums</a>
        <a href={`${repo}/releases`} target="_blank" rel="noopener noreferrer">all releases ↗</a>
      </div>
    </>
  );
}

function AndroidCta({ repo, tag }: { repo: string; tag: string | null }) {
  if (tag === '') return <Soon repo={repo} label="The first public Android build is being prepared." />;
  const dl = `${repo}/releases/download/${tag}`;
  const track = () => { try { window.bcTrack?.('android_download'); } catch { /* noop */ } };

  return (
    <>
      <a className="dlw-btn" href={`${dl}/Busbar-Calculator.apk`}
        aria-disabled={tag === null} onClick={track}>
        <AndroidIcon />
        Download APK for Android
        {tag && <em className="dlw-ver">{tag.replace('android-', '')}</em>}
      </a>
      <div className="dlw-alts">
        {PLAY_STORE_URL ? (
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer"
            onClick={() => { try { window.bcTrack?.('play_store_click'); } catch { /* noop */ } }}>
            Get it on Google Play ↗
          </a>
        ) : (
          <span className="dlw-play-soon">Google Play — coming soon</span>
        )}
        <a href={`${dl}/SHA256SUMS-android.txt`}>checksums</a>
        <a href={`${repo}/releases`} target="_blank" rel="noopener noreferrer">all releases ↗</a>
      </div>
    </>
  );
}

// Both platform CTAs; the visitor's own platform is listed first.
export function DownloadButtons({ repo }: { repo: string }) {
  const releases = useReleases(repo);
  const [isAndroid, setIsAndroid] = useState(false);
  useEffect(() => {
    setIsAndroid(/android/i.test(navigator.userAgent));
  }, []);

  const windows = <WindowsCta key="win" repo={repo} tag={releases.windows} />;
  const android = <AndroidCta key="and" repo={repo} tag={releases.android} />;

  return (
    <div className="dlw-cta">
      {isAndroid ? android : windows}
      <div className="dlw-divider" aria-hidden />
      {isAndroid ? windows : android}
    </div>
  );
}
