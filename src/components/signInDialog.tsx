import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useSignIn, useClerk } from '@clerk/nextjs';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import { FcGoogle } from 'react-icons/fc'; // Import Google icon from react-icons

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignUp: () => void; 
}

export function SignInDialog({ open, onOpenChange, onSwitchToSignUp }: SignInDialogProps) {
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  React.useEffect(() => {
    if (signIn) {
      setEmail('');
      setPassword('');
    }
  }, [signIn]);

  const handleSignIn = async () => {
    if (!signIn) {
      console.error('SignIn function is not available');
      return;
    }
    try {
      const completeSignIn = await signIn.create({
        identifier: email,
        password,
      });

      if (completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId });
        onOpenChange(false);
      } else {
        console.log('Additional steps required:', completeSignIn.status);
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      alert(error.errors[0]?.message || 'Invalid credentials');
    }
  };

  const handleGoogleSignIn = async () => {
    if (!signIn) {
      console.error('SignIn function is not available');
      return;
    }
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (error) {
      console.error('Error with Google sign-in:', error);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" /> 
      <Dialog.Content className="fixed top-1/2 left-1/2 max-w-md w-full bg-gray-500 p-6 rounded-md transform -translate-x-1/2 -translate-y-1/2 text-white">
        {/* Darker Grey Background with White Text */}
        <Dialog.Title className="text-2xl font-bold mb-4">Sign In</Dialog.Title>
        <Dialog.Close className="absolute top-2 right-2 text-white hover:text-gray-400">
          <Cross2Icon />
        </Dialog.Close>
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-500 text-white" 
          /> {/* Light Grey Input Background */}
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-500 text-white" 
          />
          <Button className="w-full bg-gray-700 hover:bg-gray-800 text-white" onClick={handleSignIn}>
            Sign In
          </Button>
          <div className="flex items-center justify-center space-x-2">
            <span className="h-px w-1/5 bg-gray-500"></span>
            <span className="text-gray-400">OR</span>
            <span className="h-px w-1/5 bg-gray-500"></span>
          </div>

        </div>
        <div className="mt-4 text-center">
          Don't have an account?{' '}
          <Button
            variant="link"
            className="text-blue-500 hover:underline"
            onClick={() => {
              onOpenChange(false);
              onSwitchToSignUp();
            }}
          >
            Sign Up
          </Button>
        </div>
        <Button
          variant="outline"
          className="w-full flex items-center justify-center bg-gray-300 text-white hover:bg-gray-400"
          onClick={handleGoogleSignIn}
        >
          <FcGoogle className="h-5 w-5 mr-2" /> {/* Use the new Google icon */}
          Sign in with Google
        </Button>
      </Dialog.Content>
    </Dialog.Root>
  );
}