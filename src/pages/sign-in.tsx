import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { SignInDialog } from 'src/components/signInDialog';

export default function SignInPage() {
  const [open, setOpen] = React.useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      router.push('/');
    }
  }, [open, router]);

  return <SignInDialog open={open} onOpenChange={setOpen} onSwitchToSignUp={() => router.push('/sign-up')} />;
}