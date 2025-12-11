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
  const [errors, setErrors] = React.useState<Record<string, string>>({});

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

  const isEmpty = (val?: string | null) => !val || val.trim() === '';

  const validators = {
    website: (val: string) =>
      isEmpty(val) || /^https:\/\/[^\s/$.?#].[^\s]*$/i.test(val),
    discord: (val: string) =>
      isEmpty(val) || val.startsWith('https://discord.gg/') || val.startsWith('https://discord.com/invite/'),
    steam: (val: string) =>
      isEmpty(val) || val.startsWith('https://steamcommunity.com/') || val.startsWith('https://s.team/'),
    itchio: (val: string) =>
      isEmpty(val) || /^https:\/\/[a-z0-9-]+\.itch\.io(\/.*)?$/i.test(val),
    youtube: (val: string) =>
      isEmpty(val) || val.startsWith('https://www.youtube.com/') || val.startsWith('https://youtube.com/') || val.startsWith('https://youtu.be/'),
  };

  const validateLinks = () => {
    const newErrors: Record<string, string> = {};
    const website = websiteUrl.trim();
    const discord = discordUrl.trim();
    const steam = steamUrl.trim();
    const itchio = itchioUrl.trim();
    const youtube = youtubeUrl.trim();

    if (!validators.website(website)) newErrors.websiteUrl = 'Website must start with https:// and be a valid URL.';
    if (!validators.discord(discord)) newErrors.discordUrl = 'Discord must be https://discord.gg/... or https://discord.com/invite/....';
    if (!validators.steam(steam)) newErrors.steamUrl = 'Steam must be https://steamcommunity.com/... or https://s.team/...';
    if (!validators.itchio(itchio)) newErrors.itchioUrl = 'itch.io must be https://yourname.itch.io/...';
    if (!validators.youtube(youtube)) newErrors.youtubeUrl = 'YouTube must be https://youtube.com/... or https://youtu.be/...';

    // Normalize trimmed values so users can clear fields and save
    setWebsiteUrl(website);
    setDiscordUrl(discord);
    setSteamUrl(steam);
    setItchioUrl(itchio);
    setYoutubeUrl(youtube);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    const isValid = validateLinks();
    if (!isValid) {
      alert('Please fix the invalid social links before saving.');
      return;
    }
    
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
          websiteUrl: websiteUrl.trim(),
          discordUrl: discordUrl.trim(),
          steamUrl: steamUrl.trim(),
          itchioUrl: itchioUrl.trim(),
          youtubeUrl: youtubeUrl.trim(),
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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-w-lg w-full max-h-[90vh] overflow-y-auto bg-background p-6 rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-50 text-foreground border border-input">
          <Dialog.Title className="text-2xl font-bold mb-4">Edit Profile</Dialog.Title>
          <Dialog.Close className="absolute top-3 right-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
            <Cross2Icon className="h-4 w-4" />
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
              
              <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <FaLink className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Website URL (e.g., https://yoursite.com)"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full bg-muted text-foreground"
                />
                </div>
                {errors.websiteUrl && <p className="text-sm text-destructive">{errors.websiteUrl}</p>}
              </div>
              
              <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <FaDiscord className="w-5 h-5 text-[#5865F2] flex-shrink-0" />
                <Input
                  placeholder="Discord invite URL"
                  value={discordUrl}
                  onChange={(e) => setDiscordUrl(e.target.value)}
                  className="w-full bg-muted text-foreground"
                />
                </div>
                {errors.discordUrl && <p className="text-sm text-destructive">{errors.discordUrl}</p>}
              </div>
              
              <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <FaSteam className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Steam profile URL"
                  value={steamUrl}
                  onChange={(e) => setSteamUrl(e.target.value)}
                  className="w-full bg-muted text-foreground"
                />
                </div>
                {errors.steamUrl && <p className="text-sm text-destructive">{errors.steamUrl}</p>}
              </div>
              
              <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <FaItchIo className="w-5 h-5 text-[#FA5C5C] flex-shrink-0" />
                <Input
                  placeholder="itch.io profile URL"
                  value={itchioUrl}
                  onChange={(e) => setItchioUrl(e.target.value)}
                  className="w-full bg-muted text-foreground"
                />
                </div>
                {errors.itchioUrl && <p className="text-sm text-destructive">{errors.itchioUrl}</p>}
              </div>
              
              <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <FaYoutube className="w-5 h-5 text-[#FF0000] flex-shrink-0" />
                <Input
                  placeholder="YouTube channel URL"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full bg-muted text-foreground"
                />
                </div>
                {errors.youtubeUrl && <p className="text-sm text-destructive">{errors.youtubeUrl}</p>}
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
