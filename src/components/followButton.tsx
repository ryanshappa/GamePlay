import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { useUser } from '@clerk/nextjs';

interface FollowButtonProps {
  profileId: string; // the profile to be followed/unfollowed
  initialIsFollowing: boolean;
  onFollowChange?: (newState: boolean) => void;
}

export function FollowButton({ profileId, initialIsFollowing, onFollowChange }: FollowButtonProps) {
  const { user } = useUser();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async () => {
    if (!user) {
      // Optionally, trigger the sign-in modal.
      return;
    }
    setLoading(true);
    const endpoint = isFollowing ? '/api/unfollowUser' : '/api/followUser';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: profileId }),
      });
      if (!response.ok) {
        console.error('Failed to update follow status');
        return;
      }
      const newState = !isFollowing;
      setIsFollowing(newState);
      if (onFollowChange) onFollowChange(newState);
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`${isFollowing ? 'bg-green-600' : 'bg-blue-600'} text-white px-4 py-2 rounded-full`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}
