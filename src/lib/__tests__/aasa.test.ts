/**
 * apple-app-site-association sanity — universal links silently die if this
 * drifts. Mirrors the assetlinks.json test for Android.
 */
import { APPLE_APP_SITE_ASSOCIATION, APP_ID } from '../appleAppSiteAssociation';

describe('apple-app-site-association', () => {
  it('declares the app for applinks + webcredentials', () => {
    const details = APPLE_APP_SITE_ASSOCIATION.applinks.details;
    expect(details.length).toBeGreaterThan(0);
    expect(details[0].appIDs).toContain(APP_ID);
    expect(APPLE_APP_SITE_ASSOCIATION.webcredentials.apps).toContain(APP_ID);
  });

  it('app id is TEAMID.bundle with our bundle id', () => {
    // Placeholder until APPLE_TEAM_ID is configured; real team ids are 10
    // alphanumeric chars.
    expect(APP_ID.endsWith('.com.payapress.calculator')).toBe(true);
    const teamId = APP_ID.split('.')[0];
    expect(
      teamId === 'REPLACE_WITH_APPLE_TEAM_ID' || /^[A-Z0-9]{10}$/.test(teamId),
    ).toBe(true);
  });

  it('covers the calculator, app and reset-password paths', () => {
    const comps = APPLE_APP_SITE_ASSOCIATION.applinks.details[0].components
      .map(c => c['/']);
    expect(comps).toEqual(expect.arrayContaining([
      '/busbar-calculator*', '/app/*', '/reset-password*',
    ]));
  });
});
