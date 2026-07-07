/**
 * Digital Asset Links sanity — the Android TWA shows a URL bar (or App Links
 * silently stop verifying) if this file drifts. Guards:
 *  - valid JSON with the exact relation Android checks
 *  - package name matches the Gradle project's applicationId
 *  - fingerprints are either the documented placeholder or real SHA-256s
 */
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join(__dirname, '..', '..', '..');

describe('/.well-known/assetlinks.json', () => {
  const raw = fs.readFileSync(
    path.join(ROOT, 'public', '.well-known', 'assetlinks.json'),
    'utf8',
  );

  it('is valid JSON with the handle_all_urls relation', () => {
    const parsed = JSON.parse(raw);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].relation).toContain('delegate_permission/common.handle_all_urls');
    expect(parsed[0].target.namespace).toBe('android_app');
  });

  it('package name matches the Android project applicationId', () => {
    const parsed = JSON.parse(raw);
    const gradle = fs.readFileSync(
      path.join(ROOT, 'android', 'app', 'build.gradle'),
      'utf8',
    );
    const appId = gradle.match(/applicationId '([^']+)'/)?.[1];
    expect(appId).toBeTruthy();
    expect(parsed[0].target.package_name).toBe(appId);
  });

  it('fingerprints are real SHA-256s or the documented placeholder', () => {
    const parsed = JSON.parse(raw);
    const prints: string[] = parsed[0].target.sha256_cert_fingerprints;
    expect(prints.length).toBeGreaterThan(0);
    const sha256 = /^[0-9A-F]{2}(:[0-9A-F]{2}){31}$/;
    for (const p of prints) {
      if (p.startsWith('REPLACE_WITH')) continue; // pre-keystore placeholder
      expect(p).toMatch(sha256);
    }
  });

  it('launch URL in the Android strings points at our origin', () => {
    const strings = fs.readFileSync(
      path.join(ROOT, 'android', 'app', 'src', 'main', 'res', 'values', 'strings.xml'),
      'utf8',
    );
    expect(strings).toContain(
      'https://calculator.payapress.com/busbar-calculator?src=android-app',
    );
  });
});
