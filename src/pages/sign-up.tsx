import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { SignUpDialog } from 'src/components/signUpDialog';

export default function SignUpPage() {
  const [open, setOpen] = React.useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      router.push('/');
    }
  }, [open, router]);

  return <SignUpDialog open={open} onOpenChange={setOpen} onSwitchToSignIn={() => router.push('/sign-in')} />;
}