import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { FxWelcome } from '@/components/figma/FxWelcome';

// The welcome screen reads the session cookie, so it must be dynamic.
export const dynamic = 'force-dynamic';

export default async function WelcomePage() {
  // If the visitor already has a valid session, skip the welcome gate
  // entirely and drop them straight onto the app menu (second screen).
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token && (await verifySessionToken(token))) {
    redirect('/app');
  }

  return <FxWelcome />;
}
