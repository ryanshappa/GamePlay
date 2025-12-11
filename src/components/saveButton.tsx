import React, { useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { useAuth } from '~/contexts/AuthContext';

interface SaveButtonProps {
  postId: string;
  initialSaved: boolean;
  /** "default" or "large" for size */
  size?: 'default' | 'large';
}

export function SaveButton({ postId, initialSaved, size = 'default' }: SaveButtonProps) {
  const { user } = useAuth();
  const [saved, setSaved] = React.useState(initialSaved);
  const [loading, setLoading] = React.useState(false);

  // On mount, if the user is signed in, fetch the actual save status.
  useEffect(() => {
    if (user) {
      fetch(`/api/posts/${postId}/isSaved`)
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.saved === 'boolean') {
            setSaved(data.saved);
          }
        })
        .catch((err) => console.error("Error fetching save status:", err));
    }
  }, [user, postId]);

  const handleClick = async () => {
    if (!user || loading) return;
    setLoading(true);

    // Store the old state in case we need to revert.
    const oldSaved = saved;
    const newSaved = !oldSaved;
    // Optimistically update the UI.
    setSaved(newSaved);

    const method = oldSaved ? 'DELETE' : 'POST';

    try {
      const response = await fetch(`/api/posts/${postId}/save`, { method });
      if (!response.ok) {
        // If API call fails, revert to the old state.
        setSaved(oldSaved);
        console.error('Failed to update save status.');
      }
    } catch (error) {
      setSaved(oldSaved);
      console.error('Error updating save status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Size classes
  const buttonSizeClasses = size === 'large' ? 'h-14 w-14' : 'h-10 w-10';
  const iconSizeClasses = size === 'large' ? 'h-8 w-8' : 'h-6 w-6';

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`rounded-full bg-muted hover:bg-foreground/20 flex items-center justify-center ${buttonSizeClasses}`}
    >
      <Bookmark
        className={`${iconSizeClasses} ${saved ? 'text-yellow-400' : 'text-foreground'}`}
        fill={saved ? 'currentColor' : 'none'}
      />
    </button>
  );
}
