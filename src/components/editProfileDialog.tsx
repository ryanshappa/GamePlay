import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Cross2Icon } from '@radix-ui/react-icons';

export function EditProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user } = useUser();
  const [username, setUsername] = React.useState<string>(user?.username || '');
  const [bio, setBio] = React.useState<string>((user?.publicMetadata?.bio as string) || '');
  const [avatarUrl, setAvatarUrl] = React.useState<string>(user?.imageUrl || '');

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Optionally show a preview immediately
      // setAvatarUrl(URL.createObjectURL(file));

      try {
        // Upload the avatar
        await user?.setProfileImage({ file });

        // Refresh user data
        await user?.reload();

        // Update avatarUrl state with the new URL from Clerk
        setAvatarUrl(user?.imageUrl || '');

        // Update the avatar URL in your database
        const avatarUrl = user?.imageUrl;
        await fetch('/api/updateUserProfile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl }),
        });
      } catch (error: any) {
        console.error('Error uploading avatar:', error);
        const errorMessage =
          error.errors?.[0]?.longMessage ||
          error.errors?.[0]?.message ||
          error.message ||
          'Failed to upload avatar. Please try again.';
        alert(errorMessage);
      }
    }
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch('/api/updateUserProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          bio,
          avatarUrl: user?.imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile.');
      }

      // Refresh user data
      await user?.reload();

      alert('Profile updated successfully.');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage =
        error.errors?.[0]?.longMessage ||
        error.errors?.[0]?.message ||
        error.message ||
        'An error occurred while updating your profile. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-w-lg w-full bg-gray-800 p-6 rounded-md transform -translate-x-1/2 -translate-y-1/2 z-50 text-white">
          <Dialog.Title className="text-2xl font-bold mb-4">Edit Profile</Dialog.Title>
          <Dialog.Close className="absolute top-2 right-2 text-white hover:text-gray-400">
            <Cross2Icon />
          </Dialog.Close>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl} alt="Profile" />
                <AvatarFallback>{username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <Input type="file" accept="image/*" onChange={handleAvatarChange} />
              </div>
            </div>
            <div>
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-700 text-white"
              />
            </div>
            <div>
              <Textarea
                placeholder="Bio"
                value={bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                className="w-full h-32 bg-gray-700 text-white"
              />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
