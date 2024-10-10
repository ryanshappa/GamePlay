import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useSignUp, useClerk } from '@clerk/nextjs';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import { FaGoogle } from 'react-icons/fa'; 

interface SignUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignIn: () => void; 
}

export function SignUpDialog({ open, onOpenChange, onSwitchToSignIn }: SignUpDialogProps) {
  const { signUp } = useSignUp();
  const { setActive } = useClerk();
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');

  React.useEffect(() => {
    if (signUp) {
      setEmail('');
      setPassword('');
    }
  }, [signUp]);

  const handleSignUp = async () => {
    if (!signUp) {
      console.error('SignUp function is not available');
      return;
    }
    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification();

      setPendingVerification(true);
    } catch (error: any) {
      console.error('Error signing up:', error);
      alert(error.errors[0]?.message || 'Failed to sign up');
    }
  };

  const handleVerifyEmail = async () => {
    if (signUp) {
      try {
        await signUp.attemptEmailAddressVerification({
          code,
        });
      } catch (error) {

      }
    } else {

    }
  };

  const handleGoogleSignUp = async () => {
    if (!signUp) {
      console.error('SignUp function is not available');
      return;
    }
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (error) {
      console.error('Error with Google sign-up:', error);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Overlay className="fixed inset-100 bg-gray-200" /> 
      <Dialog.Content className="fixed top-1/2 left-1/2 max-w-md w-full bg-gray-500 p-6 rounded-md transform -translate-x-1/2 -translate-y-1/2 text-white">
        {/* Darker Grey Background with White Text */}
        <Dialog.Title className="text-2xl font-bold mb-4">Sign Up</Dialog.Title>
        <Dialog.Close className="absolute top-2 right-2 text-white hover:text-gray-400">
          <Cross2Icon />
        </Dialog.Close>
        <div className="space-y-4">
          {pendingVerification ? (
            <>
              <Input
                type="text"
                placeholder="Verification Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-gray-500 text-white"
              />
              <Button
                className="w-full bg-gray-700 hover:bg-gray-800 text-white"
                onClick={handleVerifyEmail}
              >
                Verify Email
              </Button>
            </>
          ) : (
            <>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-500 text-white" 
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-500 text-white" 
              />
              <Button className="w-full bg-gray-700 hover:bg-gray-800 text-white" onClick={handleSignUp}>
                Sign Up
              </Button>
            </>
          )}
          <Button
            variant="outline"
            className="w-full flex items-center justify-center bg-gray-300 text-white hover:bg-gray-400"
            onClick={handleGoogleSignUp}
          >
            <FaGoogle className="h-5 w-5 mr-2" /> {/* Use FaGoogle icon */}
            Sign up with Google
          </Button>
          <div className="flex items-center justify-center space-x-2">
            <span className="h-px w-1/5 bg-gray-500"></span>
            <span className="text-gray-400">OR</span>
            <span className="h-px w-1/5 bg-gray-500"></span>
          </div>

        </div>
        <div className="mt-4 text-center">
          Already have an account?{' '}
          <Button
            variant="link"
            className="text-blue-500 hover:underline"
            onClick={() => {
              onOpenChange(false);
              onSwitchToSignIn();
            }}
          >
            Sign In
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}