import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '~/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Cross2Icon } from '@radix-ui/react-icons';
import { FaLink, FaDiscord, FaSteam, FaItchIo, FaYoutube } from 'react-icons/fa';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    displayName?: string | null;
    websiteUrl?: string | null;
    discordUrl?: string | null;
    steamUrl?: string | null;
    itchioUrl?: string | null;
    youtubeUrl?: string | null;
  };
}

export function EditProfileDialog({ open, onOpenChange, initialData }: EditProfileDialogProps) {
  const { user } = useAuth();
  const [username, setUsername] = React.useState<string>(user?.username || '');
  const [displayName, setDisplayName] = React.useState<string>(initialData?.displayName || '');
  const [bio, setBio] = React.useState<string>((user?.publicMetadata?.bio as string) || '');
  const [avatarUrl, setAvatarUrl] = React.useState<string>(user?.imageUrl || '');
  const [websiteUrl, setWebsiteUrl] = React.useState<string>(initialData?.websiteUrl || '');
  const [discordUrl, setDiscordUrl] = React.useState<string>(initialData?.discordUrl || '');
  const [steamUrl, setSteamUrl] = React.useState<string>(initialData?.steamUrl || '');
  const [itchioUrl, setItchioUrl] = React.useState<string>(initialData?.itchioUrl || '');
  const [youtubeUrl, setYoutubeUrl] = React.useState<string>(initialData?.youtubeUrl || '');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Update local state when user data is loaded
  React.useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setBio((user.publicMetadata?.bio as string) || '');
      setAvatarUrl(user.imageUrl || '');
    }
  }, [user]);

  // Update social links and displayName when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setDisplayName(initialData.displayName || '');
      setWebsiteUrl(initialData.websiteUrl || '');
      setDiscordUrl(initialData.discordUrl || '');
      setSteamUrl(initialData.steamUrl || '');
      setItchioUrl(initialData.itchioUrl || '');
      setYoutubeUrl(initialData.youtubeUrl || '');
    }
  }, [initialData]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a temporary URL for preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);

      try {
        // Create a FormData object to upload the file
        const formData = new FormData();
        formData.append('avatar', file);
        
        const response = await fetch('/api/uploadAvatar', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload avatar');
        }
        
        const data = await response.json();
        setAvatarUrl(data.avatarUrl);
      } catch (error: any) {
        console.error('Error uploading avatar:', error);
        alert('Failed to upload avatar. Please try again.');
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/updateUserProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          displayName,
          bio,
          avatarUrl,
          websiteUrl,
          discordUrl,
          steamUrl,
          itchioUrl,
          youtubeUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile.');
      }

      alert('Profile updated successfully.');
      onOpenChange(false);
      
      // Force a refresh of the auth context
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(error.message || 'An error occurred while updating your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background opacity-50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-w-lg w-full max-h-[90vh] overflow-y-auto bg-muted p-6 rounded-md transform -translate-x-1/2 -translate-y-1/2 z-50 text-foreground">
          <Dialog.Title className="text-2xl font-bold mb-4">Edit Profile</Dialog.Title>
          <Dialog.Close className="absolute top-2 right-2 text-foreground hover:text-gray-400">
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
              <label className="text-sm text-muted-foreground mb-1 block">Display Name</label>
              <Input
                placeholder="Your name (e.g., Ryan Shappa)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-muted text-foreground"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Username</label>
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-muted text-foreground"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Bio</label>
              <Textarea
                placeholder="Bio"
                value={bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                className="w-full h-32 bg-muted text-foreground"
              />
            </div>

            {/* Social Links Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Social Links</h3>
              
              <div className="flex items-center space-x-2">
                <FaLink className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Website URL (e.g., https://yoursite.com)"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full bg-muted text-foreground"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <FaDiscord className="w-5 h-5 text-[#5865F2] flex-shrink-0" />
                <Input
                  placeholder="Discord invite URL"
                  value={discordUrl}
                  onChange={(e) => setDiscordUrl(e.target.value)}
                  className="w-full bg-muted text-foreground"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <FaSteam className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Steam profile URL"
                  value={steamUrl}
                  onChange={(e) => setSteamUrl(e.target.value)}
                  className="w-full bg-muted text-foreground"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <FaItchIo className="w-5 h-5 text-[#FA5C5C] flex-shrink-0" />
                <Input
                  placeholder="itch.io profile URL"
                  value={itchioUrl}
                  onChange={(e) => setItchioUrl(e.target.value)}
                  className="w-full bg-muted text-foreground"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <FaYoutube className="w-5 h-5 text-[#FF0000] flex-shrink-0" />
                <Input
                  placeholder="YouTube channel URL"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full bg-muted text-foreground"
                />
              </div>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-foreground" 
              onClick={handleSaveChanges}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
