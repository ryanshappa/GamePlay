import { SignIn, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const SignInPage = () => {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      // Redirect to home page if already signed in
      router.replace('/');
    }
  }, [isSignedIn, router]);

  return (
    isSignedIn ? null : (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-full max-w-md p-8 bg-gray-800 rounded shadow">
          <SignIn routing="hash" />
        </div>
      </div>
    )
  );
};

// Specify that this page should not use the global Layout
SignInPage.getLayout = (page: React.ReactElement) => page;

export default SignInPage;