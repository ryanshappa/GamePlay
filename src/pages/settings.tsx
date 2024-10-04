import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@clerk/nextjs';
import { Button } from '~/components/ui/button';
import Layout from '~/components/layout'; // Adjust the import path as necessary

const SettingsPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      router.push('/sign-in');
    }
  }, [userId, router]);

  if (!userId) {
    return null; // or a loading spinner
  }

  const handleDeleteAccount = () => {
    // Implement account deletion logic
    alert('Delete Account functionality not implemented yet.');
  };

  const handleFeedback = () => {
    // Implement feedback/report bug logic
    alert('Feedback/Report Bug functionality not implemented yet.');
  };

  return (
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <Button onClick={handleDeleteAccount} className="mb-4" variant="destructive">
          Delete Account
        </Button>
        <Button onClick={handleFeedback}>
          Send Feedback / Report Bug
        </Button>
      </div>
  );
};

export default SettingsPage;
