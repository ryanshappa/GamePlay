import React from 'react';
import { HeartIcon } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const { isSignedIn } = useAuth();
  const [liked, setLiked] = React.useState(initialLiked);
  const [count, setCount] = React.useState(initialCount);

  // new loading state
  const [likeLoading, setLikeLoading] = React.useState(false);

  const handleClick = async () => {
    if (!isSignedIn) {
      return;
    }

    // If a request is already in progress, ignore further clicks
    if (likeLoading) {
      return;
    }
    setLikeLoading(true);

    const method = liked ? 'DELETE' : 'POST';

    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method,
      });

      if (!response.ok) {
        // Revert UI changes if API call fails
        setLiked(liked);
        setCount(liked ? count + 1 : count - 1);
        console.error('Failed to update like status.');
      }
    } catch (error) {
      // Revert UI changes on error
      setLiked(liked);
      setCount(liked ? count + 1 : count - 1);
      console.error('Error updating like status:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        className="rounded-full bg-gray-800 hover:bg-gray-700 p-2"
        onClick={handleClick}
        disabled={likeLoading}  // optionally disable the button
      >
        <HeartIcon
          className={`h-6 w-6 ${liked ? 'text-red-500' : 'text-white'}`}
          fill={liked ? 'currentColor' : 'none'}
        />
      </button>
      <span className="text-white mt-1">{count}</span>
    </div>
  );
}
