import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSignIn, useSignUp } from '@clerk/nextjs';

export default function SsoCallback() {
  const router = useRouter();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

  useEffect(() => {
    const completeSignIn = async () => {
      try {
        // Provide required parameters for authenticateWithRedirect
        await signIn?.authenticateWithRedirect({
          redirectUrl: '/', 
          redirectUrlComplete: '/', 
          strategy: 'oauth_google' 
        });
        router.push('/');
      } catch (error) {
        console.error('Error completing sign-in:', error);
      }
    };

    const completeSignUp = async () => {
      try {
        await signUp?.authenticateWithRedirect({
          redirectUrl: '/', 
          redirectUrlComplete: '/',
          strategy: 'oauth_google' 
        });
        router.push('/');
      } catch (error) {
        console.error('Error completing sign-up:', error);
      }
    };

    if (signIn) {
      completeSignIn();
    }

    if (signUp) {
      completeSignUp();
    }
  }, [router, signIn, signUp]);

  return <div>Completing sign-in...</div>;
}
