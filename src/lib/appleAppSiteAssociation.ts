// Apple App Site Association — served at /.well-known/apple-app-site-association
// via a beforeFiles rewrite to /api/well-known/aasa (the app router ignores
// dot-folders, and the JSON must ship with content-type application/json).
//
// APPLE_TEAM_ID: set in the Hostinger env panel once known (Apple Developer →
// Membership). Until then the placeholder keeps universal links dormant
// without breaking anything else.

const TEAM_ID = process.env.APPLE_TEAM_ID ?? 'REPLACE_WITH_APPLE_TEAM_ID';
export const APP_ID = `${TEAM_ID}.com.payapress.calculator`;

export const APPLE_APP_SITE_ASSOCIATION = {
  applinks: {
    apps: [],
    details: [
      {
        appIDs: [APP_ID],
        components: [
          { '/': '/busbar-calculator*' },
          { '/': '/app/*' },
          { '/': '/reset-password*' },
          { '/': '/download*' },
        ],
      },
    ],
  },
  webcredentials: { apps: [APP_ID] },
};
