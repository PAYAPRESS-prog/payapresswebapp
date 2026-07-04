import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FxResetPassword } from '@/components/figma/FxResetPassword';

export const metadata: Metadata = {
  title: 'Reset Password',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <FxResetPassword />
    </Suspense>
  );
}
