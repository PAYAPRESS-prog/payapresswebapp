import type { Metadata } from 'next';
import { FxWelcome } from '@/components/figma/FxWelcome';

export const metadata: Metadata = {
  title: 'Sign Up',
};

// Deep-link to the welcome gate with the auth sheet pre-opened on Sign Up.
export default function SignUpPage() {
  return <FxWelcome initialSheet="signup" />;
}
